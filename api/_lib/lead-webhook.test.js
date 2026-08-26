import assert from "node:assert/strict";
import test from "node:test";
import { buildCheckoutLeadPayload } from "./lead-webhook.js";

test("builds checkout lead webhook payload from request and tracking context", () => {
  const payload = buildCheckoutLeadPayload({
    eventName: "checkout.payment_initiated",
    timestamp: "2026-08-04T12:00:00.000Z",
    submissionId: "AM_123",
    details: {
      name: " Harsh   Goel ",
      email: "harsh@example.com",
    },
    phoneNumber: "9876543210",
    leadStatus: "payment_initiated",
    payment: {
      merchantOrderId: "AM_123",
      phonePeOrderId: "OMO_456",
      state: "PENDING",
      amountPaise: 294764,
    },
    selected: ["call"],
    totals: {
      basePrice: 1999,
      bumpsTotal: 499,
      subtotal: 2498,
      gst: 449.64,
      total: 2947.64,
      amountPaise: 294764,
      selectedBumps: [
        {
          id: "call",
          title: "20-Minute Style Review Call + Flirting Guide",
          price: 499,
        },
      ],
    },
    req: {
      headers: {
        "x-forwarded-for": "203.0.113.9, 10.0.0.1",
        "x-vercel-ip-country": "IN",
        "x-vercel-ip-country-region": "DL",
        "x-vercel-ip-city": "New%20Delhi",
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
    event_name: "checkout.payment_initiated",
    event_timestamp: "2026-08-04T12:00:00.000Z",
    sheet_name: "payment_initiated",
    merchant_order_id: "AM_123",
    phonepe_order_id: "OMO_456",
    payment_state: "PENDING",
    amount_paise: "294764",
    payable_amount_paise: "",
    fee_amount_paise: "",
    error_code: "",
    error_message: "",
    event: {
      name: "checkout.payment_initiated",
      timestamp: "2026-08-04T12:00:00.000Z",
      submission_id: "AM_123",
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
      status: "payment_initiated",
    },
    payment: {
      merchant_order_id: "AM_123",
      phonepe_order_id: "OMO_456",
      state: "PENDING",
      amount_paise: "294764",
    },
    order: {
      currency: "INR",
      product: "AttractiveMen Personalized Style Report",
      selected_item_ids: ["call"],
      selected_bumps: [
        {
          id: "call",
          title: "20-Minute Style Review Call + Flirting Guide",
          price: "499",
        },
      ],
      pricing: {
        base_price: "1999",
        bumps_total: "499",
        subtotal: "2498",
        gst: "449.64",
        total: "2947.64",
        amount_paise: "294764",
      },
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
  });
});

test("builds safe fallback lead payloads for partial checkout context", () => {
  const payload = buildCheckoutLeadPayload({
    eventName: "checkout.payment_initiated",
    submissionId: "AM_FALLBACK",
    payment: {
      orderId: "OMO_FALLBACK",
      amountPaise: "invalid",
    },
    selected: "not-array",
    totals: {
      selectedBumps: "not-array",
    },
  });

  assert.equal(payload.merchant_order_id, "AM_FALLBACK");
  assert.equal(payload.phonepe_order_id, "OMO_FALLBACK");
  assert.equal(payload.payment_state, "INITIATED");
  assert.equal(payload.amount_paise, "");
  assert.deepEqual(payload.lead.phone, {
    country_code: "+91",
    number: "",
    full: "",
  });
  assert.equal(payload.lead.identity, "");
  assert.deepEqual(payload.order.selected_item_ids, []);
  assert.deepEqual(payload.order.selected_bumps, []);
  assert.equal(payload.order.pricing.base_price, "");
});
