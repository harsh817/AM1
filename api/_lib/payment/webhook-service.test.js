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
  const paymentLogs = [];

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
    logger: (eventName, fields) => {
      paymentLogs.push({ eventName, fields });
    },
  });

  assert.deepEqual(result, { received: true });
  assert.equal(forwardedPayloads.length, 1);
  assert.equal(forwardedPayloads[0].event_name, "phonepe.webhook");
  assert.equal(forwardedPayloads[0].merchant_order_id, "AM_123");
  assert.equal(forwardedPayloads[0].payment_state, "COMPLETED");
  assert.deepEqual(paymentLogs.map((log) => log.eventName), ["phonepe.webhook_accepted"]);
  assert.equal(paymentLogs[0].fields.merchantOrderId, "AM_123");
  assert.equal(paymentLogs[0].fields.phonePeOrderId, "OMO_123");
  assert.equal(paymentLogs[0].fields.paymentState, "COMPLETED");
});

test("rejects unverified and invalid PhonePe webhooks", async () => {
  const verificationLogs = [];
  await assert.rejects(
    handlePhonePeWebhook({
      req: { headers: { authorization: "bad" } },
      rawBody: "{}",
      credentials: { username: "user", password: "pass" },
      logger: (eventName, fields) => {
        verificationLogs.push({ eventName, fields });
      },
    }),
    (error) => {
      assert.ok(error instanceof PhonePeWebhookVerificationError);
      assert.ok(isPhonePeWebhookVerificationError(error));
      return true;
    },
  );
  assert.deepEqual(verificationLogs.map((log) => log.eventName), ["phonepe.webhook_failed"]);
  assert.equal(verificationLogs[0].fields.errorType, "PhonePeWebhookVerificationError");

  const authorization = crypto.createHash("sha256").update("user:pass").digest("hex");
  const payloadLogs = [];
  await assert.rejects(
    handlePhonePeWebhook({
      req: { headers: { authorization } },
      rawBody: "{",
      credentials: { username: "user", password: "pass" },
      logger: (eventName, fields) => {
        payloadLogs.push({ eventName, fields });
      },
    }),
    (error) => {
      assert.ok(error instanceof PhonePeWebhookPayloadError);
      assert.ok(isPhonePeWebhookPayloadError(error));
      return true;
    },
  );
  assert.deepEqual(payloadLogs.map((log) => log.eventName), ["phonepe.webhook_failed"]);
  assert.equal(payloadLogs[0].fields.errorType, "PhonePeWebhookPayloadError");
  assert.doesNotMatch(JSON.stringify(payloadLogs), /rawBody|payload|user:pass/);
});
