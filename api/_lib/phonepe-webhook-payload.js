import { buildTrackingFields } from "./tracking-webhook.js";

export function buildPhonePeWebhookPayload({
  payload = {},
  req,
  timestamp = new Date().toISOString(),
  tracking = {},
} = {}) {
  const eventTimestamp = clean(timestamp, 64);
  const merchantOrderId = clean(
    payload.merchantOrderId || payload.data?.merchantOrderId || payload.payload?.merchantOrderId,
    128,
  );
  const phonePeOrderId = clean(
    payload.orderId || payload.data?.orderId || payload.payload?.orderId,
    128,
  );
  const paymentState = clean(
    payload.state || payload.data?.state || payload.payload?.state,
    64,
  );
  const amountPaise = cleanAmount(payload.amount ?? payload.data?.amount ?? payload.payload?.amount);
  const payableAmountPaise = cleanAmount(
    payload.payableAmount ?? payload.data?.payableAmount ?? payload.payload?.payableAmount,
  );
  const feeAmountPaise = cleanAmount(payload.feeAmount ?? payload.data?.feeAmount ?? payload.payload?.feeAmount);
  const errorContext = payload.errorContext || payload.data?.errorContext || payload.payload?.errorContext || {};
  const errorCode = clean(payload.errorCode || errorContext.errorCode || errorContext.code, 128);
  const errorMessage = clean(payload.errorMessage || payload.message || errorContext.errorMessage, 512);

  return {
    event_name: "phonepe.webhook",
    event_timestamp: eventTimestamp,
    sheet_name: "phonepe_webhook",
    merchant_order_id: merchantOrderId,
    phonepe_order_id: phonePeOrderId,
    payment_state: paymentState,
    amount_paise: amountPaise,
    payable_amount_paise: payableAmountPaise,
    fee_amount_paise: feeAmountPaise,
    error_code: errorCode,
    error_message: errorMessage,
    event: {
      name: "phonepe.webhook",
      timestamp: eventTimestamp,
      submission_id: merchantOrderId,
    },
    payment: {
      merchant_order_id: merchantOrderId,
      phonepe_order_id: phonePeOrderId,
      state: paymentState,
      amount_paise: amountPaise,
      payable_amount_paise: payableAmountPaise,
      fee_amount_paise: feeAmountPaise,
    },
    ...buildTrackingFields({ req, tracking }),
    error: {
      code: errorCode,
      message: errorMessage,
      context: errorContext,
    },
    phonepe: {
      webhook: payload,
    },
  };
}

function cleanAmount(value) {
  const amount = Number.parseInt(value, 10);
  return Number.isFinite(amount) && amount >= 0 ? String(amount) : "";
}

function clean(value, maxLength = 256) {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, maxLength);
}
