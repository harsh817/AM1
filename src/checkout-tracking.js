const TRACKING_KEY = "attractivemen-checkout-tracking";
const ORDER_TRACKING_KEY = "attractivemen-checkout-order-tracking";

export function rememberCheckoutVisit(context = getBrowserContext()) {
  const state = readTracking(context.storage);
  const marketing = mergeFirstTouchMarketing(
    state.marketing,
    context.location?.search || "",
    context.document?.referrer || "",
  );
  const next = {
    marketing,
    pageVisits: positiveCount(state.pageVisits) + 1,
    formSubmissions: positiveCount(state.formSubmissions),
  };

  writeTracking(context.storage, next);
  return next;
}

export function getCheckoutTrackingPayload(context = getBrowserContext()) {
  const state = readTracking(context.storage);
  const next = {
    marketing: normalizeMarketing(state.marketing),
    pageVisits: positiveCount(state.pageVisits),
    formSubmissions: positiveCount(state.formSubmissions) + 1,
  };

  writeTracking(context.storage, next);

  return {
    device: buildDevice(context),
    marketing: next.marketing,
    engagement: {
      page_visits: String(next.pageVisits),
      form_submissions: String(next.formSubmissions),
    },
  };
}

export function rememberCheckoutOrderTracking(merchantOrderId, tracking, context = getBrowserContext()) {
  const orderTracking = readOrderTracking(context.storage);
  const orderId = clean(merchantOrderId, 128);
  if (!orderId) return;

  orderTracking[orderId] = normalizeTrackingPayload(tracking);
  writeOrderTracking(context.storage, orderTracking);
}

export function getCheckoutOrderTrackingPayload(merchantOrderId, context = getBrowserContext()) {
  const orderId = clean(merchantOrderId, 128);
  const orderTracking = readOrderTracking(context.storage);
  return normalizeTrackingPayload(orderTracking[orderId] || getCheckoutTrackingSnapshot(context));
}

export function getCheckoutTrackingSnapshot(context = getBrowserContext()) {
  const state = readTracking(context.storage);

  return {
    device: buildDevice(context),
    marketing: normalizeMarketing(state.marketing),
    engagement: {
      page_visits: String(positiveCount(state.pageVisits)),
      form_submissions: String(positiveCount(state.formSubmissions)),
    },
  };
}

function mergeFirstTouchMarketing(current = {}, search, referrer) {
  const checkoutMarketing = readMarketingParams(new URLSearchParams(search));
  const referrerMarketing = readReferrerMarketing(referrer);
  const incoming = {
    source: checkoutMarketing.source || referrerMarketing.source,
    medium: checkoutMarketing.medium || referrerMarketing.medium,
    campaign: checkoutMarketing.campaign || referrerMarketing.campaign,
    content: checkoutMarketing.content || referrerMarketing.content,
    term: checkoutMarketing.term || referrerMarketing.term,
    id: checkoutMarketing.id || referrerMarketing.id,
    referrer: referrer || "",
  };

  return Object.fromEntries(
    Object.entries(normalizeMarketing(current)).map(([key, value]) => [key, value || incoming[key] || ""]),
  );
}

function readReferrerMarketing(referrer) {
  try {
    return readMarketingParams(new URL(referrer).searchParams);
  } catch {
    return readMarketingParams();
  }
}

function readMarketingParams(params = new URLSearchParams()) {
  return {
    source: params.get("utm_source") || "",
    medium: params.get("utm_medium") || "",
    campaign: params.get("utm_campaign") || "",
    content: params.get("utm_content") || "",
    term: params.get("utm_term") || "",
    id: params.get("utm_id") || "",
  };
}

function normalizeMarketing(marketing = {}) {
  return {
    source: clean(marketing.source),
    medium: clean(marketing.medium),
    campaign: clean(marketing.campaign),
    content: clean(marketing.content),
    term: clean(marketing.term),
    id: clean(marketing.id),
    referrer: clean(marketing.referrer, 512),
  };
}

