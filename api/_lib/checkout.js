import crypto from "node:crypto";
import {
  DEFAULT_TEXT_MAX_LENGTH,
  MERCHANT_ORDER_ID_MAX_LENGTH,
  MERCHANT_ORDER_NONCE_BYTES,
  MERCHANT_ORDER_TIMESTAMP_LENGTH,
} from "./constants.js";
import { BASE_PRICE, CHECKOUT_BUMPS, GST_RATE } from "../../src/lib/checkout-config.js";

const BUMP_BY_ID = new Map(CHECKOUT_BUMPS.map((bump) => [bump.id, bump]));

/**
 * Calculates the authoritative checkout total from server-owned price config.
 *
 * @param {string[]} selected - Checkout add-on ids selected in the browser.
 * @returns {object} Price breakdown, amount in paise, and valid selected add-ons.
 */
export function calculateCheckoutTotals(selected = []) {
  const selectedBumps = [...new Set(selected)]
    .map((id) => BUMP_BY_ID.get(id))
    .filter(Boolean);
  const bumpsTotal = selectedBumps.reduce((sum, bump) => sum + bump.price, 0);
  const subtotal = BASE_PRICE + bumpsTotal;
  const gst = roundMoney(subtotal * GST_RATE);
  const total = roundMoney(subtotal + gst);

  return {
    basePrice: BASE_PRICE,
    bumpsTotal,
    subtotal,
    gst,
    total,
    amountPaise: Math.round(total * 100),
    selectedBumps,
  };
}

/**
 * Validates customer contact details and add-on ids before payment creation.
 *
 * @param {object} input
 * @param {object} input.details - Customer name, email, and phone fields.
 * @param {string[]} input.selected - Checkout add-on ids selected by the customer.
 * @returns {Record<string, string>} Field-level validation errors.
 */
export function getCheckoutValidationErrors({ details = {}, selected = [] } = {}) {
  const errors = {};
  const name = String(details.name ?? "").trim();
  const email = String(details.email ?? "").trim();
  const phone = normalizePhone(details.phone ?? "");

  if (name.length < 2) errors.name = "Please enter your full name.";
  if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = "Please enter a valid email address.";
  if (!/^\d{10}$/.test(phone)) errors.phone = "Please enter a valid 10-digit mobile number.";
  if (!Array.isArray(selected) || selected.some((id) => !BUMP_BY_ID.has(id))) {
    errors.selected = "Please refresh and try again.";
  }

  return errors;
}

export function normalizePhone(phone) {
  return String(phone ?? "").replace(/\D/g, "").slice(-10);
}

/**
 * Builds a PhonePe-safe merchant order id with a timestamp and random nonce.
 *
 * @returns {string} Merchant order id that fits PhonePe's maximum id length.
 */
export function createMerchantOrderId() {
  const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, MERCHANT_ORDER_TIMESTAMP_LENGTH);
  const nonce = crypto.randomBytes(MERCHANT_ORDER_NONCE_BYTES).toString("hex");
  return `AM_${timestamp}_${nonce}`.slice(0, MERCHANT_ORDER_ID_MAX_LENGTH);
}

/**
 * Creates the public payment return URL for a merchant order.
 *
 * @param {string} baseUrl - Production or preview site origin.
 * @param {string} merchantOrderId - Server-generated order id.
 * @returns {string} Absolute thank-you URL with the merchant order id attached.
 */
export function buildRedirectUrl(baseUrl, merchantOrderId) {
  const redirectUrl = new URL("/a-m-thankyou", baseUrl);
  redirectUrl.searchParams.set("merchantOrderId", merchantOrderId);
  return redirectUrl.toString();
}

/**
 * Normalizes customer metadata before putting it into PhonePe UDF fields.
 *
 * @param {unknown} value - Raw customer or order metadata value.
 * @param {number} maxLength - Maximum PhonePe-safe string length.
 * @returns {string} Whitespace-collapsed metadata string.
 */
export function sanitizeMeta(value, maxLength = DEFAULT_TEXT_MAX_LENGTH) {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function roundMoney(amount) {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}
