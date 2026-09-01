import assert from "node:assert/strict";
import test from "node:test";
import {
  InvalidMerchantOrderIdError,
  checkPaymentOrderStatus,
  isFinalPaymentState,
  isInvalidMerchantOrderIdError,
} from "./status-service.js";

test("forwards Make payloads only for final payment states", async () => {
  const forwardedPayloads = [];
  const paymentLogs = [];

  const completed = await checkPaymentOrderStatus({
    merchantOrderId: " AM_123 ",
    getStatus: async (merchantOrderId) => ({
      merchantOrderId,
      orderId: "OMO_123",
      state: "COMPLETED",
      amount: 224200,
    }),
    forwardWebhook: async (payload) => {
      forwardedPayloads.push(payload);
      return { sent: true };
    },
    logger: (eventName, fields) => {
      paymentLogs.push({ eventName, fields });
    },
  });

  const pending = await checkPaymentOrderStatus({
    merchantOrderId: "AM_124",
    getStatus: async () => ({
      orderId: "OMO_124",
      state: "PENDING",
      amount: 224200,
    }),
    forwardWebhook: async (payload) => {
      forwardedPayloads.push(payload);
      return { sent: true };
    },
    logger: (eventName, fields) => {
      paymentLogs.push({ eventName, fields });
    },
  });

  assert.equal(completed.state, "COMPLETED");
  assert.equal(completed.merchantOrderId, "AM_123");
  assert.equal(completed.phonePeOrderId, "OMO_123");
  assert.equal(completed.amountPaise, 224200);
  assert.equal(completed.payableAmountPaise, 224200);
  assert.equal(completed.currency, "INR");
  assert.equal(pending.state, "PENDING");
  assert.equal(forwardedPayloads.length, 1);
  assert.equal(forwardedPayloads[0].event_name, "checkout.payment_completed");
  assert.equal(forwardedPayloads[0].merchant_order_id, "AM_123");
  assert.equal(isFinalPaymentState("FAILED"), true);
  assert.equal(isFinalPaymentState("PENDING"), false);
  assert.deepEqual(paymentLogs.map((log) => log.eventName), [
    "phonepe.status_check_succeeded",
    "phonepe.status_check_succeeded",
  ]);
  assert.equal(paymentLogs[0].fields.merchantOrderId, "AM_123");
  assert.equal(paymentLogs[0].fields.phonePeOrderId, "OMO_123");
  assert.equal(paymentLogs[1].fields.paymentState, "PENDING");
});

test("logs status failures before rethrowing provider errors", async () => {
  const paymentLogs = [];
  const providerError = new Error("raw status failure");
  providerError.code = "PHONEPE_STATUS_CHECK_FAILED";
  providerError.responseStatus = 503;

  await assert.rejects(
    checkPaymentOrderStatus({
      merchantOrderId: "AM_FAILED_STATUS",
      getStatus: async () => {
        throw providerError;
      },
      forwardWebhook: async () => {
        throw new Error("webhook should not be called");
      },
      logger: (eventName, fields) => {
        paymentLogs.push({ eventName, fields });
      },
    }),
    (error) => {
      assert.equal(error, providerError);
      return true;
    },
  );

  assert.deepEqual(paymentLogs.map((log) => log.eventName), ["phonepe.status_check_failed"]);
  assert.equal(paymentLogs[0].fields.merchantOrderId, "AM_FAILED_STATUS");
  assert.equal(paymentLogs[0].fields.errorType, "PHONEPE_STATUS_CHECK_FAILED");
  assert.equal(paymentLogs[0].fields.responseStatus, 503);
  assert.doesNotMatch(JSON.stringify(paymentLogs), /raw status failure/);
});

test("rejects invalid merchant order ids before provider calls", async () => {
  await assert.rejects(
    checkPaymentOrderStatus({
      merchantOrderId: "bad order id",
      getStatus: async () => {
        throw new Error("provider should not be called");
      },
    }),
    (error) => {
      assert.ok(error instanceof InvalidMerchantOrderIdError);
      assert.ok(isInvalidMerchantOrderIdError(error));
      assert.equal(error.message, "Invalid order id.");
      return true;
    },
  );
});
