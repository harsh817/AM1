export const LANDING_PATH = "/a-m";
export const CHECKOUT_PATH = "/a-m-checkout";
export const THANKYOU_PATH = "/a-m-thankyou";

export function getPageRoute(pathname, search = "") {
  const query = new URLSearchParams(search);
  const path = normalizePath(pathname);

  if (path === LANDING_PATH) {
    return { page: "landing" };
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

  if (query.get("page") === "privacy" || path === "/privacy") return { page: "legal", type: "privacy" };
  if (query.get("page") === "terms" || path === "/terms") return { page: "legal", type: "terms" };

  return { page: "landing" };
}

function normalizePath(pathname) {
  const path = String(pathname || "/").replace(/\/+$/, "");
  return path || "/";
}
