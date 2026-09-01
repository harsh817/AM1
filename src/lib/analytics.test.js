import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  CLARITY_PROJECT_ID,
  buildPaymentEventId,
  initializeAnalytics,
  META_PIXEL_ID,
  trackCheckoutView,
  trackLandingView,
  trackPaymentCompleted,
  trackPaymentFailed,
  trackPaymentStarted,
} from "./analytics.js";

const indexHtml = readFileSync(new URL("../../index.html", import.meta.url), "utf8");
const checkoutHtml = readFileSync(new URL("../../checkout.html", import.meta.url), "utf8");

function createFakeWindow() {
  const scripts = [];
  const scriptsById = new Map();
  const parentNode = {
    insertBefore(element) {
      scripts.unshift(element);
      if (element.id) scriptsById.set(element.id, element);
    },
  };

  scripts.push({ parentNode });

  return {
    document: {
      head: {
        appendChild(element) {
          scripts.push(element);
          if (element.id) scriptsById.set(element.id, element);
        },
      },
      createElement(tagName) {
        return { async: false, id: "", src: "", tagName };
      },
      getElementById(id) {
        return scriptsById.get(id) || null;
      },
      getElementsByTagName(tagName) {
        return tagName === "script" ? scripts : [];
      },
    },
    scripts,
  };
}

test("analytics initialization no-ops without browser document access", () => {
  assert.equal(initializeAnalytics(undefined), false);
  assert.equal(initializeAnalytics({}), false);
});

test("main HTML does not bootstrap analytics before the React app entry", () => {
  assert.doesNotMatch(indexHtml, /fbq\('init'|www\.clarity\.ms\/tag/);
  assert.match(indexHtml, /facebook\.com\/tr\?id=2647411082380065&ev=PageView&noscript=1/);
  assert.match(indexHtml, /<script type="module" src="\/src\/main\.jsx"><\/script>/);
});

test("checkout HTML does not duplicate analytics bootstraps before React", () => {
  assert.doesNotMatch(checkoutHtml, /fbq\('init'|www\.clarity\.ms\/tag/);
  assert.match(checkoutHtml, /facebook\.com\/tr\?id=2647411082380065&ev=PageView&noscript=1/);
  assert.match(checkoutHtml, /<script type="module" src="\/src\/main\.jsx"><\/script>/);
});

test("analytics scripts are loaded asynchronously after initialization", () => {
  const windowRef = createFakeWindow();

  assert.equal(initializeAnalytics(windowRef), true);

  const metaScript = windowRef.document.getElementById("meta-pixel-sdk");
  const clarityScript = windowRef.document.getElementById("clarity-sdk");

  assert.equal(metaScript.async, true);
  assert.equal(metaScript.src, "https://connect.facebook.net/en_US/fbevents.js");
  assert.equal(clarityScript.async, true);
  assert.equal(clarityScript.src, `https://www.clarity.ms/tag/${CLARITY_PROJECT_ID}`);
});

test("analytics duplicate initialization does not duplicate scripts or page views", () => {
  const windowRef = createFakeWindow();

  initializeAnalytics(windowRef);
  initializeAnalytics(windowRef);

  const analyticsScripts = windowRef.scripts.filter((script) => script.id?.endsWith("-sdk"));
  const pixelCalls = windowRef.fbq.queue.map((args) => Array.from(args));

  assert.equal(analyticsScripts.length, 2);
  assert.equal(pixelCalls.length, 2);
  assert.deepEqual(pixelCalls[0], ["init", META_PIXEL_ID]);
  assert.equal(pixelCalls[1][0], "track");
  assert.equal(pixelCalls[1][1], "PageView");
  assert.deepEqual(pixelCalls[1][2], {});
  assert.match(pixelCalls[1][3].eventID, /^am_pageview_/);
});

test("analytics can initialize without firing a thank-you page view", () => {
  const windowRef = createFakeWindow();

  assert.equal(initializeAnalytics({ windowRef, trackPageView: false }), true);

  const pixelCalls = windowRef.fbq.queue.map((args) => Array.from(args));
  assert.deepEqual(pixelCalls, [["init", META_PIXEL_ID]]);
});

test("safe funnel events map to Meta Pixel and Clarity without PII", () => {
  const windowRef = createFakeWindow();
  initializeAnalytics(windowRef);

  assert.equal(trackLandingView({ windowRef, route: "/a-m" }), true);
  assert.equal(trackCheckoutView({ windowRef, route: "/a-m-checkout" }), true);
  assert.equal(trackPaymentStarted({
    windowRef,
    merchantOrderId: "AM_123",
    amountPaise: 235882,
    currency: "INR",
    route: "/a-m-checkout",
    email: "customer@example.com",
    phone: "9999999999",
  }), true);
  assert.equal(trackPaymentFailed({
    windowRef,
    merchantOrderId: "AM_123",
    amountPaise: 235882,
    currency: "INR",
    route: "/a-m-thankyou",
  }), true);

  const pixelCalls = windowRef.fbq.queue.map((args) => Array.from(args));
  assert.deepEqual(pixelCalls.map((call) => call.slice(0, 2)), [
    ["init", META_PIXEL_ID],
    ["track", "PageView"],
    ["track", "ViewContent"],
    ["track", "InitiateCheckout"],
    ["trackCustom", "PaymentStarted"],
    ["trackCustom", "PaymentFailed"],
  ]);
  assert.equal(pixelCalls[4][2].value, 2358.82);
  assert.equal(pixelCalls[4][2].currency, "INR");
  assert.equal(pixelCalls[4][2].funnel_step, "payment_started");
  assert.match(pixelCalls[4][3].eventID, /^am_paymentstarted_/);

  const serializedCalls = JSON.stringify({
    pixel: pixelCalls,
    clarity: windowRef.clarity.q.map((args) => Array.from(args)),
  });
  assert.doesNotMatch(serializedCalls, /customer@example\.com|9999999999|AM_123/);
  assert.match(serializedCalls, /landing_view|checkout_view|payment_started|payment_failed/);
});

test("purchase fires once only with verified payment amount", () => {
  const windowRef = createFakeWindow();
  initializeAnalytics({ windowRef, trackPageView: false });

  assert.equal(trackPaymentCompleted({
    windowRef,
    merchantOrderId: "AM_123",
    amountPaise: 330046,
    currency: "INR",
    route: "/a-m-thankyou",
  }), true);
  assert.equal(trackPaymentCompleted({
    windowRef,
    merchantOrderId: "AM_123",
    amountPaise: 330046,
    currency: "INR",
    route: "/a-m-thankyou",
  }), false);
  assert.equal(trackPaymentCompleted({
    windowRef,
    merchantOrderId: "AM_124",
    amountPaise: "",
    currency: "INR",
    route: "/a-m-thankyou",
  }), false);

  const purchaseCalls = windowRef.fbq.queue
    .map((args) => Array.from(args))
    .filter((call) => call[1] === "Purchase");

  assert.equal(purchaseCalls.length, 1);
  assert.equal(purchaseCalls[0][2].value, 3300.46);
  assert.equal(purchaseCalls[0][2].currency, "INR");
  assert.equal(purchaseCalls[0][2].payment_state, "COMPLETED");
  assert.equal(purchaseCalls[0][3].eventID, buildPaymentEventId("Purchase", "AM_123"));
});
