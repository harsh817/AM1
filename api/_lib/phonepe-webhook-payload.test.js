import assert from "node:assert/strict";
import test from "node:test";
import { buildPhonePeWebhookPayload } from "./phonepe-webhook-payload.js";

test("builds a complete raw PhonePe webhook payload for sheet routing", () => {
  const rawPayload = {
    merchantOrderId: "AM_123",
    orderId: "OMO_456",
    state: "COMPLETED",
    extra: {
      providerField: "kept",
    },
  };

  const payload = buildPhonePeWebhookPayload({
    payload: rawPayload,
    timestamp: "2026-08-11T10:10:00.000Z",
  });

  assert.deepEqual(payload, {
    event_name: "phonepe.webhook",
    event_timestamp: "2026-08-11T10:10:00.000Z",
    sheet_name: "phonepe_webhook",
    merchant_order_id: "AM_123",
    phonepe_order_id: "OMO_456",
    payment_state: "COMPLETED",
    amount_paise: "",
    payable_amount_paise: "",
    fee_amount_paise: "",
    error_code: "",
    error_message: "",
    event: {
      name: "phonepe.webhook",
      timestamp: "2026-08-11T10:10:00.000Z",
      submission_id: "AM_123",
    },
    payment: {
      merchant_order_id: "AM_123",
      phonepe_order_id: "OMO_456",
      state: "COMPLETED",
      amount_paise: "",
      payable_amount_paise: "",
      fee_amount_paise: "",
    },
    location: {
      country: "",
      country_code: "",
      state: "",
      city: "",
      ip: "",
    },
    device: {
      type: "",
      os: "",
      browser: "",
      screen_resolution: "",
      viewport: "",
      is_mobile: "",
      touch_enabled: "",
      user_agent: "",
    },
    marketing: {
      source: "",
      medium: "",
      campaign: "",
      content: "",
      term: "",
      id: "",
      referrer: "",
    },
    utm_source: "",
    utm_medium: "",
    utm_campaign: "",
    utm_content: "",
    utm_term: "",
    utm_id: "",
    referrer: "",
    engagement: {
      page_visits: "0",
      form_submissions: "0",
    },
    error: {
      code: "",
      message: "",
      context: {},
    },
    phonepe: {
      webhook: rawPayload,
    },
  });
});

test("extracts nested PhonePe webhook payload variants", () => {
  const dataPayload = buildPhonePeWebhookPayload({
    payload: {
      data: {
        merchantOrderId: "AM_DATA",
        orderId: "OMO_DATA",
        state: "FAILED",
        amount: 224200,
        payableAmount: 224200,
        feeAmount: 0,
        errorContext: {
          code: "PAYMENT_DECLINED",
          errorMessage: "Declined",
        },
      },
    },
    timestamp: "2026-08-11T10:20:00.000Z",
  });

  assert.equal(dataPayload.merchant_order_id, "AM_DATA");
  assert.equal(dataPayload.phonepe_order_id, "OMO_DATA");
  assert.equal(dataPayload.payment_state, "FAILED");
  assert.equal(dataPayload.amount_paise, "224200");
  assert.equal(dataPayload.payable_amount_paise, "224200");
  assert.equal(dataPayload.fee_amount_paise, "0");
  assert.equal(dataPayload.error_code, "PAYMENT_DECLINED");
  assert.equal(dataPayload.error_message, "Declined");

  const nestedPayload = buildPhonePeWebhookPayload({
    payload: {
      payload: {
        merchantOrderId: "AM_NESTED",
        orderId: "OMO_NESTED",
        state: "COMPLETED",
        amount: 0,
        payableAmount: -1,
        feeAmount: "invalid",
        errorContext: {
          errorCode: "IGNORED",
        },
      },
    },
  });

  assert.equal(nestedPayload.merchant_order_id, "AM_NESTED");
  assert.equal(nestedPayload.phonepe_order_id, "OMO_NESTED");
  assert.equal(nestedPayload.payment_state, "COMPLETED");
  assert.equal(nestedPayload.amount_paise, "0");
  assert.equal(nestedPayload.payable_amount_paise, "");
  assert.equal(nestedPayload.fee_amount_paise, "");
  assert.equal(nestedPayload.error_code, "IGNORED");
});
