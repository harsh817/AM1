import assert from "node:assert/strict";
import test from "node:test";
import {
  AM2_VARIANT,
  EXPERIMENT_ID,
  ORIGINAL_VARIANT,
  buildCheckoutTarget,
  getExperimentContext,
  resolveLandingRoute,
  sendExperimentLanding,
} from "./ab-testing.js";

test("assigns the original page before rendering and stamps utm_term", () => {
  const windowRef = createWindow("https://thriveonp.com/a-m?utm_source=meta#hero");
  const originalRandom = Math.random;
  Math.random = () => 0.1;
  let result;
  try {
    result = resolveLandingRoute(windowRef, { enabled: true, amPercentage: 50, am2Percentage: 50 });
  } finally {
    Math.random = originalRandom;
  }

  assert.deepEqual(result.page, "landing");
  assert.equal(new URL(windowRef.location.href).searchParams.get("utm_term"), ORIGINAL_VARIANT);
  assert.equal(getExperimentContext(windowRef).page_variant, ORIGINAL_VARIANT);
  assert.equal(getExperimentContext(windowRef).experiment_id, EXPERIMENT_ID);
});

test("redirects the variant before rendering and preserves campaign parameters", () => {
  const windowRef = createWindow("https://thriveonp.com/a-m?utm_source=meta#hero");
  const originalRandom = Math.random;
  Math.random = () => 0.9;

  try {
    const result = resolveLandingRoute(windowRef, { enabled: true, amPercentage: 50, am2Percentage: 50 });
    assert.equal(result.page, "pending");
    assert.equal(windowRef.replaced, "/AM2?utm_source=meta&utm_term=AM2#hero");
  } finally {
    Math.random = originalRandom;
  }
});

test("builds checkout URLs from the displayed variant context", () => {
  const windowRef = createWindow("https://thriveonp.com/AM2?utm_source=meta&utm_term=AM2#purchase");
  assert.equal(buildCheckoutTarget("/a-m-checkout", windowRef), "/a-m-checkout?utm_source=meta&utm_term=AM2");
});

test("keeps direct AM2 visits outside the randomized experiment", () => {
  const windowRef = createWindow("https://thriveonp.com/AM2");
  resolveLandingRoute(windowRef);
  const context = getExperimentContext(windowRef);
  assert.equal(context.page_variant, AM2_VARIANT);
  assert.equal(context.entry_type, "direct");
  assert.equal(context.experiment_id, "");
  assert.equal(new URL(windowRef.location.href).searchParams.get("utm_term"), AM2_VARIANT);
});

test("returns checkout path unchanged without a browser location", () => {
  assert.equal(buildCheckoutTarget("/a-m-checkout", null), "/a-m-checkout");
});

test("uses an existing v3 assignment on non-landing routes", () => {
  const windowRef = createWindow("https://thriveonp.com/a-m-checkout");
  windowRef.sessionStorage.setItem("attractivemen-ab-v3", JSON.stringify({
    experimentId: EXPERIMENT_ID,
    variant: AM2_VARIANT,
    visitorId: "returning-visitor",
  }));
  assert.deepEqual(getExperimentContext(windowRef), {
    experiment_id: EXPERIMENT_ID,
    visitor_id: "returning-visitor",
    page_variant: AM2_VARIANT,
    entry_type: "randomized",
  });
});

test("fails closed to the promoted control when experiment configuration is unavailable", () => {
  const windowRef = createWindow("https://thriveonp.com/a-m?utm_term=AM2");
  const result = resolveLandingRoute(windowRef, { enabled: false });
  assert.deepEqual(result, { page: "landing", experiment: null });
  assert.equal(new URL(windowRef.location.href).searchParams.get("utm_term"), ORIGINAL_VARIANT);
});

test("starts v3 enrollment with a previous visitor ID but not the prior experiment assignment", () => {
  const windowRef = createWindow("https://thriveonp.com/a-m");
  windowRef.document.cookie = `attractivemen-ab-v1=${encodeURIComponent(JSON.stringify({ experimentId: "am-vs-am2-v2", variant: "AM2", visitorId: "known-visitor" }))}`;
  const originalRandom = Math.random;
  Math.random = () => 0.1;
  try {
    resolveLandingRoute(windowRef, { enabled: true, amPercentage: 50, am2Percentage: 50 });
  } finally {
    Math.random = originalRandom;
  }
  assert.equal(getExperimentContext(windowRef).visitor_id, "known-visitor");
  assert.equal(getExperimentContext(windowRef).experiment_id, EXPERIMENT_ID);
  assert.equal(getExperimentContext(windowRef).page_variant, ORIGINAL_VARIANT);
});

