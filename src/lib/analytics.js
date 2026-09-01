import {
  buildPaymentEventId,
  createOpaqueToken,
  getPixelValue,
  insertAsyncScript,
  removeEmptyValues,
  toCurrency,
  toEventToken,
  toSafeRoute,
  toSafeValue,
} from "./analytics-utils.js";

export const META_PIXEL_ID = "2647411082380065";
export const CLARITY_PROJECT_ID = "xx2rulxltt";
export const ANALYTICS_CURRENCY = "INR";
export { buildPaymentEventId } from "./analytics-utils.js";

const META_PIXEL_SCRIPT_ID = "meta-pixel-sdk";
const CLARITY_SCRIPT_ID = "clarity-sdk";
const META_PIXEL_SRC = "https://connect.facebook.net/en_US/fbevents.js";
const CLARITY_SRC = `https://www.clarity.ms/tag/${CLARITY_PROJECT_ID}`;
const PRODUCT_CONTENT_NAME = "AttractiveMen Personalized Style Report";

/**
 * Loads Meta Pixel and Microsoft Clarity after the app can render.
 *
 * @param {Window|object|undefined} optionsOrWindow Browser window-like object or options.
 * @param {object} maybeOptions Options when the first argument is a window-like object.
 * @returns {boolean} True when analytics initialization ran for this page.
 */
export function initializeAnalytics(optionsOrWindow, maybeOptions = {}) {
  const { windowRef, trackPageView, route } = getInitializeOptions(optionsOrWindow, maybeOptions);
  const documentRef = windowRef?.document;

  if (!documentRef) {
    return false;
  }

  const initializedNow = !windowRef.__attractiveMenAnalyticsInitialized;

  if (initializedNow) {
    windowRef.__attractiveMenAnalyticsInitialized = true;
    initializeMetaPixel(windowRef, documentRef);
    initializeClarity(windowRef, documentRef);
  }

  if (trackPageView) {
    trackMetaPageView(windowRef, route);
  }

  return initializedNow;
}

export function trackLandingView({ windowRef = globalThis.window, route = "/a-m" } = {}) {
  return trackFunnelEvent(windowRef, {
    eventId: getPageEventId(windowRef, "ViewContent"),
    metaMethod: "track",
    metaEventName: "ViewContent",
    clarityEventName: "landing_view",
    funnelStep: "landing_view",
    route,
  });
}

export function trackCheckoutView({ windowRef = globalThis.window, route = "/a-m-checkout" } = {}) {
  return trackFunnelEvent(windowRef, {
    eventId: getPageEventId(windowRef, "InitiateCheckout"),
    metaMethod: "track",
    metaEventName: "InitiateCheckout",
    clarityEventName: "checkout_view",
    funnelStep: "checkout_view",
    route,
    currency: ANALYTICS_CURRENCY,
  });
}

export function trackPaymentStarted({
  windowRef = globalThis.window,
  merchantOrderId = "",
  amountPaise,
  currency = ANALYTICS_CURRENCY,
  route = "/a-m-checkout",
} = {}) {
  const value = getPixelValue(amountPaise);
  if (!value) return false;

  return trackFunnelEvent(windowRef, {
    eventId: buildPaymentEventId("PaymentStarted", merchantOrderId),
    metaMethod: "trackCustom",
    metaEventName: "PaymentStarted",
    clarityEventName: "payment_started",
    funnelStep: "payment_started",
    route,
    currency,
    value,
    paymentState: "INITIATED",
  });
}

export function trackPaymentCompleted({
  windowRef = globalThis.window,
  merchantOrderId = "",
  amountPaise,
  currency = ANALYTICS_CURRENCY,
  route = "/a-m-thankyou",
} = {}) {
  const value = getPixelValue(amountPaise);
  if (!value) return false;

  return trackFunnelEvent(windowRef, {
    eventId: buildPaymentEventId("Purchase", merchantOrderId),
    metaMethod: "track",
    metaEventName: "Purchase",
    clarityEventName: "payment_completed",
    funnelStep: "payment_completed",
    route,
    currency,
    value,
    paymentState: "COMPLETED",
  });
}

export function trackPaymentFailed({
  windowRef = globalThis.window,
  merchantOrderId = "",
  amountPaise,
  currency = ANALYTICS_CURRENCY,
  route = "/a-m-thankyou",
} = {}) {
  const value = getPixelValue(amountPaise);

  return trackFunnelEvent(windowRef, {
    eventId: buildPaymentEventId("PaymentFailed", merchantOrderId),
    metaMethod: "trackCustom",
    metaEventName: "PaymentFailed",
    clarityEventName: "payment_failed",
    funnelStep: "payment_failed",
    route,
    currency,
    value,
    paymentState: "FAILED",
  });
}

