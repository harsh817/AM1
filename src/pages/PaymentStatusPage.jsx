import { useEffect, useState } from "react";
import { ArrowClockwise, LockKey } from "@phosphor-icons/react";
import { checkPaymentStatus, getPaymentDestination } from "../lib/payment-return.js";
import "../styles/checkout.css";

const RETRY_DELAY_MS = 3000;
const MAX_AUTOMATIC_CHECKS = 20;

export function PaymentStatusPage({ merchantOrderId = "", preview = "" }) {
  const [manualCheck, setManualCheck] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState("We’re checking your payment with PhonePe.");

  useEffect(() => {
    if (import.meta.env.DEV && ["pending", "unavailable"].includes(preview)) {
      setAttempt(MAX_AUTOMATIC_CHECKS);
      setMessage(preview === "pending"
        ? "Your payment is still being processed. If money was deducted, please don’t pay again yet."
        : "We can’t reach the payment service right now. Check again before trying another payment.");
      return undefined;
    }
    if (!merchantOrderId) {
      setMessage("We couldn’t find an order reference. If money was deducted, contact support before paying again.");
      return undefined;
    }

    let cancelled = false;
    let timeoutId;
    setChecking(true);

    const check = async (currentAttempt) => {
      try {
        const result = await checkPaymentStatus(merchantOrderId);
        if (cancelled) return;
        const destination = getPaymentDestination(result.state, merchantOrderId);
        if (destination) {
          window.location.replace(destination);
          return;
        }
        setAttempt(currentAttempt);
        setMessage("Your payment is still being processed. If money was deducted, please don’t pay again yet.");
        if (currentAttempt < MAX_AUTOMATIC_CHECKS) {
          timeoutId = window.setTimeout(() => check(currentAttempt + 1), RETRY_DELAY_MS);
        } else {
          setChecking(false);
        }
      } catch {
        if (cancelled) return;
        setAttempt(currentAttempt);
        setChecking(false);
        setMessage("We can’t reach the payment service right now. Check again before trying another payment.");
      }
    };

    void check(1);
    return () => {
      cancelled = true;
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [merchantOrderId, manualCheck, preview]);

  return (
    <main className="thankyou-page">
      <section className="thankyou-card pending">
        {import.meta.env.DEV && preview ? <p className="payment-preview-notice">LOCAL PREVIEW · No payment was made</p> : null}
        <div className="thankyou-status-panel">
          <div className="thankyou-icon" aria-hidden="true"><LockKey size={30} weight="bold" /></div>
          <p className="checkout-step">StyleIQ System</p>
          <h1>Checking your payment</h1>
          <p aria-live="polite">{message}</p>
        </div>
        {merchantOrderId ? <div className="thankyou-order"><span>Order reference</span><strong>{merchantOrderId}</strong></div> : null}
        <div className="thankyou-actions">
          <button className="checkout-pay thankyou-primary" type="button" disabled={checking} onClick={() => setManualCheck((count) => count + 1)}>
            <ArrowClockwise size={19} aria-hidden="true" /> {checking ? "Checking…" : attempt >= MAX_AUTOMATIC_CHECKS ? "Check status again" : "Check payment status"}
          </button>
          <a className="checkout-save" href={`mailto:attractivemen08@gmail.com?subject=Payment%20status%20${encodeURIComponent(merchantOrderId)}`}>Contact support</a>
        </div>
        <LegalLinks />
      </section>
    </main>
  );
}

function LegalLinks() {
  return <nav className="thankyou-legal" aria-label="Legal links"><a href="/privacy">Privacy Policy</a><a href="/terms">Terms &amp; Conditions</a></nav>;
}
