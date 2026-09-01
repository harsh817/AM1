import { forwardMakeWebhookPayload } from "../make.js";
import { getPaymentErrorType, logPaymentEvent } from "../payment-logger.js";
import { buildPaymentStatusPayload } from "../payment-status-webhook.js";
import { getPhonePeOrderStatus } from "../phonepe.js";
import { MERCHANT_ORDER_ID_MAX_LENGTH } from "../constants.js";

const MERCHANT_ORDER_ID_PATTERN = new RegExp(`^[A-Za-z0-9_-]{1,${MERCHANT_ORDER_ID_MAX_LENGTH}}$`);
const STATUS_ROUTE = "/api/phonepe/status";
const STATUS_OPERATION = "phonepe.payment.status";

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
    await forwardWebhook(buildPaymentStatusPayload({
      merchantOrderId: normalizedOrderId,
      req,
      status,
      tracking,
    }));
  }

  return status;
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
