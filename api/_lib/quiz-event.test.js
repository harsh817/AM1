import assert from "node:assert/strict";
import test from "node:test";
import { recordQuizEvent } from "./quiz-event.js";

test("records only quiz stage, visitor, version and campaign fields", async () => {
  let saved;
  let forwarded;
  const result = await recordQuizEvent({
    payload: { event_type: "quiz_completed", visitor_id: "visitor-1", quiz_version: "v1", campaign: { utm_campaign: "spring", fbclid: "click-1" } },
    req: { headers: { "x-forwarded-for": "127.0.0.1" } },
    now: 1000,
    settleDelivery: async () => {},
    recordEvent: async (event) => { saved = event; return { recorded: true }; },
    forwardWebhook: async (event) => { forwarded = event; return { sent: true, ok: true }; },
  });
  assert.equal(result.recorded, true);
  assert.equal(saved.eventType, "quiz_completed");
  assert.equal(saved.campaign.utmCampaign, "spring");
  assert.equal(saved.answers, undefined);
  assert.equal(forwarded.visitor_id, "visitor-1");
  assert.equal(forwarded.utm_campaign, "spring");
});

test("rejects raw quiz answers, ages, contact details, and photo payloads", async () => {
  for (const sensitive of [{ answers: { focus: "fit" } }, { age: "25-34" }, { contact: { email: "x@example.com" } }, { photos: ["url"] }]) {
    await assert.rejects(recordQuizEvent({ payload: { event_type: "quiz_started", visitor_id: "v", quiz_version: "v1", ...sensitive }, recordEvent: async () => ({ recorded: true }), forwardWebhook: async () => ({ sent: true, ok: true }) }), { statusCode: 400 });
  }
});

test("limits quiz events per request source", async () => {
  const recordEvent = async () => ({ recorded: true });
  const forwardWebhook = async () => ({ sent: true, ok: true });
  const req = { headers: { "x-forwarded-for": "rate-test" } };
  for (let index = 0; index < 90; index += 1) {
    await recordQuizEvent({ payload: { event_type: "quiz_started", visitor_id: `v-${index}`, quiz_version: "v1" }, req, now: 10_000, recordEvent, forwardWebhook, settleDelivery: async () => {} });
  }
  await assert.rejects(recordQuizEvent({ payload: { event_type: "quiz_started", visitor_id: "v-last", quiz_version: "v1" }, req, now: 10_000, recordEvent, forwardWebhook, settleDelivery: async () => {} }), { statusCode: 429 });
});

test("does not forward an event again after Make acknowledged delivery", async () => {
  const result = await recordQuizEvent({
    payload: { event_type: "quiz_started", visitor_id: "duplicate", quiz_version: "v1" },
    recordEvent: async () => ({ duplicate: true, delivery: "delivered" }),
    forwardWebhook: async () => assert.fail("Already delivered"),
  });
  assert.equal(result.duplicate, true);
});

test("a failed Make response releases the delivery claim and reports failure", async () => {
  const claims = [];
  await assert.rejects(recordQuizEvent({
    payload: { event_type: "quiz_started", visitor_id: "failed", quiz_version: "v1" },
    now: 1001,
    recordEvent: async () => ({ delivery: "claimed" }),
    forwardWebhook: async () => ({ sent: true, ok: false }),
    settleDelivery: async (claim) => claims.push(claim),
  }), /Quiz event delivery failed/);
  assert.deepEqual(claims, [{ eventId: "v1:failed:quiz_started", lease: 1001, delivered: false }]);
});
