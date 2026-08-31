import { useEffect, useMemo, useState } from "react";
import {
  Check,
  InstagramLogo,
  LockKey,
  PhoneCall,
  ShieldCheck,
} from "@phosphor-icons/react";
import { BASE_PRICE, CHECKOUT_BUMPS, GST_RATE } from "../lib/checkout-config.js";
import { trustBadges } from "../lib/landing-data.js";
import {
  getCheckoutOrderTrackingPayload,
  getCheckoutTrackingPayload,
  rememberCheckoutOrderTracking,
  rememberCheckoutVisit,
} from "../lib/checkout-tracking.js";
import { normalizeIndianMobile } from "../lib/phone.js";
import "../styles/checkout.css";

const DRAFT_KEY = "attractivemen-checkout-draft";
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
  try {
    const saved = JSON.parse(localStorage.getItem(DRAFT_KEY));
    const selected = Array.isArray(saved?.selected)
      ? [...new Set(saved.selected.filter((id) => VALID_BUMP_IDS.has(id)))]
      : [];
    return {
      details: saved?.details ?? { name: "", email: "", phone: "" },
      selected,
    };
  } catch {
    return { details: { name: "", email: "", phone: "" }, selected: [] };
  }
}

const formatAddOnPrice = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

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
      <section className="checkout-intro" aria-labelledby="checkout-title">
        <h1 id="checkout-title">Complete Your Order for Personal Style Report</h1>
        <div className="checkout-trust-row" aria-label="StyleIQ proof points">
          {trustBadges.map((badge) => <span key={badge}>{badge}</span>)}
        </div>
      </section>

      <main className="checkout-main">
        {paymentResult ? (
          <section className={`checkout-payment-result ${paymentResult.state?.toLowerCase() || ""}`} aria-live="polite">
            <strong>{paymentResult.state === "COMPLETED" ? "Payment received" : paymentResult.state === "FAILED" ? "Payment failed" : "Payment pending"}</strong>
            <span>Order ID: {paymentResult.orderId || paymentResult.merchantOrderId || "Pending"}</span>
          </section>
        ) : null}

        <form className="checkout-card" onSubmit={handleSubmit} noValidate>
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
              <div className="checkout-phone"><span>+91</span><input type="tel" inputMode="numeric" autoComplete="tel" value={details.phone} onChange={(event) => updateDetail("phone", event.target.value)} placeholder="10-digit mobile number" aria-invalid={Boolean(errors.phone)} /></div>
              {errors.phone ? <small>{errors.phone}</small> : null}
            </label>
          </section>

          <section className="checkout-block checkout-addons" aria-labelledby="addons-title">
            <div className="checkout-block-heading checkout-addons-heading">
              <h2 id="addons-title">100X Add-Ons</h2>
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
              <LockKey size={20} weight="fill" /> {isPaying ? "Opening secure payment..." : "Proceed My Order"}
            </button>
            {status ? <p className="checkout-status" role="status">{status}</p> : null}

            <div className="payment-confidence" aria-label="Checkout trust points">
              <span><Check size={18} weight="bold" /> Completely Customized</span>
              <span><Check size={18} weight="bold" /> One-Time Payment</span>
              <span><ShieldCheck size={18} weight="fill" /> Secure Payment</span>
              <span><LockKey size={18} weight="fill" /> Encrypted Details</span>
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
