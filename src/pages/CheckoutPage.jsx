import { useEffect, useState } from "react";
import { Check, LockKey } from "@phosphor-icons/react";
import { BASE_PRICE, CHECKOUT_BUMPS, GST_RATE } from "../lib/checkout-config.js";
import {
  getCheckoutOrderTrackingPayload,
  getCheckoutTrackingPayload,
  getCheckoutTrackingSnapshot,
  rememberCheckoutOrderTracking,
  rememberCheckoutVisit,
} from "../lib/checkout-tracking.js";
import { initializeAnalytics, trackCheckoutView, trackPaymentStarted } from "../lib/analytics.js";
import { getInitialPhoneCountryCode, normalizeInternationalPhone, normalizePhoneInput } from "../lib/phone.js";
import { CHECKOUT_PATH } from "../routes.js";
import "../styles/checkout.css";

const DRAFT_KEY = "attractivemen-checkout-draft:v2";
const PAYMENT_TRUST_IMAGE_URL = "https://res.cloudinary.com/dm49wi6j4/image/upload/f_webp,q_auto,w_1200/AM%20-%20Assets/checkout/payment-trust.png";
const COUNTRY_CODES = [
  ["+91", "🇮🇳"], ["+1", "🇺🇸"], ["+44", "🇬🇧"], ["+61", "🇦🇺"], ["+971", "🇦🇪"], ["+65", "🇸🇬"],
  ["+49", "🇩🇪"], ["+33", "🇫🇷"], ["+81", "🇯🇵"], ["+82", "🇰🇷"], ["+86", "🇨🇳"], ["+27", "🇿🇦"],
  ["+234", "🇳🇬"], ["+64", "🇳🇿"], ["+880", "🇧🇩"], ["+92", "🇵🇰"], ["+94", "🇱🇰"], ["+977", "🇳🇵"],
];
const VALID_BUMP_IDS = new Set(CHECKOUT_BUMPS.map((bump) => bump.id));
const BUMP_DETAILS = {
  "outfit-visualizer": {
    headline: "Yes, I want to see how outfits look on me",
    offer: "Special one-time upgrade: ₹499",
    benefits: [
      { before: "Preview outfits on your ", emphasis: "face and body type", after: "." },
      { before: "See how you’ll look ", emphasis: "before buying anything", after: "." },
      { before: "Show the visuals to your ", emphasis: "tailor or clothing store", after: "." },
      { before: "Make shopping easier with ", emphasis: "outfits chosen specifically for you", after: "." },
    ],
  },
};
const BUMPS = CHECKOUT_BUMPS.map((bump) => ({
  ...bump,
  headline: BUMP_DETAILS[bump.id]?.headline ?? bump.title,
  offer: BUMP_DETAILS[bump.id]?.offer ?? "Optional upgrade",
  benefits: BUMP_DETAILS[bump.id]?.benefits ?? [],
}));

const formatMoney = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

function loadDraft() {
  const defaultCountryCode = getDefaultCountryCode();
  try {
    const saved = JSON.parse(localStorage.getItem(DRAFT_KEY));
    const selected = [];
    const savedDetails = saved?.details ?? {};
    return {
      details: {
        name: "",
        email: "",
        phone: "",
        ...savedDetails,
        phoneCountryCode: getInitialPhoneCountryCode(savedDetails, defaultCountryCode),
      },
      selected,
    };
  } catch {
    return { details: { name: "", email: "", phone: "", phoneCountryCode: defaultCountryCode }, selected: [] };
  }
}

function getDefaultCountryCode() {
  return "+91";
}

function getFullPhone(details = {}) {
  const countryCode = String(details.phoneCountryCode || "+91").replace(/\D/g, "");
  const localNumber = String(details.phone || "").replace(/\D/g, "");
  return countryCode && localNumber ? `+${countryCode}${localNumber}` : "";
}

const formatAddOnPrice = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

