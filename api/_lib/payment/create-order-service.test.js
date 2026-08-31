import assert from "node:assert/strict";
import test from "node:test";
import {
  CheckoutValidationError,
  createCheckoutPaymentOrder,
  isCheckoutValidationError,
} from "./create-order-service.js";

test("creates a checkout payment order from trusted server totals", async () => {
  const forwardedPayloads = [];
  const createdPayments = [];

  const result = await createCheckoutPaymentOrder({
    payload: {
      details: {
        name: "Harsh Goel",
        email: "harsh@example.com",
        phone: "+91 98765 43210",
      },
      selected: ["style-consultation"],
      tracking: {
        marketing: { source: "meta" },
      },
    },
    req: {
      headers: {
        host: "thriveonp.com",
      },
    },
    createOrderId: () => "AM_TEST_ORDER",
    createPayment: async (paymentPayload) => {
      createdPayments.push(paymentPayload);
      return {
        orderId: "OMO_TEST_ORDER",
        state: "PENDING",
        redirectUrl: "https://phonepe.example/pay",
      };
    },
    forwardWebhook: async (payload) => {
      forwardedPayloads.push(payload);
      return { sent: true };
    },
  });

  assert.deepEqual(result, {
    merchantOrderId: "AM_TEST_ORDER",
    phonePeOrderId: "OMO_TEST_ORDER",
    state: "PENDING",
    redirectUrl: "https://phonepe.example/pay",
    amountPaise: 294764,
  });
  assert.deepEqual(createdPayments, [
    {
      merchantOrderId: "AM_TEST_ORDER",
      amountPaise: 294764,
      redirectUrl: "https://thriveonp.com/a-m-thankyou?merchantOrderId=AM_TEST_ORDER",
      phoneNumber: "9876543210",
      metaInfo: {
        udf1: "Harsh Goel",
        udf2: "harsh@example.com",
        udf3: "9876543210",
        udf4: "AttractiveMen Personalized Style Report",
        udf5: "style-consultation",
      },
    },
  ]);
  assert.equal(forwardedPayloads.length, 1);
  assert.equal(forwardedPayloads[0].event_name, "checkout.payment_initiated");
  assert.equal(forwardedPayloads[0].merchant_order_id, "AM_TEST_ORDER");
  assert.equal(forwardedPayloads[0].amount_paise, "294764");
});

test("rejects invalid checkout details before provider calls", async () => {
  await assert.rejects(
    createCheckoutPaymentOrder({
      payload: {
        details: { name: "A", email: "bad", phone: "123" },
        selected: ["unknown"],
      },
      createPayment: async () => {
        throw new Error("provider should not be called");
      },
    }),
    (error) => {
      assert.ok(error instanceof CheckoutValidationError);
      assert.ok(isCheckoutValidationError(error));
      assert.deepEqual(error.errors, {
        name: "Please enter your full name.",
        email: "Please enter a valid email address.",
        phone: "Please enter a valid 10-digit mobile number.",
        selected: "Please refresh and try again.",
      });
      return true;
    },
  );
});
