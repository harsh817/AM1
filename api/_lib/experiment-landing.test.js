import assert from "node:assert/strict";
import test from "node:test";
import { recordExperimentLanding } from "./experiment-landing.js";

test("records a validated landing event with an idempotency key", async () => {
  const payloads = [];
  const result = await recordExperimentLanding({
    req: { headers: { "x-forwarded-for": "198.51.100.41" } },
    payload: {
      experiment_id: "am-test-landing-1",
      visitor_id: "visitor-test-1",
      page_variant: "AM2",
      entry_type: "randomized",
      landing_path: "/AM2",
      marketing: { term: "AM2" },
    },
    forwardWebhook: async (payload) => payloads.push(payload),
  });

  assert.deepEqual(result, { recorded: true });
  assert.equal(payloads[0].sheet_name, "experiment_landing");
  assert.equal(payloads[0].page_variant, "AM2");
  assert.equal(payloads[0].idempotency_key, "am-test-landing-1:visitor-test-1:AM2");
});

test("rejects an invalid landing variant", async () => {
  await assert.rejects(
    () => recordExperimentLanding({
      req: { headers: {} },
      payload: { visitor_id: "visitor-test-2", page_variant: "B" },
      forwardWebhook: async () => undefined,
    }),
    (error) => error.statusCode === 400,
  );
});

test("accepts marked test traffic without treating it as randomized", async () => {
  let payload;
  const result = await recordExperimentLanding({
    req: { headers: { "x-forwarded-for": "198.51.100.42" } },
    payload: {
      experiment_id: "am-test-landing-2",
      visitor_id: "visitor-test-3",
      page_variant: "AM",
      entry_type: "test",
    },
    forwardWebhook: async (nextPayload) => { payload = nextPayload; },
  });

  assert.deepEqual(result, { recorded: true });
  assert.equal(payload.entry_type, "test");
});
