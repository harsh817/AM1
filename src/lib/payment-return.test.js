import assert from "node:assert/strict";
import test from "node:test";
import {
  getAssessmentFormUrl,
  DEFAULT_ASSESSMENT_FORM_URL,
  getFailedPaymentRetryUrl,
  getPaymentDestination,
  getPaymentStatusUrl,
  markFailedPaymentRetry,
  FAILED_RETRY_MARKER,
} from "./payment-return.js";

test("payment outcomes map only verified final states to their dedicated pages", () => {
  assert.equal(getPaymentDestination("COMPLETED", "AM 1"), "/a-m-thankyou?merchantOrderId=AM%201");
  assert.equal(getPaymentDestination("FAILED", "AM_1"), "/a-m-payment-failed?merchantOrderId=AM_1");
  assert.equal(getPaymentDestination("PENDING", "AM_1"), "");
  assert.equal(getPaymentDestination("UNKNOWN", "AM_1"), "");
  assert.equal(getPaymentDestination("COMPLETED", ""), "");
});

test("status and retry routes carry only the merchant order reference", () => {
  assert.equal(getPaymentStatusUrl("AM_1"), "/a-m-payment-status?merchantOrderId=AM_1");
  assert.equal(getFailedPaymentRetryUrl("AM_1"), "/a-m-checkout?retryOrderId=AM_1");
});

test("failed-payment retry marker is stored in session storage", () => {
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key) || null,
    setItem: (key, value) => values.set(key, value),
  };

  assert.equal(markFailedPaymentRetry("AM_1", storage), true);
  assert.equal(storage.getItem(FAILED_RETRY_MARKER), "AM_1");
  assert.equal(markFailedPaymentRetry("AM_2", null), false);
});

test("assessment links are limited to secure Google Forms URLs", () => {
  assert.equal(getAssessmentFormUrl(), DEFAULT_ASSESSMENT_FORM_URL);
  assert.equal(getAssessmentFormUrl("https://docs.google.com/forms/d/e/example/viewform"), "https://docs.google.com/forms/d/e/example/viewform");
  assert.equal(getAssessmentFormUrl("https://forms.gle/example"), "https://forms.gle/example");
  assert.equal(getAssessmentFormUrl("http://docs.google.com/forms/example"), "");
  assert.equal(getAssessmentFormUrl("https://example.com/form"), "");
});
