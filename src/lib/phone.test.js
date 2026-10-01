import assert from "node:assert/strict";
import test from "node:test";
import { getInitialPhoneCountryCode, normalizeIndianMobile, normalizeInternationalPhone, normalizePhoneInput } from "./phone.js";

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

test("defaults empty checkout drafts to India and preserves a saved country with a number", () => {
  assert.equal(getInitialPhoneCountryCode({ phoneCountryCode: "+1" }), "+91");
  assert.equal(getInitialPhoneCountryCode({ phone: "9876543210", phoneCountryCode: "+44" }), "+44");
  assert.equal(getInitialPhoneCountryCode({ phone: "9876543210" }), "+91");
});
