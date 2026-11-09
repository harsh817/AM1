import { getHeader } from "./http.js";
import { recordConvexQuizEvent, settleConvexQuizDelivery } from "./convex.js";
import { forwardMakeWebhookPayload } from "./make.js";

const EVENT_TYPES = new Set(["quiz_started", "quiz_completed", "checkout_started"]);
const CAMPAIGN_FIELDS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "utm_id", "gclid", "gbraid", "wbraid", "fbclid"];
const limits = new Map();

export async function recordQuizEvent({ payload = {}, req, now = Date.now(), recordEvent = recordConvexQuizEvent, forwardWebhook = forwardMakeWebhookPayload, settleDelivery = settleConvexQuizDelivery } = {}) {
  const eventType = clean(payload.event_type, 48);
  const visitorId = clean(payload.visitor_id, 128);
  const version = clean(payload.quiz_version, 64);
  if (!EVENT_TYPES.has(eventType) || !visitorId || !version || payload.answers || payload.age || payload.contact || payload.photos) {
    const error = new Error("Invalid quiz event payload.");
    error.statusCode = 400;
    throw error;
  }
  const remoteKey = clean(getHeader(req, "x-forwarded-for")?.split(",")[0], 80) || "unknown";
  const current = limits.get(remoteKey);
  if (!current || now - current.start >= 60_000) limits.set(remoteKey, { start: now, count: 1 });
  else if (++current.count > 90) {
    const error = new Error("Quiz event rate limit exceeded.");
    error.statusCode = 429;
    throw error;
  }
  const campaign = Object.fromEntries(CAMPAIGN_FIELDS.map((key) => [toConvexCampaignKey(key), clean(payload.campaign?.[key], 256)]).filter(([, value]) => value));
  const sheetCampaign = Object.fromEntries(CAMPAIGN_FIELDS.map((key) => [key, campaign[toConvexCampaignKey(key)] || ""]));
  const eventId = `${version}:${visitorId}:${eventType}`;
  const result = await recordEvent({ eventId, eventType, visitorId, quizVersion: version, campaign, occurredAt: now });
  if (result?.configured === false) throw new Error("Quiz event reporting is not configured.");
  if (result?.delivery === "delivered") return { recorded: true, duplicate: true };
  if (result?.delivery === "busy") throw new Error("Quiz event delivery is already in progress.");
  let delivered = false;
  try {
    const result = await forwardWebhook({
      event_name: `styleiq.${eventType}`,
      event_timestamp: new Date(now).toISOString(),
      sheet_name: "styleiq_quiz_events",
      idempotency_key: eventId,
      quiz_source: "style-quiz",
      quiz_version: version,
      visitor_id: visitorId,
      ...sheetCampaign,
    });
    delivered = result?.sent === true && result?.ok === true;
  } finally {
    await settleDelivery({ eventId, lease: now, delivered });
  }
  if (!delivered) throw new Error("Quiz event delivery failed.");
  return { recorded: true, duplicate: Boolean(result?.duplicate) };
}

function toConvexCampaignKey(key) {
  return key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

function clean(value, max = 256) {
  return String(value ?? "").replace(/[\r\n\t]/g, " ").trim().slice(0, max);
}
