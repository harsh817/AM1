import { forwardMakeWebhookPayload } from "../make.js";
import { buildPaymentStatusPayload } from "../payment-status-webhook.js";
import { getPhonePeOrderStatus } from "../phonepe.js";
import { MERCHANT_ORDER_ID_MAX_LENGTH } from "../constants.js";

const MERCHANT_ORDER_ID_PATTERN = new RegExp(`^[A-Za-z0-9_-]{1,${MERCHANT_ORDER_ID_MAX_LENGTH}}$`);

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
} = {}) {
  const normalizedOrderId = normalizeMerchantOrderId(merchantOrderId);
  if (!isValidMerchantOrderId(normalizedOrderId)) throw new InvalidMerchantOrderIdError();

  const status = await getStatus(normalizedOrderId);
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
