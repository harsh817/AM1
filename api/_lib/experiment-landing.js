import { getHeader } from "./http.js";
import { forwardMakeWebhookPayload } from "./make.js";

const MAX_TEXT_LENGTH = 128;
const recentRequests = new Map();

export async function recordExperimentLanding({ payload = {}, req, forwardWebhook = forwardMakeWebhookPayload } = {}) {
  const visitorId = clean(payload.visitor_id);
  const variant = clean(payload.page_variant);
  const entryType = clean(payload.entry_type);
  if (!visitorId || !["AM", "AM2"].includes(variant) || !["randomized", "direct"].includes(entryType)) {
    const error = new Error("Invalid experiment landing payload.");
    error.statusCode = 400;
    throw error;
  }

  const experimentId = clean(payload.experiment_id);
  const dedupeKey = `${experimentId || "direct"}:${visitorId}:${variant}`;
  const now = Date.now();
  const requestKey = `${getHeader(req, "x-forwarded-for")}:${dedupeKey}`;
  if (recentRequests.has(requestKey) && now - recentRequests.get(requestKey) < 60 * 60 * 1000) {
    return { recorded: false, duplicate: true };
  }
  recentRequests.set(requestKey, now);
  pruneRecentRequests(now);

  const marketing = payload.marketing || {};
  await forwardWebhook({
    event_name: "experiment.landing_view",
    event_timestamp: new Date().toISOString(),
    sheet_name: "experiment_landing",
    idempotency_key: dedupeKey,
    experiment_id: experimentId,
    visitor_id: visitorId,
    page_variant: variant,
    entry_type: entryType,
    landing_path: clean(payload.landing_path),
    utm_source: clean(marketing.source),
    utm_medium: clean(marketing.medium),
    utm_campaign: clean(marketing.campaign),
    utm_content: clean(marketing.content),
    utm_term: clean(marketing.term),
    utm_id: clean(marketing.id),
  });

  return { recorded: true };
}

function pruneRecentRequests(now) {
  for (const [key, timestamp] of recentRequests) {
    if (now - timestamp >= 60 * 60 * 1000) recentRequests.delete(key);
  }
}

function clean(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, MAX_TEXT_LENGTH);
}
