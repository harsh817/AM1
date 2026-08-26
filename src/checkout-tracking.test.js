import assert from "node:assert/strict";
import test from "node:test";
import {
  getCheckoutOrderTrackingPayload,
  getCheckoutTrackingPayload,
  rememberCheckoutOrderTracking,
  rememberCheckoutVisit,
} from "./checkout-tracking.js";

test("keeps first-touch marketing fields and counts checkout engagement", () => {
  const storage = createMemoryStorage();
  const firstContext = createContext({
    storage,
    search: "?utm_source=meta&utm_medium=paid&utm_campaign=summer&utm_content=ad1&utm_term=style",
    referrer: "https://facebook.com/",
  });
  const secondContext = createContext({
    storage,
    search: "?utm_source=google&utm_medium=cpc",
    referrer: "https://google.com/",
  });

  rememberCheckoutVisit(firstContext);
  rememberCheckoutVisit(secondContext);

  const payload = getCheckoutTrackingPayload(secondContext);

  assert.deepEqual(payload.marketing, {
    source: "meta",
    medium: "paid",
    campaign: "summer",
    content: "ad1",
    term: "style",
    id: "",
    referrer: "https://facebook.com/",
  });
  assert.deepEqual(payload.engagement, {
    page_visits: "2",
    form_submissions: "1",
  });
});

test("reads first-touch marketing fields from the referrer landing URL", () => {
  const storage = createMemoryStorage();
  const referrer = "https://thriveonp.com/a-m?utm_source=ig&utm_campaign=AM+-+4%2F08%2F26&utm_medium=First&utm_content=Video&utm_term=%7B%7Bterm.name%7D%7D&utm_id=120254409818390054";
  const context = createContext({
    storage,
    search: "",
    referrer,
  });

  rememberCheckoutVisit(context);

  const payload = getCheckoutTrackingPayload(context);

  assert.deepEqual(payload.marketing, {
    source: "ig",
    medium: "First",
    campaign: "AM - 4/08/26",
    content: "Video",
    term: "{{term.name}}",
    id: "120254409818390054",
    referrer,
  });
});

test("builds device context from browser-like globals", () => {
  const payload = getCheckoutTrackingPayload(createContext({
    screen: { width: 390, height: 844 },
    viewport: { width: 390, height: 700 },
    navigator: {
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1",
      maxTouchPoints: 5,
    },
  }));

  assert.equal(payload.device.type, "mobile");
  assert.equal(payload.device.os, "iOS");
  assert.equal(payload.device.browser, "Safari");
  assert.equal(payload.device.screen_resolution, "390x844");
  assert.equal(payload.device.viewport, "390x700");
  assert.equal(payload.device.is_mobile, "true");
  assert.equal(payload.device.touch_enabled, "true");
});

test("stores and retrieves tracking by merchant order id", () => {
  const storage = createMemoryStorage();
  const context = createContext({ storage });
  const tracking = getCheckoutTrackingPayload(context);

  rememberCheckoutOrderTracking("AM_123", tracking, context);

  assert.deepEqual(getCheckoutOrderTrackingPayload("AM_123", context), tracking);
});

function createContext({
  storage = createMemoryStorage(),
  search = "",
  referrer = "",
  screen = { width: 1920, height: 1080 },
  viewport = { width: 1440, height: 900 },
  navigator = {
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
    maxTouchPoints: 0,
  },
} = {}) {
  return {
    location: { search },
    document: { referrer },
    storage,
    screen,
    viewport,
    navigator,
    touchCapable: Number(navigator.maxTouchPoints || 0) > 0,
  };
}

function createMemoryStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) || null,
    setItem: (key, value) => values.set(key, value),
  };
}
