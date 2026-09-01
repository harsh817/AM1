import assert from "node:assert/strict";
import test from "node:test";
import { forwardMakeWebhook, forwardMakeWebhookPayload } from "./make.js";

test("sends direct payloads to the shared Make webhook URL", async () => {
  const calls = await withMockedFetch(async () => {
    process.env.MAKE_WEBHOOK_URL = "https://make.example/tracking";

    const result = await forwardMakeWebhookPayload({
      event_name: "checkout.payment_initiated",
      sheet_name: "payment_initiated",
    });

    assert.deepEqual(result, { sent: true, status: 202, ok: true });
  });

  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "https://make.example/tracking");
  assert.ok(calls[0].options.signal instanceof AbortSignal);
  assert.deepEqual(JSON.parse(calls[0].options.body), {
    event_name: "checkout.payment_initiated",
    sheet_name: "payment_initiated",
  });
});

test("sends wrapped event payloads to the shared Make webhook URL", async () => {
  const calls = await withMockedFetch(async () => {
    process.env.MAKE_WEBHOOK_URL = "https://make.example/tracking";

    const result = await forwardMakeWebhook("phonepe.webhook", {
      merchantOrderId: "AM_123",
    });

    assert.deepEqual(result, { sent: true, status: 202, ok: true });
  });

  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "https://make.example/tracking");
  assert.ok(calls[0].options.signal instanceof AbortSignal);
  const body = JSON.parse(calls[0].options.body);
  assert.equal(body.event, "phonepe.webhook");
  assert.equal(body.payload.merchantOrderId, "AM_123");
});

test("Make webhook forwarding fails closed on network errors", async () => {
  const calls = await withMockedFetch(async () => {
    process.env.MAKE_WEBHOOK_URL = "https://make.example/tracking";

    const result = await forwardMakeWebhookPayload({
      event_name: "checkout.payment_failed",
      sheet_name: "payment_failed",
    });

    assert.deepEqual(result, { sent: false });
  }, async () => {
    throw new Error("network failure");
  });

  assert.equal(calls.length, 1);
  assert.ok(calls[0].options.signal instanceof AbortSignal);
});

async function withMockedFetch(callback, fetchImpl = async () => new Response("", { status: 202 })) {
  const originalFetch = globalThis.fetch;
  const originalLeadUrl = process.env.MAKE_WEBHOOK_URL;
  const calls = [];

  delete process.env.MAKE_WEBHOOK_URL;

  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    return fetchImpl(url, options);
  };

  try {
    await callback();
    return calls;
  } finally {
    globalThis.fetch = originalFetch;
    restoreEnv("MAKE_WEBHOOK_URL", originalLeadUrl);
  }
}

function restoreEnv(name, value) {
  if (value === undefined) {
    delete process.env[name];
  } else {
    process.env[name] = value;
  }
}
