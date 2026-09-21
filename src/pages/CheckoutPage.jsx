import { useEffect, useState } from "react";
import { Check, InstagramLogo, LockKey, PhoneCall } from "@phosphor-icons/react";
import { BASE_PRICE, CHECKOUT_BUMPS, GST_RATE } from "../lib/checkout-config.js";
import {
  getCheckoutOrderTrackingPayload,
  getCheckoutTrackingPayload,
  getCheckoutTrackingSnapshot,
  rememberCheckoutOrderTracking,
  rememberCheckoutVisit,
} from "../lib/checkout-tracking.js";
import { initializeAnalytics, trackCheckoutView, trackPaymentStarted } from "../lib/analytics.js";
import { normalizeInternationalPhone } from "../lib/phone.js";
import { CHECKOUT_PATH } from "../routes.js";
import "../styles/checkout.css";

const DRAFT_KEY = "attractivemen-checkout-draft:v2";
const REPORT_PREVIEW_URL = "https://res.cloudinary.com/dm49wi6j4/image/upload/f_auto,q_auto,c_limit,w_1200/AM%20-%20Assets/product/attractivemen-style-report-mockup-v2.webp";
const PAYMENT_TRUST_IMAGE_URL = "https://res.cloudinary.com/dm49wi6j4/image/upload/f_webp,q_auto,w_1200/AM%20-%20Assets/checkout/payment-trust.png";
const COUNTRY_CODES = [
  ["+91", "🇮🇳"], ["+1", "🇺🇸"], ["+44", "🇬🇧"], ["+61", "🇦🇺"], ["+971", "🇦🇪"], ["+65", "🇸🇬"],
  ["+49", "🇩🇪"], ["+33", "🇫🇷"], ["+81", "🇯🇵"], ["+82", "🇰🇷"], ["+86", "🇨🇳"], ["+27", "🇿🇦"],
  ["+234", "🇳🇬"], ["+64", "🇳🇿"], ["+880", "🇧🇩"], ["+92", "🇵🇰"], ["+94", "🇱🇰"], ["+977", "🇳🇵"],
];
const VALID_BUMP_IDS = new Set(CHECKOUT_BUMPS.map((bump) => bump.id));
const BUMP_DETAILS = {
  "style-consultation": {
    Icon: PhoneCall,
    summary: "Get a private style review call to understand your report, clear your doubts, and know exactly what to do next.",
  },
  "instagram-makeover": {
    Icon: InstagramLogo,
    summary: "Get your Instagram profile reviewed for photos, outfits, bio, highlights, and first impression so it looks sharper.",
  },
};
const BUMPS = CHECKOUT_BUMPS.map((bump) => ({
  ...bump,
  Icon: BUMP_DETAILS[bump.id]?.Icon ?? PhoneCall,
  summary: BUMP_DETAILS[bump.id]?.summary ?? "",
}));

const formatMoney = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);

function loadDraft() {
  const defaultCountryCode = getDefaultCountryCode();
  try {
    const saved = JSON.parse(localStorage.getItem(DRAFT_KEY));
    const selected = [];
    return {
      details: { name: "", email: "", phone: "", phoneCountryCode: defaultCountryCode, ...saved?.details },
      selected,
    };
  } catch {
    return { details: { name: "", email: "", phone: "", phoneCountryCode: defaultCountryCode }, selected: [] };
  }
}

