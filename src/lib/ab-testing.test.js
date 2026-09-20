import assert from "node:assert/strict";
import test from "node:test";
import {
  AM2_VARIANT,
  EXPERIMENT_ID,
  ORIGINAL_VARIANT,
  buildCheckoutTarget,
  getExperimentContext,
  resolveLandingRoute,
} from "./ab-testing.js";

test("assigns the original page before rendering and stamps utm_term", () => {
  const windowRef = createWindow("https://thriveonp.com/a-m?utm_source=meta#hero");
  const originalRandom = Math.random;
  Math.random = () => 0.1;
  let result;
  try {
    result = resolveLandingRoute(windowRef);
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
    const result = resolveLandingRoute(windowRef);
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
  const context = getExperimentContext(windowRef);
  assert.equal(context.page_variant, AM2_VARIANT);
  assert.equal(context.entry_type, "direct");
  assert.equal(context.experiment_id, "");
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
