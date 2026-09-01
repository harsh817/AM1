import assert from "node:assert/strict";
import test from "node:test";
import {
  buildPaymentLogEntry,
  getPaymentErrorType,
  logPaymentEvent,
} from "./payment-logger.js";

test("builds payment logs from whitelisted safe fields only", () => {
  const entry = buildPaymentLogEntry("phonepe.payment_create_failed", {
    operation: "phonepe.payment.create",
    route: "/api/phonepe/create-order",
    merchantOrderId: "AM_123",
    phonePeOrderId: "OMO_456",
    paymentState: "FAILED",
    responseStatus: 502,
    errorType: "PHONEPE_PAYMENT_CREATE_FAILED",
    name: "Harsh Goel",
    email: "harsh@example.com",
    phone: "+919876543210",
    accessToken: "secret-token",
    clientSecret: "secret-client",
    rawBody: "{\"secret\":true}",
    payload: { secret: true },
  }, "2026-09-01T10:00:00.000Z");

  assert.deepEqual(entry, {
    event_name: "phonepe.payment_create_failed",
    event_timestamp: "2026-09-01T10:00:00.000Z",
    operation: "phonepe.payment.create",
    route: "/api/phonepe/create-order",
    merchant_order_id: "AM_123",
    phonepe_order_id: "OMO_456",
    payment_state: "FAILED",
    response_status: "502",
    error_type: "PHONEPE_PAYMENT_CREATE_FAILED",
  });
  assert.doesNotMatch(JSON.stringify(entry), /Harsh Goel|harsh@example\.com|9876543210|secret-token|secret-client|rawBody|payload/);
});

test("writes JSON payment logs to the requested output level", () => {
  const written = [];
  const output = {
    warn(message) {
      written.push({ level: "warn", message });
    },
  };

  const entry = logPaymentEvent("phonepe.webhook_failed", {
    level: "warn",
    operation: "phonepe.webhook",
    route: "/api/phonepe/webhook",
    merchantOrderId: "AM_123",
    errorType: "PhonePeWebhookVerificationError",
  }, output);

  assert.equal(written.length, 1);
  assert.equal(written[0].level, "warn");
  assert.deepEqual(JSON.parse(written[0].message), entry);
});

test("derives safe payment error types from typed errors", () => {
  const error = new Error("raw provider failure");
  error.code = "PHONEPE_TIMEOUT";

  assert.equal(getPaymentErrorType(error), "PHONEPE_TIMEOUT");
  assert.equal(getPaymentErrorType({ name: "AbortError" }), "AbortError");
  assert.equal(getPaymentErrorType(null), "Error");
});
