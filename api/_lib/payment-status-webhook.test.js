import assert from "node:assert/strict";
import test from "node:test";
import { buildPaymentStatusPayload } from "./payment-status-webhook.js";

test("builds a complete failed payment payload for sheet routing", () => {
  const payload = buildPaymentStatusPayload({
    merchantOrderId: "AM_123",
    timestamp: "2026-08-11T10:00:00.000Z",
    req: {
      headers: {
        "x-forwarded-for": "203.0.113.9, 10.0.0.1",
        "x-vercel-ip-country": "IN",
        "x-vercel-ip-country-region": "DL",
        "x-vercel-ip-city": "New%20Delhi",
      },
    },
    status: {
      orderId: "OMO_456",
      state: "FAILED",
      amount: 224200,
      payableAmount: 224200,
      feeAmount: 0,
      metaInfo: {
        udf1: "Harsh Goel",
        udf2: "harsh@example.com",
        udf3: "9876543210",
        udf4: "AttractiveMen Personalized Style Report",
        udf5: "call",
      },
      errorContext: {
        errorCode: "PAYMENT_DECLINED",
        errorMessage: "Payment was declined by the issuer.",
      },
    },
    tracking: {
      device: {
        type: "desktop",
        os: "Windows",
        browser: "Chrome",
        screen_resolution: "1920x1080",
        viewport: "1440x900",
        is_mobile: "false",
        touch_enabled: "false",
        user_agent: "Mozilla/5.0",
      },
      marketing: {
        source: "meta",
        medium: "paid",
        campaign: "summer",
        content: "ad1",
        term: "style",
        id: "120254409818390054",
        referrer: "https://facebook.com/",
      },
      engagement: {
        page_visits: 2,
        form_submissions: 1,
      },
    },
  });

  assert.deepEqual(payload, {
    event_name: "checkout.payment_failed",
    event_timestamp: "2026-08-11T10:00:00.000Z",
    sheet_name: "payment_failed",
    merchant_order_id: "AM_123",
    phonepe_order_id: "OMO_456",
    payment_state: "FAILED",
    amount_paise: "224200",
    payable_amount_paise: "224200",
    fee_amount_paise: "0",
    error_code: "PAYMENT_DECLINED",
    error_message: "Payment was declined by the issuer.",
    event: {
      name: "checkout.payment_failed",
      timestamp: "2026-08-11T10:00:00.000Z",
      submission_id: "AM_123",
    },
    payment: {
      merchant_order_id: "AM_123",
      phonepe_order_id: "OMO_456",
      state: "FAILED",
      amount_paise: "224200",
      payable_amount_paise: "224200",
      fee_amount_paise: "0",
    },
    lead: {
      name: "Harsh Goel",
      email: "harsh@example.com",
      phone: {
        country_code: "+91",
        number: "9876543210",
        full: "+919876543210",
      },
      identity: "harsh@example.com",
    },
    order: {
      product: "AttractiveMen Personalized Style Report",
      selected_item_ids: ["call"],
    },
    location: {
      country: "India",
      country_code: "IN",
      state: "DL",
      city: "New Delhi",
      ip: "203.0.113.9",
    },
    device: {
      type: "desktop",
      os: "Windows",
      browser: "Chrome",
      screen_resolution: "1920x1080",
      viewport: "1440x900",
      is_mobile: "false",
      touch_enabled: "false",
      user_agent: "Mozilla/5.0",
    },
    marketing: {
      source: "meta",
      medium: "paid",
      campaign: "summer",
      content: "ad1",
      term: "style",
      id: "120254409818390054",
      referrer: "https://facebook.com/",
    },
    utm_source: "meta",
    utm_medium: "paid",
    utm_campaign: "summer",
    utm_content: "ad1",
    utm_term: "style",
    utm_id: "120254409818390054",
    referrer: "https://facebook.com/",
    engagement: {
      page_visits: "2",
      form_submissions: "1",
    },
    error: {
      code: "PAYMENT_DECLINED",
      message: "Payment was declined by the issuer.",
      context: {
        errorCode: "PAYMENT_DECLINED",
        errorMessage: "Payment was declined by the issuer.",
      },
    },
    phonepe: {
      status: {
        orderId: "OMO_456",
        state: "FAILED",
        amount: 224200,
        payableAmount: 224200,
        feeAmount: 0,
        metaInfo: {
          udf1: "Harsh Goel",
          udf2: "harsh@example.com",
          udf3: "9876543210",
          udf4: "AttractiveMen Personalized Style Report",
          udf5: "call",
        },
        errorContext: {
          errorCode: "PAYMENT_DECLINED",
          errorMessage: "Payment was declined by the issuer.",
        },
      },
    },
  });
});

test("routes completed payments to the completed sheet", () => {
  const payload = buildPaymentStatusPayload({
    merchantOrderId: "AM_123",
    timestamp: "2026-08-11T10:05:00.000Z",
    status: {
      orderId: "OMO_456",
      state: "COMPLETED",
      amount: 224200,
    },
  });

  assert.equal(payload.event_name, "checkout.payment_completed");
  assert.equal(payload.sheet_name, "payment_completed");
  assert.equal(payload.payment.state, "COMPLETED");
  assert.deepEqual(payload.phonepe.status, {
    orderId: "OMO_456",
    state: "COMPLETED",
    amount: 224200,
  });
});
