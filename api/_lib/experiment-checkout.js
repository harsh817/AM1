import { getHeader } from "./http.js";
import { forwardMakeWebhookPayload } from "./make.js";
import { recordConvexCheckoutVisit } from "./convex.js";

export async function recordExperimentCheckout({ payload = {}, req, forwardWebhook = forwardMakeWebhookPayload } = {}) {
  const visitorId = clean(payload.visitor_id);
  const variant = clean(payload.page_variant);
  const entryType = clean(payload.entry_type);
  if (!visitorId || !["AM", "AM2"].includes(variant) || !["randomized", "direct", "test"].includes(entryType)) {
    const error = new Error("Invalid checkout visit payload.");
    error.statusCode = 400;
    throw error;
  }

  const experimentId = clean(payload.experiment_id);
  const dedupeKey = `${experimentId || "direct"}:${visitorId}:${variant}:checkout`;
  const marketing = payload.marketing || {};
  const event = {
    event_name: "experiment.checkout_view",
    event_timestamp: new Date().toISOString(),
    sheet_name: "experiment_checkout",
    idempotency_key: dedupeKey,
    experiment_id: experimentId,
    visitor_id: visitorId,
    page_variant: variant,
    entry_type: entryType,
    utm_source: clean(marketing.source),
    utm_medium: clean(marketing.medium),
    utm_campaign: clean(marketing.campaign),
    utm_content: clean(marketing.content),
    utm_term: clean(marketing.term),
    utm_id: clean(marketing.id),
    forwarded_for: getHeader(req, "x-forwarded-for"),
  };
  await forwardWebhook(event);
  await recordConvexCheckoutVisit({
    dedupeKey,
    eventType: "checkout_visit",
    occurredAt: Date.now(),
    attribution: {
      experimentId,
      visitorId,
      variant,
      entryType,
      utmSource: clean(marketing.source),
      utmMedium: clean(marketing.medium),
      utmCampaign: clean(marketing.campaign),
      utmContent: clean(marketing.content),
      utmTerm: clean(marketing.term),
      utmId: clean(marketing.id),
      gclid: clean(marketing.gclid),
      gbraid: clean(marketing.gbraid),
      wbraid: clean(marketing.wbraid),
      fbclid: clean(marketing.fbclid),
    },
  });
  return { recorded: true };
}

function clean(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, 256);
}
