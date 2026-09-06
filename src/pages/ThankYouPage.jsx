import { useEffect, useState } from "react";
import { Check, LockKey, WarningCircle } from "@phosphor-icons/react";
import { initializeAnalytics, trackPaymentCompleted, trackPaymentFailed } from "../lib/analytics.js";
import { getCheckoutOrderTrackingPayload } from "../lib/checkout-tracking.js";
import { CHECKOUT_PATH, LANDING_PATH, THANKYOU_PATH } from "../routes.js";
import "../styles/checkout.css";

export function ThankYouPage({ merchantOrderId = "" }) {
  const [status, setStatus] = useState("Checking your payment status...");
  const [paymentResult, setPaymentResult] = useState(null);

  useEffect(() => {
    if (!merchantOrderId) {
      setStatus("Order ID is missing. If payment was deducted, contact support with your PhonePe transaction details.");
      return undefined;
    }

    let cancelled = false;

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
          initializeAnalytics({ route: THANKYOU_PATH });
          trackPaymentCompleted({
            merchantOrderId,
            amountPaise: getVerifiedStatusAmountPaise(data),
            currency: data.currency,
            route: THANKYOU_PATH,
          });
          localStorage.removeItem("attractivemen-checkout-draft");
          setStatus("Payment received. Your report order is confirmed.");
        } else if (data.state === "FAILED") {
          initializeAnalytics({ trackPageView: false, route: THANKYOU_PATH });
          trackPaymentFailed({
            merchantOrderId,
            amountPaise: getVerifiedStatusAmountPaise(data),
            currency: data.currency,
            route: THANKYOU_PATH,
          });
          setStatus("Payment was not completed. You can retry checkout.");
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
  }, [merchantOrderId]);

  const state = paymentResult?.state || "PENDING";
  const isCompleted = state === "COMPLETED";
  const isFailed = state === "FAILED";
  const Icon = isCompleted ? Check : isFailed ? WarningCircle : LockKey;
  const nextSteps = isCompleted
    ? ["Complete your assessment", "Your stylist reviews your details", "Your report arrives within 48 hours"]
    : ["Keep this order ID saved", "Retry checkout if needed", "Contact support if money was deducted"];

  return (
    <main className="thankyou-page">
      <section className={`thankyou-card ${state.toLowerCase()}`}>
        <div className="thankyou-status-panel">
          <div className="thankyou-icon" aria-hidden="true">
            <Icon size={30} weight="bold" />
          </div>
          <p className="checkout-step">AttractiveMen order</p>
          <h1>{isCompleted ? "Payment received" : isFailed ? "Payment failed" : "Payment pending"}</h1>
          <p>{status}</p>
        </div>

        <div className="thankyou-order">
          <span>Merchant order ID</span>
          <strong>{merchantOrderId || "Unavailable"}</strong>
        </div>

        <div className="thankyou-next">
          <h2>What happens next?</h2>
          <ul>
            {nextSteps.map((step) => (
              <li key={step}><Check size={17} weight="bold" aria-hidden="true" /> {step}</li>
            ))}
          </ul>
        </div>

        <div className="thankyou-actions">
          <a className="checkout-pay thankyou-primary" href={isCompleted ? LANDING_PATH : CHECKOUT_PATH}>
            {isCompleted ? "Back to landing page" : "Retry checkout"}
          </a>
          <a className="checkout-save" href={`mailto:attractivemen08@gmail.com?subject=AttractiveMen order ${merchantOrderId}`}>
            Contact support
          </a>
        </div>

        <nav className="thankyou-legal" aria-label="Legal links">
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms &amp; Conditions</a>
        </nav>
      </section>
    </main>
  );
}

function getVerifiedStatusAmountPaise(data) {
  return data?.payableAmountPaise ?? data?.amountPaise ?? data?.payableAmount ?? data?.amount ?? "";
}
