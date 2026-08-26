import crypto from "node:crypto";
import { BASE_PRICE, CHECKOUT_BUMPS, GST_RATE } from "../../src/lib/checkout-config.js";

const BUMP_BY_ID = new Map(CHECKOUT_BUMPS.map((bump) => [bump.id, bump]));

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

export function createMerchantOrderId() {
  const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
  const nonce = crypto.randomBytes(6).toString("hex");
  return `AM_${timestamp}_${nonce}`.slice(0, 63);
}

export function buildRedirectUrl(baseUrl, merchantOrderId) {
  const redirectUrl = new URL("/a-m-thankyou", baseUrl);
  redirectUrl.searchParams.set("merchantOrderId", merchantOrderId);
  return redirectUrl.toString();
}

export function sanitizeMeta(value, maxLength = 256) {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function roundMoney(amount) {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}
