import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { CLARITY_PROJECT_ID, initializeAnalytics, META_PIXEL_ID } from "./analytics.js";

const indexHtml = readFileSync(new URL("../../index.html", import.meta.url), "utf8");

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
  assert.deepEqual(pixelCalls, [
    ["init", META_PIXEL_ID],
    ["track", "PageView"],
  ]);
});