export function CheckoutPage() {
  const [initialDraft] = useState(loadDraft);
  const [details, setDetails] = useState(initialDraft.details);
  const [selected, setSelected] = useState(initialDraft.selected);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);

  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ details, selected }));
  }, [details, selected]);

  useEffect(() => {
    rememberCheckoutVisit();
    const tracking = getCheckoutTrackingSnapshot();
    void fetch("/api/experiment/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...tracking.experiment,
        marketing: tracking.marketing,
      }),
      keepalive: true,
    }).catch(() => undefined);
  }, []);

  useEffect(() => {
    initializeAnalytics({ route: CHECKOUT_PATH });
    trackCheckoutView({ route: CHECKOUT_PATH });
  }, []);

  useEffect(() => {
    const merchantOrderId = new URLSearchParams(window.location.search).get("merchantOrderId");
    if (!merchantOrderId) return undefined;

    let cancelled = false;
    setStatus("Checking your payment status...");

    fetch("/api/phonepe/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merchantOrderId,
        tracking: getCheckoutOrderTrackingPayload(merchantOrderId),
      }),
    })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.message || "Payment status could not be checked.");
        return data;
      })
      .then((data) => {
        if (cancelled) return;
        setPaymentResult(data);

        if (data.state === "COMPLETED") {
          localStorage.removeItem(DRAFT_KEY);
          setStatus("Payment received. Your report order is confirmed.");
        } else if (data.state === "FAILED") {
          setStatus("Payment was not completed. You can retry below.");
        } else {
          setStatus("Payment is pending. If money was deducted, wait a moment and refresh this page.");
        }
      })
      .catch((error) => {
        if (!cancelled) setStatus(error.message);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedBumps = BUMPS.filter((bump) => selected.includes(bump.id));
  const bumpsTotal = selectedBumps.reduce((sum, bump) => sum + bump.price, 0);
  const subtotal = BASE_PRICE + bumpsTotal;
  const gst = Math.round(subtotal * GST_RATE);
  const total = Math.round(subtotal + gst);
  const orderItems = [
    { id: "style-report", title: "StyleIQ System", detail: "One-time payment", priceLabel: `${formatMoney(BASE_PRICE)} + GST` },
    ...selectedBumps.map(({ id, title, price }) => ({
      id,
      title,
      priceLabel: formatMoney(Math.round(price * (1 + GST_RATE))),
    })),
  ];
  const savings = Math.max(0, 2999 - BASE_PRICE);

  const updateDetail = (field, value) => {
    setDetails((current) => ({ ...current, [field]: value }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: "" }));
    setPaymentResult(null);
    setStatus("");
  };

  const toggleBump = (id) => {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
    setPaymentResult(null);
    setStatus("");
  };

  const validate = () => {
    const next = {};
    if (details.name.trim().length < 2) next.name = "Please enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(details.email.trim())) next.email = "Please enter a valid email address.";
    if (!/^\d{7,15}$/.test(normalizeInternationalPhone(getFullPhone(details)))) next.phone = "Please enter a valid phone number.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) {
      setStatus("Please check the highlighted fields. Nothing has been charged.");
      return;
    }

    setIsPaying(true);
    setStatus("Processing");

    try {
      const tracking = getCheckoutTrackingPayload();
      const response = await fetch("/api/phonepe/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ details: { ...details, phone: getFullPhone(details) }, selected, tracking }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (data.errors) setErrors(data.errors);
        throw new Error(data.message || "Payment could not be started.");
      }
      if (!data.redirectUrl) throw new Error("Payment gateway did not return a checkout URL.");

      rememberCheckoutOrderTracking(data.merchantOrderId, tracking);
      trackPaymentStarted({
        merchantOrderId: data.merchantOrderId,
        amountPaise: data.amountPaise,
        currency: data.currency,
        route: CHECKOUT_PATH,
      });
      window.location.assign(data.redirectUrl);
    } catch (error) {
      setIsPaying(false);
      setStatus(error.message);
    }
  };

  return (
    <div className="checkout-page">
      <section className="checkout-intro" aria-labelledby="checkout-title">
        <h1 id="checkout-title">Get Your Personal Style Report</h1>
      </section>

      <main className="checkout-main">
        {paymentResult ? (
          <section className={`checkout-payment-result ${paymentResult.state?.toLowerCase() || ""}`} aria-live="polite">
            <strong>{paymentResult.state === "COMPLETED" ? "Payment received" : paymentResult.state === "FAILED" ? "Payment failed" : "Payment pending"}</strong>
            <span>Order ID: {paymentResult.orderId || paymentResult.merchantOrderId || "Pending"}</span>
          </section>
        ) : null}

        <form className="checkout-card" onSubmit={handleSubmit} noValidate data-clarity-mask="true">
          <section className="checkout-block" aria-label="Contact information">
            <p className="checkout-form-intro">Enter your details below to receive your StyleIQ System report.</p>

            <label className="checkout-field">
              <span className="checkout-sr-only">Full name</span>
              <input autoComplete="name" value={details.name} onChange={(event) => updateDetail("name", event.target.value)} placeholder="Enter your full name" aria-label="Full name" aria-invalid={Boolean(errors.name)} />
              {errors.name ? <small>{errors.name}</small> : null}
            </label>
            <label className="checkout-field">
              <span className="checkout-sr-only">Email address</span>
              <input type="email" autoComplete="email" value={details.email} onChange={(event) => updateDetail("email", event.target.value)} placeholder="Enter your email address" aria-label="Email address" aria-invalid={Boolean(errors.email)} />
              {errors.email ? <small>{errors.email}</small> : null}
            </label>
            <label className="checkout-field">
              <span className="checkout-sr-only">WhatsApp number</span>
              <div className="checkout-phone"><select className="checkout-country-code" autoComplete="tel-country-code" value={details.phoneCountryCode || "+91"} onChange={(event) => updateDetail("phoneCountryCode", event.target.value)} aria-label="Country calling code">{COUNTRY_CODES.map(([code, country]) => <option value={code} key={code}>{country} {code}</option>)}</select><input type="tel" inputMode="tel" autoComplete="tel-national" value={details.phone} onChange={(event) => updateDetail("phone", normalizePhoneInput(event.target.value, details.phoneCountryCode || "+91"))} placeholder="Enter your number" aria-label="WhatsApp number" aria-invalid={Boolean(errors.phone)} /></div>
              {errors.phone ? <small>{errors.phone}</small> : null}
            </label>
          </section>

          <section className="checkout-block checkout-addons" aria-label="Outfit visualisation upgrade">
            <div className="checkout-bumps">
              {BUMPS.map(({ id, headline, offer, benefits }) => {
                const isSelected = selected.includes(id);
                return (
                  <label className={`checkout-bump ${isSelected ? "selected" : ""}`} key={id}>
                    <input type="checkbox" checked={isSelected} onChange={() => toggleBump(id)} />
                    <span className="bump-check" aria-hidden="true">{isSelected ? <Check size={15} weight="bold" /> : null}</span>
                    <span className="bump-copy">
                      <span className="bump-title-row">
                        <span><strong>{headline}</strong></span>
                        <b className="bump-price">{offer}</b>
                      </span>
                      <ul className="bump-benefits">
                        {benefits.map((benefit) => (
                          <li key={benefit.emphasis}>
                            {benefit.before}<strong>{benefit.emphasis}</strong>{benefit.after}
                          </li>
                        ))}
                      </ul>
                    </span>
                  </label>
                );
              })}
            </div>
          </section>

          <section className="checkout-block" aria-labelledby="order-title">
            <div className="checkout-block-heading">
              <h2 id="order-title">Recap of Your Order</h2>
            </div>

            <div className="checkout-recap-items">
              {orderItems.map((item) => (
                <div className="checkout-recap-item" key={item.id}>
                  <span>{item.title}</span>
                  <span className="checkout-recap-price">
                    <b>{item.priceLabel}</b>
                    {item.detail ? <small>{item.detail}</small> : null}
                  </span>
                </div>
              ))}
            </div>

            <div className="checkout-totals">
              <div className="checkout-total"><span>Total payable</span><strong>{formatMoney(total)}</strong></div>
              <div className="checkout-savings" aria-label={`Today's saving ${formatMoney(savings)}`}>Today&apos;s saving: <b>{formatMoney(savings)}</b></div>
            </div>
          </section>

          <section className="checkout-block checkout-payment" aria-label="Secure payment">
            <button className="checkout-pay" type="submit" disabled={isPaying} aria-busy={isPaying}>
              <LockKey size={20} weight="fill" /> {isPaying ? "Processing" : "Complete Order"}
            </button>

            <figure className="checkout-payment-trust">
              <img src={PAYMENT_TRUST_IMAGE_URL} alt="Secure payment options including UPI, Visa, Mastercard, RuPay, netbanking and wallets" width="1600" height="420" loading="lazy" decoding="async" />
            </figure>
            <div className="checkout-offer-price" aria-label="Current StyleIQ offer">
              <span>Normal price: <del>₹2,999</del></span>
              <strong>Today only: ₹1,999 + GST</strong>
            </div>
            {status ? <p className="checkout-status" role="status">{status}</p> : null}
          </section>
        </form>

        <section className="checkout-next" aria-labelledby="report-recap-title">
          <h2 id="report-recap-title">Your report recap</h2>
          <ul className="checkout-report-recap">
            <li>Personalised hairstyle and beard ideas</li>
            <li>Colours and clothing fits chosen for you</li>
            <li>20 ready-to-wear looks for real occasions</li>
            <li>Shoe, watch, perfume and shopping guidance</li>
            <li>90-day upgrade plan with lifetime access</li>
          </ul>
        </section>
      </main>

      <footer className="checkout-footer">
        <a className="checkout-brand" href="?">AttractiveMen</a>
        <p>Personal style guidance made for Indian men. Individual results vary.</p>
        <nav><a href="/privacy">Privacy Policy</a><a href="/terms">Terms &amp; Conditions</a></nav>
        <small>&copy; 2026 AttractiveMen. All rights reserved.</small>
      </footer>
    </div>
  );
}
