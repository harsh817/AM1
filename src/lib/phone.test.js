import assert from "node:assert/strict";
import test from "node:test";
import { normalizeIndianMobile, normalizeInternationalPhone } from "./phone.js";

test("normalizes common Indian mobile formats", () => {
  assert.equal(normalizeIndianMobile("9876543210"), "9876543210");
  assert.equal(normalizeIndianMobile("+91 98765 43210"), "9876543210");
  assert.equal(normalizeIndianMobile("091-98765-43210"), "9876543210");
});

test("accepts international phone input for checkout validation", () => {
  assert.equal(normalizeInternationalPhone("+44 20 7946 0958"), "442079460958");
});
