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
    gst: 359.82,
    total: 2358.82,
    amountPaise: 235882,
    selectedBumps: [],
  });

  assert.deepEqual(calculateCheckoutTotals([
    "style-consultation",
    "instagram-makeover",
    "style-consultation",
  ]), {
    basePrice: 1999,
    bumpsTotal: 798,
    subtotal: 2797,
    gst: 503.46,
    total: 3300.46,
    amountPaise: 330046,
    selectedBumps: [
      {
        id: "style-consultation",
        title: "Personal Style Consultation",
        price: 499,
      },
      {
        id: "instagram-makeover",
        title: "Instagram Profile Analysis + Makeover",
        price: 299,
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
  assert.equal(errors.phone, "Please enter a valid 10-digit mobile number.");
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
