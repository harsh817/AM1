import assert from "node:assert/strict";
import test from "node:test";
import {
  buildRedirectUrl,
  calculateCheckoutTotals,
  createMerchantOrderId,
  getCheckoutValidationErrors,
} from "./checkout.js";
import { MERCHANT_ORDER_ID_MAX_LENGTH } from "./constants.js";

test("calculates trusted server-side totals from selected bump ids", () => {
  assert.deepEqual(calculateCheckoutTotals([]), {
    basePrice: 1999,
    bumpsTotal: 0,
    subtotal: 1999,
    gst: 360,
    total: 2359,
    amountPaise: 235900,
    selectedBumps: [],
  });

  assert.deepEqual(calculateCheckoutTotals([
    "outfit-visualizer",
    "outfit-visualizer",
    "outfit-visualizer",
  ]), {
    basePrice: 1999,
    bumpsTotal: 422.88,
    subtotal: 2421.88,
    gst: 436,
    total: 2858,
    amountPaise: 285800,
    selectedBumps: [
      {
        id: "outfit-visualizer",
        title: "Face-Matched Outfit Preview",
        price: 422.88,
      },
    ],
  });
});

test("rejects invalid contact fields and unknown bump ids", () => {
  const errors = getCheckoutValidationErrors({
    details: { name: "A", email: "bad", phone: "123" },
    selected: ["call"],
  });

  assert.equal(errors.name, "Please enter your full name.");
  assert.equal(errors.email, "Please enter a valid email address.");
  assert.equal(errors.phone, "Please enter a valid phone number.");
  assert.equal(errors.selected, "Please refresh and try again.");
});

test("builds PhonePe-safe redirect and merchant order ids", () => {
  assert.equal(
    buildRedirectUrl("https://thriveonp.com/", "AM_123"),
    "https://thriveonp.com/a-m-thankyou?merchantOrderId=AM_123",
  );

  const id = createMerchantOrderId();
  assert.match(id, /^AM_[A-Za-z0-9_-]+$/);
  assert.ok(id.length <= MERCHANT_ORDER_ID_MAX_LENGTH);
});
