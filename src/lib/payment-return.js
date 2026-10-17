import { CHECKOUT_PATH, PAYMENT_FAILED_PATH, PAYMENT_STATUS_PATH, THANKYOU_PATH } from "../routes.js";
import { getCheckoutOrderTrackingPayload } from "./checkout-tracking.js";

export const FAILED_RETRY_MARKER = "attractivemen-failed-payment-retry:v1";
export const DEFAULT_ASSESSMENT_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSfAvXoX7c5qX2Ev_Al6TZ6OE46Yc2bmVJVkqAfIbh66oDbnUQ/viewform";

export async function checkPaymentStatus(merchantOrderId, fetchRef = globalThis.fetch) {
  const response = await fetchRef("/api/phonepe/status", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ merchantOrderId, tracking: getCheckoutOrderTrackingPayload(merchantOrderId) }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Payment status could not be checked.");
  return data;
}

export function getPaymentDestination(state, merchantOrderId) {
  if (!merchantOrderId) return "";
  const encodedOrderId = encodeURIComponent(merchantOrderId);
  if (state === "COMPLETED") return `${THANKYOU_PATH}?merchantOrderId=${encodedOrderId}`;
  if (state === "FAILED") return `${PAYMENT_FAILED_PATH}?merchantOrderId=${encodedOrderId}`;
  return "";
}

export function getPaymentStatusUrl(merchantOrderId) {
  return `${PAYMENT_STATUS_PATH}?merchantOrderId=${encodeURIComponent(merchantOrderId)}`;
}

export function getFailedPaymentRetryUrl(merchantOrderId) {
  return `${CHECKOUT_PATH}?retryOrderId=${encodeURIComponent(merchantOrderId)}`;
}

export function markFailedPaymentRetry(merchantOrderId, storage = globalThis.window?.sessionStorage) {
  if (!storage || !merchantOrderId) return false;
  try {
    storage?.setItem(FAILED_RETRY_MARKER, merchantOrderId);
    return true;
  } catch {
    return false;
  }
}

export function getAssessmentFormUrl(value = import.meta.env?.VITE_STYLEIQ_ASSESSMENT_FORM_URL || DEFAULT_ASSESSMENT_FORM_URL) {
  try {
    const url = new URL(String(value || DEFAULT_ASSESSMENT_FORM_URL));
    if (url.protocol !== "https:" || !["docs.google.com", "forms.gle"].includes(url.hostname)) return "";
    return url.toString();
  } catch {
    return "";
  }
}
