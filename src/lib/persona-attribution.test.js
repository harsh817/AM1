import test from "node:test";
import assert from "node:assert/strict";
import { getExperimentContext, resolveLandingRoute } from "./ab-testing.js";
import { rememberCheckoutVisit, getCheckoutTrackingPayload, rememberCheckoutOrderTracking, getCheckoutOrderTrackingPayload } from "./checkout-tracking.js";
import { buildConvexAttribution } from "../../api/_lib/convex.js";
import { recordExperimentLanding } from "../../api/_lib/experiment-landing.js";
import { recordExperimentCheckout } from "../../api/_lib/experiment-checkout.js";

function storage() {
  const values = new Map();
  return { getItem: (key) => values.get(key), setItem: (key, value) => values.set(key, value) };
}

test("persona campaign and identity remain frozen against an order", () => {
  const location = new URL("https://thriveonp.com/style-for-your-complexion?utm_source=fb&utm_medium=Dark+Skin&utm_campaign=Test&utm_content=Ad&utm_id=123&fbclid=click");
  const context = { location, storage: storage(), sessionStorage: storage(), document: { cookie: "" } };
  getExperimentContext(context);
  location.pathname = "/a-m-checkout";
  rememberCheckoutVisit(context);
  const tracking = getCheckoutTrackingPayload(context);
  assert.equal(tracking.marketing.term, "COMPLEXION");
  assert.equal(tracking.marketing.medium, "Dark Skin");
  assert.equal(tracking.marketing.fbclid, "click");
  const attribution = buildConvexAttribution(tracking);
  assert.equal(attribution.variant, "COMPLEXION");
  assert.equal(attribution.experimentId, "");
  assert.equal(attribution.entryType, "direct");
  rememberCheckoutOrderTracking("test-order", tracking, context);
  location.pathname = "/a-m";
  resolveLandingRoute(context, { enabled: false });
  assert.deepEqual(getCheckoutOrderTrackingPayload("test-order", context).experiment, tracking.experiment);
});

test("persona landing and checkout share attribution and cannot join the experiment", async () => {
  const saved = [];
  const forwarded = [];
  const payload = { experiment_id: "old-experiment", visitor_id: "persona-test", page_variant: "COMPLEXION", entry_type: "direct", marketing: { term: "COMPLEXION", medium: "Dark Skin" } };
  const input = { payload, req: { headers: {} }, forwardWebhook: async (row) => forwarded.push(row) };
  const record = async (row) => { saved.push(row); return { recorded: true }; };
  await recordExperimentLanding({ ...input, recordLanding: record });
  await recordExperimentCheckout({ ...input, recordCheckout: record });
  assert.deepEqual(saved[0].attribution, saved[1].attribution);
  assert.equal(saved[0].attribution.experimentId, "");
  assert.equal(forwarded[1].page_variant, "COMPLEXION");
  for (const handler of [recordExperimentLanding, recordExperimentCheckout]) {
    await assert.rejects(handler({ ...input, payload: { ...payload, entry_type: "randomized" } }), { statusCode: 400 });
  }
});

test("failed landing persistence permits a retry with the same visitor", async () => {
  const input = { payload: { visitor_id: "retry-persona", page_variant: "COMPLEXION", entry_type: "direct" }, req: { headers: {} }, forwardWebhook: async () => ({ sent: true }) };
  await assert.rejects(recordExperimentLanding({ ...input, recordLanding: async () => { throw new Error("unavailable"); } }));
  assert.deepEqual(await recordExperimentLanding({ ...input, recordLanding: async () => ({ recorded: true }) }), { recorded: true });
});
