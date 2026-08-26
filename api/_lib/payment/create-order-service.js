import {
  buildRedirectUrl,
  calculateCheckoutTotals,
  createMerchantOrderId,
  getCheckoutValidationErrors,
  normalizePhone,
  sanitizeMeta,
} from "../checkout.js";
import { getEnv } from "../env.js";
import { buildCheckoutLeadPayload } from "../lead-webhook.js";
import { forwardMakeWebhookPayload } from "../make.js";
import { createPhonePePayment } from "../phonepe.js";

const PRODUCT_NAME = "AttractiveMen Personalized Style Report";

export class CheckoutValidationError extends Error {
  constructor(errors) {
    super("Invalid checkout details.");
    this.name = "CheckoutValidationError";
    this.errors = errors;
    this.statusCode = 400;
  }
}

export function isCheckoutValidationError(error) {
  return error instanceof CheckoutValidationError;
}

export async function createCheckoutPaymentOrder({
  payload = {},
  req,
  baseUrl = getCheckoutBaseUrl(req),
  createOrderId = createMerchantOrderId,
  createPayment = createPhonePePayment,
  forwardWebhook = forwardMakeWebhookPayload,
} = {}) {
  const errors = getCheckoutValidationErrors(payload);
  if (Object.keys(errors).length) throw new CheckoutValidationError(errors);

  const selected = payload.selected || [];
  const details = payload.details || {};
  const tracking = payload.tracking || {};
  const phoneNumber = normalizePhone(details.phone);
  const totals = calculateCheckoutTotals(selected);
  const merchantOrderId = createOrderId();
  const redirectUrl = buildRedirectUrl(baseUrl, merchantOrderId);
  const metaInfo = buildPhonePeMetaInfo({ details, phoneNumber, totals });

  const payment = await createPayment({
    merchantOrderId,
    amountPaise: totals.amountPaise,
    redirectUrl,
    phoneNumber,
    metaInfo,
  });

  await forwardWebhook(buildCheckoutLeadPayload({
    eventName: "checkout.payment_initiated",
    submissionId: merchantOrderId,
    details,
    phoneNumber,
    leadStatus: "payment_initiated",
    payment: {
      merchantOrderId,
      phonePeOrderId: payment.orderId,
      state: payment.state,
      amountPaise: totals.amountPaise,
    },
    selected,
    totals,
    req,
    tracking,
  }));

  return {
    merchantOrderId,
    phonePeOrderId: payment.orderId,
    state: payment.state,
    redirectUrl: payment.redirectUrl,
    amountPaise: totals.amountPaise,
  };
}

export function buildPhonePeMetaInfo({ details = {}, phoneNumber = "", totals = {} } = {}) {
  const selectedBumps = Array.isArray(totals.selectedBumps) ? totals.selectedBumps : [];

  return {
    udf1: sanitizeMeta(details.name),
    udf2: sanitizeMeta(details.email),
    udf3: sanitizeMeta(phoneNumber),
    udf4: PRODUCT_NAME,
    udf5: sanitizeMeta(selectedBumps.map((bump) => bump.id).join(",")),
  };
}

function getCheckoutBaseUrl(req) {
  const host = req?.headers?.host ? `https://${req.headers.host}` : "";
  return getEnv("BASE_URL", host);
}
