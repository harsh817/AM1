import {
  DEFAULT_TEXT_MAX_LENGTH,
  EVENT_TIMESTAMP_MAX_LENGTH,
  LONG_TEXT_MAX_LENGTH,
  SHORT_TEXT_MAX_LENGTH,
} from "./constants.js";
import { buildTrackingFields } from "./tracking-webhook.js";

/**
 * Builds the Make payload for a PhonePe status check result.
 *
 * @param {object} input - Merchant order id, PhonePe status response, request, and tracking context.
 * @returns {object} Sheet-ready payment status payload.
 */
export function buildPaymentStatusPayload({
  merchantOrderId,
  status = {},
  req,
  timestamp = new Date().toISOString(),
  tracking = {},
} = {}) {
  const eventTimestamp = clean(timestamp, EVENT_TIMESTAMP_MAX_LENGTH);
  const merchantOrderIdClean = clean(merchantOrderId, SHORT_TEXT_MAX_LENGTH);
  const paymentState = clean(status.state, EVENT_TIMESTAMP_MAX_LENGTH);
  const eventName = getPaymentEventName(paymentState);
  const sheetName = getPaymentSheetName(paymentState);
  const metaInfo = status.metaInfo || status.meta_info || {};
  const errorContext = status.errorContext || {};
  const errorCode = clean(status.errorCode || errorContext.errorCode || errorContext.code, SHORT_TEXT_MAX_LENGTH);
  const errorMessage = clean(status.message || errorContext.errorMessage || errorContext.description, LONG_TEXT_MAX_LENGTH);
  const phonePeOrderId = clean(status.orderId, SHORT_TEXT_MAX_LENGTH);
  const amountPaise = cleanAmount(status.amount);

  return {
    event_name: eventName,
    event_timestamp: eventTimestamp,
    sheet_name: sheetName,
    merchant_order_id: merchantOrderIdClean,
    phonepe_order_id: phonePeOrderId,
    payment_state: paymentState,
    amount_paise: amountPaise,
    payable_amount_paise: cleanAmount(status.payableAmount),
    fee_amount_paise: cleanAmount(status.feeAmount),
    error_code: errorCode,
    error_message: errorMessage,
    event: {
      name: eventName,
      timestamp: eventTimestamp,
      submission_id: merchantOrderIdClean,
    },
    payment: {
      merchant_order_id: merchantOrderIdClean,
      phonepe_order_id: phonePeOrderId,
      state: paymentState,
      amount_paise: amountPaise,
      payable_amount_paise: cleanAmount(status.payableAmount),
      fee_amount_paise: cleanAmount(status.feeAmount),
    },
    lead: buildLead(metaInfo),
    order: buildOrder(metaInfo),
    ...buildTrackingFields({ req, tracking }),
    error: {
      code: errorCode,
      message: errorMessage,
      context: errorContext,
    },
    phonepe: {
      status,
    },
  };
}

function buildLead(metaInfo = {}) {
  const phone = cleanPhone(metaInfo.udf3);

  return {
    name: clean(metaInfo.udf1),
    email: clean(metaInfo.udf2),
    phone: {
      country_code: phone ? "+91" : "",
      number: phone,
      full: phone ? `+91${phone}` : "",
    },
    identity: clean(metaInfo.udf2) || phone,
  };
}

function buildOrder(metaInfo = {}) {
  return {
    product: clean(metaInfo.udf4),
    selected_item_ids: clean(metaInfo.udf5)
      .split(",")
      .map((id) => clean(id, SHORT_TEXT_MAX_LENGTH))
      .filter(Boolean),
  };
}

function getPaymentEventName(paymentState) {
  if (paymentState === "COMPLETED") return "checkout.payment_completed";
  if (paymentState === "FAILED") return "checkout.payment_failed";
  return "checkout.payment_status";
}

function getPaymentSheetName(paymentState) {
  if (paymentState === "COMPLETED") return "payment_completed";
  if (paymentState === "FAILED") return "payment_failed";
  return "payment_status";
}

function cleanAmount(value) {
  const amount = Number.parseInt(value, 10);
  return Number.isFinite(amount) && amount >= 0 ? String(amount) : "";
}

function cleanPhone(value) {
  return String(value ?? "").replace(/\D/g, "").slice(-10);
}

function clean(value, maxLength = DEFAULT_TEXT_MAX_LENGTH) {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, maxLength);
}
