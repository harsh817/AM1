import assert from "node:assert/strict";
import crypto from "node:crypto";
import test from "node:test";
import {
  PhonePeWebhookPayloadError,
  PhonePeWebhookVerificationError,
  handlePhonePeWebhook,
  isPhonePeWebhookPayloadError,
  isPhonePeWebhookVerificationError,
  verifyPhonePeWebhookRequest,
} from "./webhook-service.js";

test("verifies PhonePe webhook authorization using SHA-256 credentials", () => {
  const authorization = crypto.createHash("sha256").update("user:pass").digest("hex");

  assert.equal(
    verifyPhonePeWebhookRequest(
      { headers: { authorization: `sha256 ${authorization}` } },
      { username: "user", password: "pass" },
    ),
    true,
  );
  assert.equal(
    verifyPhonePeWebhookRequest(
      { headers: { authorization: "sha256 invalid" } },
      { username: "user", password: "pass" },
    ),
    false,
  );
});

test("forwards verified PhonePe webhooks through the Make payload builder", async () => {
  const authorization = crypto.createHash("sha256").update("user:pass").digest("hex");
  const forwardedPayloads = [];

  const result = await handlePhonePeWebhook({
    req: { headers: { authorization } },
    rawBody: JSON.stringify({
      merchantOrderId: "AM_123",
      orderId: "OMO_123",
      state: "COMPLETED",
    }),
    credentials: { username: "user", password: "pass" },
    forwardWebhook: async (payload) => {
      forwardedPayloads.push(payload);
      return { sent: true };
    },
  });

  assert.deepEqual(result, { received: true });
  assert.equal(forwardedPayloads.length, 1);
  assert.equal(forwardedPayloads[0].event_name, "phonepe.webhook");
  assert.equal(forwardedPayloads[0].merchant_order_id, "AM_123");
  assert.equal(forwardedPayloads[0].payment_state, "COMPLETED");
});

test("rejects unverified and invalid PhonePe webhooks", async () => {
  await assert.rejects(
    handlePhonePeWebhook({
      req: { headers: { authorization: "bad" } },
      rawBody: "{}",
      credentials: { username: "user", password: "pass" },
    }),
    (error) => {
      assert.ok(error instanceof PhonePeWebhookVerificationError);
      assert.ok(isPhonePeWebhookVerificationError(error));
      return true;
    },
  );

  const authorization = crypto.createHash("sha256").update("user:pass").digest("hex");
  await assert.rejects(
    handlePhonePeWebhook({
      req: { headers: { authorization } },
      rawBody: "{",
      credentials: { username: "user", password: "pass" },
    }),
    (error) => {
      assert.ok(error instanceof PhonePeWebhookPayloadError);
      assert.ok(isPhonePeWebhookPayloadError(error));
      return true;
    },
  );
});
