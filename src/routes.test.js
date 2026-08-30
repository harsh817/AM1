import assert from "node:assert/strict";
import test from "node:test";
import { getPageRoute } from "./routes.js";

test("routes requested marketing, checkout, and thank-you URLs", () => {
  assert.deepEqual(getPageRoute("/a-m", ""), { page: "landing" });
  assert.deepEqual(getPageRoute("/am/temp", ""), { page: "landing" });
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
