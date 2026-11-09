import { FAILED_RETRY_MARKER } from "./payment-return.js";

const prefix = "styleiq-quiz-retry:v1:";

export function rememberQuizRetry(orderId, data) {
  try {
    sessionStorage.setItem(prefix + orderId, JSON.stringify(data));
  } catch { /* The buyer can return to the quiz if tab storage is unavailable. */ }
}

export function getQuizRetry(orderId, requireMarker = true) {
  try {
    if (!orderId || (requireMarker && sessionStorage.getItem(FAILED_RETRY_MARKER) !== orderId)) return null;
    return JSON.parse(sessionStorage.getItem(prefix + orderId));
  } catch {
    return null;
  }
}

export function forgetQuizRetry(orderId) {
  try {
    sessionStorage.removeItem(prefix + orderId);
  } catch { /* Tab storage is optional. */ }
}
