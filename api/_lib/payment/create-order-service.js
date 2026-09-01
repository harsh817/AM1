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
import { getPaymentErrorType, logPaymentEvent } from "../payment-logger.js";
import { createPhonePePayment } from "../phonepe.js";

const PRODUCT_NAME = "AttractiveMen Personalized Style Report";
const CREATE_ORDER_ROUTE = "/api/phonepe/create-order";
const CREATE_PAYMENT_OPERATION = "phonepe.payment.create";

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

/**
 * Creates a PhonePe checkout order from validated browser input and server totals.
 *
 * @param {object} input - Checkout payload, request, base URL, and injectable side-effect functions.
 * @returns {Promise<object>} Merchant order id, PhonePe order id, state, redirect URL, and amount in paise.
 * @throws {CheckoutValidationError} When contact details or add-on ids are invalid.
 */
export async function createCheckoutPaymentOrder({
  payload = {},
  req,
  baseUrl = getCheckoutBaseUrl(req),
  createOrderId = createMerchantOrderId,
  createPayment = createPhonePePayment,
  forwardWebhook = forwardMakeWebhookPayload,
  logger = logPaymentEvent,
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

  logger("phonepe.payment_create_started", {
    operation: CREATE_PAYMENT_OPERATION,
    route: CREATE_ORDER_ROUTE,
    merchantOrderId,
    paymentState: "INITIATED",
  });

  let payment;
  try {
    payment = await createPayment({
      merchantOrderId,
      amountPaise: totals.amountPaise,
      redirectUrl,
      phoneNumber,
      metaInfo,
    });
  } catch (error) {
    logger("phonepe.payment_create_failed", {
      level: "error",
      operation: CREATE_PAYMENT_OPERATION,
      route: CREATE_ORDER_ROUTE,
      merchantOrderId,
      paymentState: "FAILED",
      responseStatus: error?.responseStatus,
      errorType: getPaymentErrorType(error),
    });
    throw error;
  }

  logger("phonepe.payment_create_succeeded", {
    operation: CREATE_PAYMENT_OPERATION,
    route: CREATE_ORDER_ROUTE,
    merchantOrderId,
    phonePeOrderId: payment.orderId,
    paymentState: payment.state,
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

/**
 * Builds PhonePe UDF metadata used later to reconstruct lead/order context.
 *
 * @param {object} input - Checkout details, normalized phone number, and calculated totals.
 * @returns {object} PhonePe metaInfo object.
 */
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
