import { useEffect, useMemo, useState } from "react";
import {
  Check,
  LockKey,
  PhoneCall,
  ShieldCheck,
} from "@phosphor-icons/react";
import { BASE_PRICE, CHECKOUT_BUMPS, GST_RATE } from "../lib/checkout-config.js";
import {
  getCheckoutOrderTrackingPayload,
  getCheckoutTrackingPayload,
  rememberCheckoutOrderTracking,
  rememberCheckoutVisit,
} from "../lib/checkout-tracking.js";
import { normalizeIndianMobile } from "../lib/phone.js";
import "../styles/checkout.css";

const DRAFT_KEY = "attractivemen-checkout-draft";
const BUMPS = CHECKOUT_BUMPS.map((bump) => ({
  ...bump,
  Icon: PhoneCall,
  summary: "Review your report privately with a style expert.",
  details: ["Personal Report Walkthrough", "Fit, Hair & Grooming Q&A", "2 Outfit Photo Reviews"],
}));

const formatMoney = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);

function loadDraft() {
  try {
    const saved = JSON.parse(localStorage.getItem(DRAFT_KEY));
    return {
      details: saved?.details ?? { name: "", email: "", phone: "" },
      selected: Array.isArray(saved?.selected) ? saved.selected : [],
    };
  } catch {
    return { details: { name: "", email: "", phone: "" }, selected: [] };
  }
}