function normalizeTrackingPayload(tracking = {}) {
  return {
    device: normalizeDevice(tracking.device),
    marketing: normalizeMarketing(tracking.marketing),
    engagement: {
      page_visits: String(positiveCount(tracking.engagement?.page_visits)),
      form_submissions: String(positiveCount(tracking.engagement?.form_submissions)),
    },
  };
}

function normalizeDevice(device = {}) {
  return {
    type: clean(device.type),
    os: clean(device.os),
    browser: clean(device.browser),
    screen_resolution: clean(device.screen_resolution),
    viewport: clean(device.viewport),
    is_mobile: clean(device.is_mobile, 8),
    touch_enabled: clean(device.touch_enabled, 8),
    user_agent: clean(device.user_agent, 512),
  };
}

function buildDevice(context) {
  const navigator = context.navigator || {};
  const userAgent = navigator.userAgent || "";
  const viewport = context.viewport || {
    width: context.window?.innerWidth,
    height: context.window?.innerHeight,
  };
  const screen = context.screen || {};
  const touchEnabled = Boolean(context.touchCapable || Number(navigator.maxTouchPoints || 0) > 0);
  const isMobile = isMobileDevice(userAgent, viewport.width);

  return {
    type: getDeviceType(userAgent, isMobile),
    os: getOperatingSystem(userAgent),
    browser: getBrowser(userAgent),
    screen_resolution: dimensions(screen.width, screen.height),
    viewport: dimensions(viewport.width, viewport.height),
    is_mobile: String(isMobile),
    touch_enabled: String(touchEnabled),
    user_agent: clean(userAgent, 512),
  };
}

function getDeviceType(userAgent, isMobile) {
  if (/ipad|tablet/i.test(userAgent)) return "tablet";
  return isMobile ? "mobile" : "desktop";
}

function getOperatingSystem(userAgent) {
  if (/android/i.test(userAgent)) return "Android";
  if (/iphone|ipad|ipod/i.test(userAgent)) return "iOS";
  if (/windows/i.test(userAgent)) return "Windows";
  if (/mac os x|macintosh/i.test(userAgent)) return "macOS";
  if (/linux/i.test(userAgent)) return "Linux";
  return "";
}

function getBrowser(userAgent) {
  if (/edg\//i.test(userAgent)) return "Edge";
  if (/firefox\//i.test(userAgent)) return "Firefox";
  if (/chrome\//i.test(userAgent) && !/edg\//i.test(userAgent)) return "Chrome";
  if (/safari\//i.test(userAgent) && !/chrome\//i.test(userAgent)) return "Safari";
  return "";
}

function isMobileDevice(userAgent, viewportWidth) {
  return /android|iphone|ipod|mobile/i.test(userAgent) || Number(viewportWidth || 0) < 768;
}

function dimensions(width, height) {
  return width && height ? `${Math.round(width)}x${Math.round(height)}` : "";
}

function readTracking(storage) {
  try {
    return JSON.parse(storage?.getItem(TRACKING_KEY) || "{}") || {};
  } catch {
    return {};
  }
}

function writeTracking(storage, value) {
  try {
    storage?.setItem(TRACKING_KEY, JSON.stringify(value));
  } catch {
    // Tracking should never block checkout.
  }
}

function readOrderTracking(storage) {
  try {
    return JSON.parse(storage?.getItem(ORDER_TRACKING_KEY) || "{}") || {};
  } catch {
    return {};
  }
}

function writeOrderTracking(storage, value) {
  try {
    storage?.setItem(ORDER_TRACKING_KEY, JSON.stringify(value));
  } catch {
    // Tracking should never block checkout.
  }
}

function positiveCount(value) {
  const count = Number.parseInt(value, 10);
  return Number.isFinite(count) && count > 0 ? count : 0;
}

function clean(value, maxLength = 256) {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function getBrowserContext() {
  const win = globalThis.window;

  return {
    location: win?.location,
    document: globalThis.document,
    storage: win?.localStorage,
    navigator: globalThis.navigator,
    screen: win?.screen,
    window: win,
    touchCapable: Boolean(win && "ontouchstart" in win),
  };
}
