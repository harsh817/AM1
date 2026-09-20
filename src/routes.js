export const LANDING_PATH = "/a-m";
export const LANDING_AM2_PATH = "/AM2";
export const CHECKOUT_PATH = "/a-m-checkout";
export const THANKYOU_PATH = "/a-m-thankyou";
export const EXPERIMENT_DASHBOARD_PATH = "/experiment-dashboard";

export function getPageRoute(pathname, search = "") {
  const query = new URLSearchParams(search);
  const path = normalizePath(pathname);

  if (path === LANDING_PATH) {
    return { page: "landing" };
  }

  if (path.toLowerCase() === LANDING_AM2_PATH.toLowerCase()) {
    return { page: "landing-am2" };
  }

  if (query.get("page") === "checkout" || path === CHECKOUT_PATH || path === "/checkout" || path === "/checkout.html") {
    return { page: "checkout" };
  }

  if (path === THANKYOU_PATH || path === "/thankyou" || path === "/thank-you") {
    return {
      page: "thankyou",
      merchantOrderId: query.get("merchantOrderId") || "",
    };
  }

  if (path === EXPERIMENT_DASHBOARD_PATH) return { page: "experiment-dashboard" };

  if (query.get("page") === "privacy" || path === "/privacy") return { page: "legal", type: "privacy" };
  if (query.get("page") === "terms" || path === "/terms") return { page: "legal", type: "terms" };

  return { page: "landing" };
}

function normalizePath(pathname) {
  const path = String(pathname || "/").replace(/\/+$/, "");
  return path || "/";
}