export function CheckoutPage() {
  const initial = useMemo(loadDraft, []);
  const [details, setDetails] = useState(initial.details);
  const [selected, setSelected] = useState(initial.selected);
  const [errors, setErrors] = useState({});

  const [status, setStatus] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);

  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ details, selected }));
  }, [details, selected]);

  useEffect(() => {
    rememberCheckoutVisit();
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
    if (!/^\d{10}$/.test(normalizeIndianMobile(details.phone))) next.phone = "Please enter a valid 10-digit mobile number.";
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
    setStatus("Opening secure payment...");

    try {
      const tracking = getCheckoutTrackingPayload();
      const response = await fetch("/api/phonepe/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ details, selected, tracking }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (data.errors) setErrors(data.errors);
        throw new Error(data.message || "Payment could not be started.");
      }
      if (!data.redirectUrl) throw new Error("Payment gateway did not return a checkout URL.");

      rememberCheckoutOrderTracking(data.merchantOrderId, tracking);
      window.location.assign(data.redirectUrl);
    } catch (error) {
      setIsPaying(false);
      setStatus(error.message);
    }
  };

  return (
    <div className="checkout-page">
      <main className="checkout-main">
        <section className="checkout-intro" aria-labelledby="checkout-title">
          <p className="checkout-step">Checkout &nbsp;&bull;&nbsp; Assessment &nbsp;&bull;&nbsp; Your report</p>
          <h1 id="checkout-title">Complete your order.<br /><span>Start dressing with certainty.</span></h1>
          <p>Your recommendations will be built around your face, body, skin tone, routine and budget.</p>
          <div className="checkout-trust-row">
            <span><Check size={16} weight="bold" /> One-Time Payment</span>
            <span><Check size={16} weight="bold" /> No Subscription</span>
            <span><Check size={16} weight="bold" /> 48-Hour Delivery</span>
          </div>
        </section>

        {paymentResult ? (
          <section className={`checkout-payment-result ${paymentResult.state?.toLowerCase() || ""}`} aria-live="polite">
            <strong>{paymentResult.state === "COMPLETED" ? "Payment received" : paymentResult.state === "FAILED" ? "Payment failed" : "Payment pending"}</strong>
            <span>Order ID: {paymentResult.orderId || paymentResult.merchantOrderId || "Pending"}</span>
          </section>
        ) : null}

        <form className="checkout-card" onSubmit={handleSubmit} noValidate>
          <section className="checkout-block" aria-labelledby="contact-title">
            <div className="checkout-block-heading">
              <span>1</span>
              <div><h2 id="contact-title">Where should we send your report?</h2></div>
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
              <div className="checkout-phone"><span>+91</span><input type="tel" inputMode="numeric" autoComplete="tel" value={details.phone} onChange={(event) => updateDetail("phone", event.target.value)} placeholder="10-digit mobile number" aria-invalid={Boolean(errors.phone)} /></div>
              {errors.phone ? <small>{errors.phone}</small> : null}
            </label>
          </section>

          <section className="checkout-block" aria-label="Optional 20-minute style review call">

            <div className="checkout-bumps">
              {BUMPS.map(({ id, title, price, Icon, summary, details: benefits }) => {
                const isSelected = selected.includes(id);
                return (
                  <label className={`checkout-bump ${isSelected ? "selected" : ""}`} key={id}>
                    <input type="checkbox" checked={isSelected} onChange={() => toggleBump(id)} />
                    <span className="bump-check" aria-hidden="true">{isSelected ? <Check size={15} weight="bold" /> : null}</span>
                    <span className="bump-copy">
                      <span className="bump-title-row">
                        <span><Icon size={21} /><strong>{title}</strong></span>
                        <b>+{formatMoney(price)}</b>
                      </span>
                      <span className="bump-summary">{summary}</span>
                      <ul className="bump-benefits">
                        {benefits.map((benefit) => <li key={benefit}><Check size={14} weight="bold" /><span>{benefit}</span></li>)}
                      </ul>
                    </span>
                  </label>
                );
              })}
            </div>
          </section>

          <section className="checkout-block" aria-labelledby="order-title">
            <div className="checkout-block-heading">
              <span>2</span>
              <div><h2 id="order-title">Review your order</h2><p>See exactly what you are paying before continuing.</p></div>
            </div>

            <div className="checkout-product">
              <img src="/assets/product/style-report.png" alt="AttractiveMen personalized style report" />
              <div><strong>Personalized Style Report</strong><span>Built around your features</span><small>One-time purchase</small></div>
              <b>{formatMoney(BASE_PRICE)}</b>
            </div>

            {selectedBumps.length ? (
              <div className="checkout-selected-items">
                {selectedBumps.map((bump) => <div key={bump.id}><span>{bump.title}</span><b>+{formatMoney(bump.price)}</b></div>)}
              </div>
            ) : null}

            <div className="checkout-totals">
              <div><span>Subtotal</span><b>{formatMoney(subtotal)}</b></div>
              <div><span>GST (18%)</span><b>{formatMoney(gst)}</b></div>
              <div className="checkout-total"><span>Total payable</span><strong>{formatMoney(total)}</strong></div>
            </div>
          </section>

          <section className="checkout-block checkout-payment" aria-label="Secure payment">
            <button className="checkout-pay" type="submit" disabled={isPaying} aria-busy={isPaying}>
              <LockKey size={20} weight="fill" /> {isPaying ? "Opening secure payment..." : `Proceed to secure payment \u2022 ${formatMoney(total)}`}
            </button>
            {status ? <p className="checkout-status" role="status">{status}</p> : null}

            <div className="payment-confidence">
              <span><ShieldCheck size={18} weight="fill" /> Secure Payment</span>
              <span><LockKey size={18} weight="fill" /> Encrypted Payment Details</span>
            </div>
          </section>
        </form>

        <section className="checkout-reassurance">
          <img src="/assets/product/attractivemen-style-report-mockup-v2.png" alt="Preview of the AttractiveMen Personalized Style Report" />
          <div>
            <p>Everything you need to stop guessing</p>
            <h2>The AttractiveMen Personalized Style Report</h2>
            <strong>{"\u20B9"}{BASE_PRICE.toLocaleString("en-IN")} + GST</strong>
            <ul>
              <li><Check size={17} weight="bold" /> Face, Body & Skin Tone Analysis</li>
              <li><Check size={17} weight="bold" /> 20 Head-to-Toe Outfits</li>
              <li><Check size={17} weight="bold" /> Hair, Beard & Accessories Guide</li>
            </ul>
          </div>
        </section>

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