function getInitializeOptions(optionsOrWindow, maybeOptions) {
  if (isWindowLike(optionsOrWindow) || optionsOrWindow === undefined) {
    return {
      windowRef: optionsOrWindow ?? globalThis.window,
      trackPageView: maybeOptions.trackPageView ?? true,
      route: maybeOptions.route ?? getCurrentRoute(optionsOrWindow ?? globalThis.window),
    };
  }

  return {
    windowRef: optionsOrWindow?.windowRef ?? globalThis.window,
    trackPageView: optionsOrWindow?.trackPageView ?? true,
    route: optionsOrWindow?.route ?? getCurrentRoute(optionsOrWindow?.windowRef ?? globalThis.window),
  };
}

function isWindowLike(value) {
  return Boolean(value?.document || value?.location || value?.navigator);
}

function trackMetaPageView(windowRef, route) {
  if (!windowRef?.fbq || windowRef.__attractiveMenMetaPageViewTracked) return false;

  windowRef.fbq("track", "PageView", {}, {
    eventID: getPageEventId(windowRef, "PageView", route),
  });
  windowRef.__attractiveMenMetaPageViewTracked = true;
  return true;
}

function trackFunnelEvent(windowRef, {
  eventId,
  metaMethod,
  metaEventName,
  clarityEventName,
  funnelStep,
  route,
  currency,
  value,
  paymentState,
}) {
  if (!windowRef || !eventId) return false;

  const trackedEvents = getTrackedEvents(windowRef);
  if (trackedEvents.has(eventId)) return false;

  const params = buildSafeEventParams({
    funnelStep,
    route,
    currency,
    value,
    paymentState,
  });
  let sent = false;

  if (windowRef.fbq) {
    windowRef.fbq(metaMethod, metaEventName, params, { eventID: eventId });
    sent = true;
  }

  if (windowRef.clarity) {
    sendClarityEvent(windowRef, clarityEventName, params);
    sent = true;
  }

  if (!sent) return false;

  trackedEvents.add(eventId);
  return true;
}

function buildSafeEventParams({ funnelStep, route, currency, value, paymentState }) {
  return removeEmptyValues({
    content_name: PRODUCT_CONTENT_NAME,
    funnel_step: toSafeValue(funnelStep),
    route: toSafeRoute(route),
    currency: toCurrency(currency),
    payment_state: toSafeValue(paymentState),
    value,
  });
}

function sendClarityEvent(windowRef, eventName, params) {
  const clarity = windowRef.clarity;
  const tags = {
    funnel_step: params.funnel_step,
    route: params.route,
    payment_state: params.payment_state,
    currency: params.currency,
  };

  for (const [key, value] of Object.entries(removeEmptyValues(tags))) {
    clarity("set", key, value);
  }

  clarity("event", eventName);
}

function getTrackedEvents(windowRef) {
  if (!windowRef.__attractiveMenAnalyticsTrackedEvents) {
    windowRef.__attractiveMenAnalyticsTrackedEvents = new Set();
  }

  return windowRef.__attractiveMenAnalyticsTrackedEvents;
}

function getPageEventId(windowRef, eventName, route = getCurrentRoute(windowRef)) {
  if (!windowRef) return "";
  if (!windowRef.__attractiveMenAnalyticsPageEventIds) {
    windowRef.__attractiveMenAnalyticsPageEventIds = {};
  }

  const key = `${toEventToken(eventName)}:${toSafeRoute(route)}`;
  if (!windowRef.__attractiveMenAnalyticsPageEventIds[key]) {
    windowRef.__attractiveMenAnalyticsPageEventIds[key] = `am_${toEventToken(eventName)}_${createOpaqueToken(windowRef)}`;
  }

  return windowRef.__attractiveMenAnalyticsPageEventIds[key];
}

function getCurrentRoute(windowRef) {
  return windowRef?.location?.pathname || "";
}

function initializeMetaPixel(windowRef, documentRef) {
  if (!windowRef.fbq) {
    const fbq = function pixelQueue() {
      if (fbq.callMethod) {
        fbq.callMethod.apply(fbq, arguments);
        return;
      }

      fbq.queue.push(arguments);
    };

    if (!windowRef._fbq) windowRef._fbq = fbq;
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = "2.0";
    fbq.queue = [];
    windowRef.fbq = fbq;
  }

  insertAsyncScript(documentRef, META_PIXEL_SCRIPT_ID, META_PIXEL_SRC);
  windowRef.fbq("init", META_PIXEL_ID);
}

function initializeClarity(windowRef, documentRef) {
  if (!windowRef.clarity) {
    windowRef.clarity = function clarityQueue() {
      (windowRef.clarity.q = windowRef.clarity.q || []).push(arguments);
    };
  }

  insertAsyncScript(documentRef, CLARITY_SCRIPT_ID, CLARITY_SRC);
}
