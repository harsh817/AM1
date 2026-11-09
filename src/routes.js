export const LANDING_PATH = "/a-m";
export const LANDING_AM2_PATH = "/AM2";
export const CHECKOUT_PATH = "/a-m-checkout";
export const PAYMENT_STATUS_PATH = "/a-m-payment-status";
export const THANKYOU_PATH = "/a-m-thankyou";
export const PAYMENT_FAILED_PATH = "/a-m-payment-failed";
export const EXPERIMENT_DASHBOARD_PATH = "/experiment-dashboard";
export const DASHBOARD_PATH = "/dashboard";
export const STYLE_QUIZ_PATH = "/style-quiz";

export function getPageRoute(pathname, search = "", options = {}) {
  const query = new URLSearchParams(search);
  const path = normalizePath(pathname);
  if (path === STYLE_QUIZ_PATH) {
    if (query.get("preview") === "1") return { page: "style-quiz", preview: true };
    const enabled = options.styleQuizEnabled ?? (import.meta.env?.DEV === true || import.meta.env?.VITE_STYLE_QUIZ_ENABLED === "true");
    return enabled ? { page: "style-quiz" } : { page: "style-quiz-disabled" };
  }
  if (["/style-for-your-complexion", "/am-ds"].includes(path)) return { page: "complexion" };

  if (path === LANDING_PATH) {
    return { page: "landing", variant: "AM" };
  }

  if (path.toLowerCase() === LANDING_AM2_PATH.toLowerCase()) {
    return { page: "landing-am2", variant: "AM2" };
  }

  const merchantOrderId = query.get("merchantOrderId") || "";
  const paymentPreview = query.get("preview") || "";

  if (path === PAYMENT_STATUS_PATH || path === "/thankyou" || path === "/thank-you") {
    return { page: "payment-status", merchantOrderId, ...(paymentPreview ? { preview: paymentPreview } : {}) };
  }

  if (path === PAYMENT_FAILED_PATH) {
    return { page: "payment-failed", merchantOrderId, ...(paymentPreview ? { preview: paymentPreview } : {}) };
  }

  if (path === CHECKOUT_PATH || path === "/checkout" || path === "/checkout.html" || query.get("page") === "checkout") {
    if (merchantOrderId) return { page: "payment-status", merchantOrderId };
    return { page: "checkout" };
  }

  if (path === THANKYOU_PATH) {
    return {
      page: "thankyou",
      merchantOrderId,
      ...(paymentPreview ? { preview: paymentPreview } : {}),
    };
  }

  if (path === EXPERIMENT_DASHBOARD_PATH) return { page: "experiment-dashboard" };
  if (path === DASHBOARD_PATH || path.startsWith(`${DASHBOARD_PATH}/`)) {
    return { page: "dashboard", section: path.slice(DASHBOARD_PATH.length + 1) || "overview" };
  }

  if (query.get("page") === "privacy" || path === "/privacy") return { page: "legal", type: "privacy" };
  if (query.get("page") === "terms" || path === "/terms") return { page: "legal", type: "terms" };

  return { page: "landing", variant: "AM" };
}

function normalizePath(pathname) {
  const path = String(pathname || "/").replace(/\/+$/, "");
  return path || "/";
}
