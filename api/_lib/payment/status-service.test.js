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
  });

  assert.equal(completed.state, "COMPLETED");
  assert.equal(pending.state, "PENDING");
  assert.equal(forwardedPayloads.length, 1);
  assert.equal(forwardedPayloads[0].event_name, "checkout.payment_completed");
  assert.equal(forwardedPayloads[0].merchant_order_id, "AM_123");
  assert.equal(isFinalPaymentState("FAILED"), true);
  assert.equal(isFinalPaymentState("PENDING"), false);
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