test("keeps a returning assignment when cookies and local storage are blocked", () => {
  const windowRef = createWindow("https://thriveonp.com/a-m");
  const sessionStorage = createStorage();
  windowRef.localStorage = blockedStorage();
  windowRef.sessionStorage = sessionStorage;
  blockCookies(windowRef.document);

  const originalRandom = Math.random;
  Math.random = () => 0.9;
  try {
    assert.equal(resolveLandingRoute(windowRef, { enabled: true, amPercentage: 50 }).page, "pending");
    windowRef.replaced = null;
    assert.equal(resolveLandingRoute(windowRef, { enabled: true, amPercentage: 100 }).page, "pending");
  } finally {
    Math.random = originalRandom;
  }

  assert.equal(windowRef.replaced, "/AM2?utm_term=AM2");
  assert.equal(JSON.parse(sessionStorage.getItem("attractivemen-ab-v3")).variant, AM2_VARIANT);
});

test("serves the promoted control without enrollment when all storage is blocked", () => {
  const windowRef = createWindow("https://thriveonp.com/a-m?utm_source=meta");
  windowRef.localStorage = blockedStorage();
  windowRef.sessionStorage = blockedStorage();
  blockCookies(windowRef.document);

  const originalRandom = Math.random;
  Math.random = () => 0.9;
  let result;
  try {
    result = resolveLandingRoute(windowRef, { enabled: true, amPercentage: 50 });
  } finally {
    Math.random = originalRandom;
  }

  assert.deepEqual(result, { page: "landing", experiment: null });
  assert.equal(new URL(windowRef.location.href).searchParams.get("utm_term"), ORIGINAL_VARIANT);
  assert.equal(windowRef.replaced, undefined);
});

test("sends one landing event with campaign fields and deduplicates refreshes", async () => {
  const windowRef = createWindow("https://thriveonp.com/AM2?utm_source=meta&utm_campaign=fall&fbclid=click-1");
  const originalFetch = globalThis.fetch;
  const requests = [];
  globalThis.fetch = async (url, options) => {
    requests.push({ url, options });
    return { ok: true };
  };
  try {
    assert.equal(sendExperimentLanding(windowRef), true);
    assert.equal(sendExperimentLanding(windowRef), false);
    await new Promise((resolve) => setImmediate(resolve));
  } finally {
    globalThis.fetch = originalFetch;
  }

  assert.equal(requests.length, 1);
  assert.equal(requests[0].url, "/api/experiment/landing");
  const body = JSON.parse(requests[0].options.body);
  assert.equal(body.page_variant, AM2_VARIANT);
  assert.equal(body.entry_type, "direct");
  assert.equal(body.marketing.source, "meta");
  assert.equal(body.marketing.campaign, "fall");
  assert.equal(body.marketing.fbclid, "click-1");
});

test("handles unavailable storage properties when resolving browser context", () => {
  const windowRef = createWindow("https://thriveonp.com/AM2");
  Object.defineProperty(windowRef, "localStorage", { get() { throw new Error("Blocked"); } });
  Object.defineProperty(windowRef, "sessionStorage", { get() { throw new Error("Blocked"); } });
  assert.equal(getExperimentContext({ location: windowRef.location, document: windowRef.document }).page_variant, AM2_VARIANT);
});

function createWindow(href) {
  const storage = createStorage();
  const sessionStorage = createStorage();
  const location = new URL(href);
  const windowRef = {
    location,
    document: { cookie: "", referrer: "" },
    localStorage: storage,
    sessionStorage,
    history: {
      replaceState: (_state, _title, nextUrl) => {
        const next = new URL(nextUrl, location.origin);
        location.pathname = next.pathname;
        location.search = next.search;
        location.hash = next.hash;
      },
    },
    crypto: { randomUUID: () => "visitor-123" },
    replace: null,
  };
  location.replace = (nextUrl) => { windowRef.replaced = nextUrl; };
  return windowRef;
}

function createStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) || null,
    setItem: (key, value) => values.set(key, value),
  };
}

function blockedStorage() {
  return {
    getItem() { throw new Error("Storage unavailable"); },
    setItem() { throw new Error("Storage unavailable"); },
  };
}

function blockCookies(document) {
  Object.defineProperty(document, "cookie", {
    configurable: true,
    get: () => "",
    set: () => {},
  });
}
