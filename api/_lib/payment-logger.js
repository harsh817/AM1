import {
  DEFAULT_TEXT_MAX_LENGTH,
  EVENT_TIMESTAMP_MAX_LENGTH,
  SHORT_TEXT_MAX_LENGTH,
} from "./constants.js";

/**
 * Builds a structured payment log entry from whitelisted, non-sensitive fields.
 *
 * @param {string} eventName - Payment lifecycle event name.
 * @param {object} fields - Optional payment context; unknown fields are ignored.
 * @param {string} timestamp - ISO timestamp for deterministic tests.
 * @returns {object} Safe JSON-serializable log entry.
 */
export function buildPaymentLogEntry(eventName, fields = {}, timestamp = new Date().toISOString()) {
  return {
    event_name: clean(eventName, DEFAULT_TEXT_MAX_LENGTH),
    event_timestamp: clean(timestamp, EVENT_TIMESTAMP_MAX_LENGTH),
    operation: clean(fields.operation, DEFAULT_TEXT_MAX_LENGTH),
    route: clean(fields.route, DEFAULT_TEXT_MAX_LENGTH),
    merchant_order_id: clean(fields.merchantOrderId || fields.merchant_order_id, SHORT_TEXT_MAX_LENGTH),
    phonepe_order_id: clean(fields.phonePeOrderId || fields.phonepe_order_id, SHORT_TEXT_MAX_LENGTH),
    payment_state: clean(fields.paymentState || fields.payment_state, SHORT_TEXT_MAX_LENGTH),
    response_status: cleanStatus(fields.responseStatus || fields.response_status),
    error_type: clean(fields.errorType || fields.error_type, SHORT_TEXT_MAX_LENGTH),
  };
}

/**
 * Writes a structured payment event without logging PII, secrets, or raw payloads.
 *
 * @param {string} eventName - Payment lifecycle event name.
 * @param {object} fields - Whitelisted payment context.
 * @param {object} output - Console-like logger used by production or tests.
 * @returns {object} Written log entry.
 */
export function logPaymentEvent(eventName, fields = {}, output = console) {
  const entry = buildPaymentLogEntry(eventName, fields);
  const level = fields.level === "error" ? "error" : fields.level === "warn" ? "warn" : "log";
  const writer = typeof output[level] === "function" ? output[level] : output.log;
  writer?.call(output, JSON.stringify(entry));
  return entry;
}

export function getPaymentErrorType(error) {
  return clean(error?.code || error?.name || "Error", SHORT_TEXT_MAX_LENGTH);
}

function cleanStatus(value) {
  const status = Number.parseInt(value, 10);
  return Number.isFinite(status) && status > 0 ? String(status) : "";
}

function clean(value, maxLength = DEFAULT_TEXT_MAX_LENGTH) {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, maxLength);
}
