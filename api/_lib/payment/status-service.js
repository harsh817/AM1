import { forwardMakeWebhookPayload } from "../make.js";
import { getPaymentErrorType, logPaymentEvent } from "../payment-logger.js";
import { buildPaymentStatusPayload } from "../payment-status-webhook.js";
import { getPhonePeOrderStatus } from "../phonepe.js";
import { MERCHANT_ORDER_ID_MAX_LENGTH } from "../constants.js";
import { buildConvexAttribution, recordConvexOrder, recordConvexPaymentReceipt } from "../convex.js";

const MERCHANT_ORDER_ID_PATTERN = new RegExp(`^[A-Za-z0-9_-]{1,${MERCHANT_ORDER_ID_MAX_LENGTH}}$`);
const STATUS_ROUTE = "/api/phonepe/status";
const STATUS_OPERATION = "phonepe.payment.status";
const PAYMENT_CURRENCY = "INR";

export class InvalidMerchantOrderIdError extends Error {
  constructor() {
    super("Invalid order id.");
    this.name = "InvalidMerchantOrderIdError";
    this.statusCode = 400;
  }
}

export function isInvalidMerchantOrderIdError(error) {
  return error instanceof InvalidMerchantOrderIdError;
}

/**
 * Checks PhonePe order status and forwards final states to Make.
 *
 * @param {object} input - Merchant order id, request, tracking, and injectable dependencies.
 * @returns {Promise<object>} Raw PhonePe status response.
 * @throws {InvalidMerchantOrderIdError} When the merchant order id is missing or unsafe.
 */
export async function checkPaymentOrderStatus({
  merchantOrderId,
  req,
  tracking = {},
  getStatus = getPhonePeOrderStatus,
  forwardWebhook = forwardMakeWebhookPayload,
  logger = logPaymentEvent,
} = {}) {
  const normalizedOrderId = normalizeMerchantOrderId(merchantOrderId);
  if (!isValidMerchantOrderId(normalizedOrderId)) throw new InvalidMerchantOrderIdError();

  let status;
  try {
    status = await getStatus(normalizedOrderId);
  } catch (error) {
    logger("phonepe.status_check_failed", {
      level: "error",
      operation: STATUS_OPERATION,
      route: STATUS_ROUTE,
      merchantOrderId: normalizedOrderId,
      paymentState: "UNKNOWN",
      responseStatus: error?.responseStatus,
      errorType: getPaymentErrorType(error),
    });
    throw error;
  }

  logger("phonepe.status_check_succeeded", {
    operation: STATUS_OPERATION,
    route: STATUS_ROUTE,
    merchantOrderId: normalizedOrderId,
    phonePeOrderId: status.orderId,
    paymentState: status.state,
  });

  if (isFinalPaymentState(status.state)) {
    const paymentPayload = buildPaymentStatusPayload({ merchantOrderId: normalizedOrderId, req, status, tracking });
    const occurredAt = Date.now();
    await attemptStatusReporting("phonepe.status_order_record_failed", normalizedOrderId, () => recordConvexOrder({
      merchantOrderId: normalizedOrderId,
      amountPaise: normalizeAmountPaise(status.payableAmountPaise ?? status.amountPaise ?? status.amount),
      state: status.state,
      attribution: buildConvexAttribution(tracking),
      failure: status.state === "FAILED" ? {
        type: "payment_failed",
        ...(status.errorCode ? { code: status.errorCode } : {}),
        ...(status.errorMessage ? { message: status.errorMessage } : {}),
      } : undefined,
      providerEventId: buildProviderEventId(normalizedOrderId, status),
      occurredAt,
    }), logger);
    await attemptStatusReporting("phonepe.status_receipt_record_failed", normalizedOrderId, () => recordConvexPaymentReceipt({
      merchantOrderId: normalizedOrderId,
      providerEventId: buildProviderEventId(normalizedOrderId, status),
      state: status.state,
      amountPaise: normalizeAmountPaise(status.payableAmountPaise ?? status.amountPaise ?? status.amount),
      errorCode: status.errorCode,
      errorMessage: status.errorMessage,
      receivedAt: occurredAt,
    }), logger);
    await attemptStatusReporting("phonepe.status_make_delivery_failed", normalizedOrderId, () => forwardWebhook(paymentPayload), logger);
  }
  if (!isFinalPaymentState(status.state)) {
    await attemptStatusReporting("phonepe.status_order_record_failed", normalizedOrderId, () => recordConvexOrder({
      merchantOrderId: normalizedOrderId,
      amountPaise: normalizeAmountPaise(status.payableAmountPaise ?? status.amountPaise ?? status.amount),
      state: "PENDING",
      attribution: buildConvexAttribution(tracking),
      providerEventId: buildProviderEventId(normalizedOrderId, status),
      occurredAt: Date.now(),
    }), logger);
  }

  return buildClientStatusResponse(status, normalizedOrderId);
}

async function attemptStatusReporting(eventName, merchantOrderId, operation, logger) {
  try {
    const result = await operation();
    if (result?.sent === false || result?.ok === false) {
      logger(eventName, {
        level: "error",
        operation: STATUS_OPERATION,
        route: STATUS_ROUTE,
        merchantOrderId,
        errorType: "ReportingDeliveryUnavailable",
      });
    }
  } catch (error) {
    logger(eventName, {
      level: "error",
      operation: STATUS_OPERATION,
      route: STATUS_ROUTE,
      merchantOrderId,
      errorType: getPaymentErrorType(error),
    });
  }
}

function buildProviderEventId(merchantOrderId, status = {}) {
  return `${merchantOrderId}:${String(status.orderId || status.phonePeOrderId || "status")}:${String(status.state || "UNKNOWN")}`;
}

export function normalizeMerchantOrderId(value) {
  return String(value ?? "").trim();
}

export function isValidMerchantOrderId(value) {
  return MERCHANT_ORDER_ID_PATTERN.test(normalizeMerchantOrderId(value));
}

export function isFinalPaymentState(value) {
  const state = String(value ?? "").trim().toUpperCase();
  return state === "COMPLETED" || state === "FAILED";
}

function buildClientStatusResponse(status = {}, merchantOrderId = "") {
  return {
    ...status,
    merchantOrderId: status.merchantOrderId || merchantOrderId,
    phonePeOrderId: status.phonePeOrderId || status.orderId || "",
    amountPaise: normalizeAmountPaise(status.amountPaise ?? status.amount),
    payableAmountPaise: normalizeAmountPaise(status.payableAmountPaise ?? status.payableAmount ?? status.amount),
    currency: status.currency || PAYMENT_CURRENCY,
  };
}

function normalizeAmountPaise(value) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 ? Math.round(amount) : "";
}
