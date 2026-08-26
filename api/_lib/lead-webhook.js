import { buildTrackingFields } from "./tracking-webhook.js";

export function buildCheckoutLeadPayload({
  eventName,
  timestamp = new Date().toISOString(),
  submissionId,
  details = {},
  phoneNumber = "",
  leadStatus,
  payment = {},
  selected = [],
  totals = {},
  req,
  tracking = {},
} = {}) {
  const name = clean(details.name);
  const email = clean(details.email);
  const phone = clean(phoneNumber, 20);
  const event = {
    name: clean(eventName),
    timestamp: clean(timestamp, 64),
    submission_id: clean(submissionId, 128),
  };
  const paymentPayload = buildPayment(submissionId, payment);

  return {
    event_name: event.name,
    event_timestamp: event.timestamp,
    sheet_name: "payment_initiated",
    merchant_order_id: paymentPayload.merchant_order_id,
    phonepe_order_id: paymentPayload.phonepe_order_id,
    payment_state: paymentPayload.state,
    amount_paise: paymentPayload.amount_paise,
    payable_amount_paise: "",
    fee_amount_paise: "",
    error_code: "",
    error_message: "",
    event,
    lead: {
      name,
      email,
      phone: {
        country_code: "+91",
        number: phone,
        full: phone ? `+91${phone}` : "",
      },
      identity: email || phone,
      status: clean(leadStatus),
    },
    payment: paymentPayload,
    order: buildOrder(selected, totals),
    ...buildTrackingFields({ req, tracking }),
  };
}

function buildOrder(selected = [], totals = {}) {
  const selectedIds = Array.isArray(selected) ? selected : [];
  const selectedBumps = Array.isArray(totals.selectedBumps) ? totals.selectedBumps : [];

  return {
    currency: "INR",
    product: "AttractiveMen Personalized Style Report",
    selected_item_ids: selectedIds.map((id) => clean(id, 128)),
    selected_bumps: selectedBumps.map((bump) => ({
      id: clean(bump.id, 128),
      title: clean(bump.title, 256),
      price: cleanMoney(bump.price),
    })),
    pricing: {
      base_price: cleanMoney(totals.basePrice),
      bumps_total: cleanMoney(totals.bumpsTotal),
      subtotal: cleanMoney(totals.subtotal),
      gst: cleanMoney(totals.gst),
      total: cleanMoney(totals.total),
      amount_paise: cleanPaymentAmount(totals.amountPaise),
    },
  };
}

function buildPayment(submissionId, payment = {}) {
  return {
    merchant_order_id: clean(payment.merchantOrderId || submissionId, 128),
    phonepe_order_id: clean(payment.phonePeOrderId || payment.orderId, 128),
    state: clean(payment.state || "INITIATED", 64),
    amount_paise: cleanPaymentAmount(payment.amountPaise),
  };
}

function cleanPaymentAmount(value) {
  const amount = Number.parseInt(value, 10);
  return Number.isFinite(amount) && amount >= 0 ? String(amount) : "";
}

function cleanMoney(value) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 ? String(amount) : "";
}

function clean(value, maxLength = 256) {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, maxLength);
}
