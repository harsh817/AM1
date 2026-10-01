import assert from "node:assert/strict";
import test from "node:test";
import { normalizeIndianMobile, normalizeInternationalPhone, normalizePhoneInput } from "./phone.js";

test("normalizes common Indian mobile formats", () => {
  assert.equal(normalizeIndianMobile("9876543210"), "9876543210");
  assert.equal(normalizeIndianMobile("+91 98765 43210"), "9876543210");
  assert.equal(normalizeIndianMobile("091-98765-43210"), "9876543210");
});

test("accepts international phone input for checkout validation", () => {
  assert.equal(normalizeInternationalPhone("+44 20 7946 0958"), "442079460958");
});

test("removes a pasted country code from the national phone field", () => {
  assert.equal(normalizePhoneInput("+91 98765 43210", "+91"), "9876543210");
  assert.equal(normalizePhoneInput("+44 20 7946 0958", "+44"), "2079460958");
});