function getDefaultCountryCode() {
  const locale = typeof navigator === "undefined" ? "" : String(navigator.language || "").toLowerCase();
  if (locale.includes("-gb")) return "+44";
  if (locale.includes("-us") || locale.includes("-ca")) return "+1";
  if (locale.includes("-au")) return "+61";
  if (locale.includes("-ae")) return "+971";
  if (locale.includes("-sg")) return "+65";
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
  const gst = subtotal * GST_RATE;
  const total = subtotal + gst;
  const orderItems = [
    { id: "style-report", title: "Personalized Style Report", price: BASE_PRICE },
    ...selectedBumps.map(({ id, title, price }) => ({ id, title, price })),
  ];

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
        <h1 id="checkout-title">You're One Step Closer to Looking Like A Smart Handsome Gentleman</h1>
        <p className="checkout-intro-copy">Enter your details below and receive a personalised style report within 48 hours.</p>
      </section>

      <main className="checkout-main">
        {paymentResult ? (
          <section className={`checkout-payment-result ${paymentResult.state?.toLowerCase() || ""}`} aria-live="polite">
            <strong>{paymentResult.state === "COMPLETED" ? "Payment received" : paymentResult.state === "FAILED" ? "Payment failed" : "Payment pending"}</strong>
            <span>Order ID: {paymentResult.orderId || paymentResult.merchantOrderId || "Pending"}</span>
          </section>
        ) : null}

        <form className="checkout-card" onSubmit={handleSubmit} noValidate data-clarity-mask="true">
          <section className="checkout-product" aria-label="Personal style report preview">
            <div className="checkout-report-heading">
              <span className="checkout-kicker">YOUR PERSONAL STYLE REPORT</span>
              <p>Built around your face, body, complexion, lifestyle and budget.</p>
            </div>
            <div className="checkout-report-body">
              <figure className="checkout-report-preview">
                <img src={REPORT_PREVIEW_URL} alt="Preview of the personalised style report" width="1200" height="1200" fetchPriority="high" decoding="async" />
              </figure>
              <ul className="checkout-report-points">
                <li><Check size={15} weight="bold" /> Hairstyle &amp; beard ideas + Bonus Skin &amp; Hair Care</li>
                <li><Check size={15} weight="bold" /> Exact clothing fits &amp; colour combinations</li>
                <li><Check size={15} weight="bold" /> 20 ready-to-wear looks for every occasion</li>
                <li><Check size={15} weight="bold" /> Shoe, watch &amp; perfume ideas + Smart Shopping Plan</li>
                <li><Check size={15} weight="bold" /> Bonus 90-Day Action Plan + Lifetime Access</li>
              </ul>
            </div>
          </section>

          <section className="checkout-block" aria-labelledby="contact-title">
            <div className="checkout-block-heading">
              <h2 id="contact-title">Where should we send your report?</h2>
            </div>

            <label className="checkout-field">
              <span>Full name</span>
              <input autoComplete="name" value={details.name} onChange={(event) => updateDetail("name", event.target.value)} placeholder="Your full name" aria-invalid={Boolean(errors.name)} />
              {errors.name ? <small>{errors.name}</small> : null}
            </label>
            <label className="checkout-field">
              <span>Email address</span>
              <input type="email" autoComplete="email" value={details.email} onChange={(event) => updateDetail("email", event.target.value)} placeholder="you@example.com" aria-invalid={Boolean(errors.email)} />
              {errors.email ? <small>{errors.email}</small> : null}
            </label>
            <label className="checkout-field">
              <span>WhatsApp number</span>
              <div className="checkout-phone"><select className="checkout-country-code" autoComplete="tel-country-code" value={details.phoneCountryCode || "+91"} onChange={(event) => updateDetail("phoneCountryCode", event.target.value)} aria-label="Country calling code">{COUNTRY_CODES.map(([code, country]) => <option value={code} key={code}>{country} {code}</option>)}</select><input type="tel" inputMode="tel" autoComplete="tel-national" value={details.phone} onChange={(event) => updateDetail("phone", event.target.value)} placeholder="98765 43210" aria-invalid={Boolean(errors.phone)} /></div>
              {errors.phone ? <small>{errors.phone}</small> : null}
            </label>
          </section>

          <section className="checkout-block checkout-addons" aria-labelledby="addons-title">
            <div className="checkout-block-heading checkout-addons-heading">
              <h2 id="addons-title">Optional Upgrades</h2>
            </div>
            <div className="checkout-bumps">
              {BUMPS.map(({ id, title, price, Icon, summary }) => {
                const isSelected = selected.includes(id);
                return (
                  <label className={`checkout-bump ${isSelected ? "selected" : ""}`} key={id}>
                    <input type="checkbox" checked={isSelected} onChange={() => toggleBump(id)} />
                    <span className="bump-check" aria-hidden="true">{isSelected ? <Check size={15} weight="bold" /> : null}</span>
                    <span className="bump-copy">
                      <span className="bump-title-row">
                        <span><Icon size={20} /><strong>{title}</strong></span>
                        <b className="bump-price">+{formatAddOnPrice(price)} + GST</b>
                      </span>
                      <span className="bump-summary">{summary}</span>
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
                  <b>{formatMoney(item.price)}</b>
                </div>
              ))}
            </div>

            <div className="checkout-totals">
              <div><span>GST (18%)</span><b>{formatMoney(gst)}</b></div>
              <div className="checkout-total"><span>Total payable</span><strong>{formatMoney(total)}</strong></div>
            </div>
          </section>

          <section className="checkout-block checkout-payment" aria-label="Secure payment">
            <button className="checkout-pay" type="submit" disabled={isPaying} aria-busy={isPaying}>
              <LockKey size={20} weight="fill" /> {isPaying ? "Processing" : "Complete My Order"}
            </button>
            {status ? <p className="checkout-status" role="status">{status}</p> : null}

            <figure className="checkout-payment-trust">
              <img src={PAYMENT_TRUST_IMAGE_URL} alt="Secure payment options including UPI, Visa, Mastercard, RuPay, netbanking and wallets" width="1600" height="420" loading="lazy" decoding="async" />
            </figure>

            <div className="checkout-testimonials" aria-label="Customer feedback">
              <article><span aria-hidden="true">★★★★★</span><p>“It felt like someone actually looked at my face and body instead of giving random tips.”</p><strong>Rishi · Pune</strong></article>
              <article><span aria-hidden="true">★★★★★</span><p>“I finally understood what fits to choose and what to stop buying.”</p><strong>Vikram · Chennai</strong></article>
            </div>

          </section>
        </form>

        <section className="checkout-next">
          <h2>What happens after payment?</h2>
          <div><span><b>1</b> 6 to 8-Minute Assessment</span><span><b>2</b> Expert Personal Analysis</span><span><b>3</b> Report Delivery Within 48 Hours</span></div>
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
