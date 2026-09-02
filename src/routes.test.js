import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { getPageRoute } from "./routes.js";

test("routes requested marketing, checkout, and thank-you URLs", () => {
  assert.deepEqual(getPageRoute("/a-m", ""), { page: "landing" });
  assert.deepEqual(getPageRoute("/a-m-checkout", ""), { page: "checkout" });
  assert.deepEqual(getPageRoute("/a-m-thankyou", "?merchantOrderId=AM_123"), {
    page: "thankyou",
    merchantOrderId: "AM_123",
  });
});

test("keeps legacy routes working", () => {
  assert.deepEqual(getPageRoute("/", ""), { page: "landing" });
  assert.deepEqual(getPageRoute("/checkout", ""), { page: "checkout" });
  assert.deepEqual(getPageRoute("/checkout.html", ""), { page: "checkout" });
  assert.deepEqual(getPageRoute("/", "?page=checkout"), { page: "checkout" });
});

test("production CSP allows bundled fonts and Cloudinary videos", () => {
  const config = JSON.parse(
    readFileSync(new URL("../vercel.json", import.meta.url), "utf8"),
  );
  const contentSecurityPolicy = config.headers
    .flatMap((entry) => entry.headers)
    .find((header) => header.key === "Content-Security-Policy")?.value;

  assert.match(contentSecurityPolicy, /font-src 'self' data: https:\/\/fonts\.gstatic\.com/);
  assert.match(contentSecurityPolicy, /media-src 'self' https:\/\/res\.cloudinary\.com/);
});

test("production rewrites expose only current AM1 public routes", () => {
  const config = JSON.parse(
    readFileSync(new URL("../vercel.json", import.meta.url), "utf8"),
  );
  const rewriteSources = config.rewrites.map((rewrite) => rewrite.source);

  assert.deepEqual(rewriteSources, ["/a-m", "/a-m-checkout", "/a-m-thankyou"]);
  assert.ok(!rewriteSources.includes("/am/temp"));
});

test("production cache headers are explicit for app routes and assets", () => {
  const config = JSON.parse(
    readFileSync(new URL("../vercel.json", import.meta.url), "utf8"),
  );
  const headersBySource = new Map(config.headers.map((entry) => [entry.source, entry.headers]));

  for (const source of ["/", "/a-m", "/a-m-checkout", "/a-m-thankyou", "/privacy", "/terms"]) {
    assertHeader(headersBySource, source, "Cache-Control", "no-store, max-age=0");
  }

  assertHeader(headersBySource, "/assets/(.*)", "Cache-Control", "public, max-age=31536000, immutable");
});

function assertHeader(headersBySource, source, key, value) {
  const header = headersBySource.get(source)?.find((entry) => entry.key === key);
  assert.equal(header?.value, value);
}
