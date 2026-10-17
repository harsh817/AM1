import { useEffect, useState } from "react";
import { ArrowDown, ArrowRight, Check, LockKey } from "@phosphor-icons/react";
import { initializeAnalytics, trackPaymentCompleted } from "../lib/analytics.js";
import { checkPaymentStatus, getAssessmentFormUrl, getPaymentDestination, getPaymentStatusUrl } from "../lib/payment-return.js";
import { THANKYOU_PATH } from "../routes.js";
import "../styles/checkout.css";

export function ThankYouPage({ merchantOrderId = "", preview = "" }) {
  const [verified, setVerified] = useState(false);
  const [message, setMessage] = useState("Confirming your payment with PhonePe...");
  const assessmentUrl = getAssessmentFormUrl();

  useEffect(() => {
    if (import.meta.env.DEV && preview === "completed") {
      setVerified(true);
      setMessage("Your payment is confirmed. Your StyleIQ journey starts here.");
      return undefined;
    }
    let cancelled = false;
    if (!merchantOrderId) {
      setMessage("We need your order reference to confirm this payment. Please contact support if money was deducted.");
      return () => { cancelled = true; };
    }

    checkPaymentStatus(merchantOrderId)
      .then((result) => {
        if (cancelled) return;
        const destination = getPaymentDestination(result.state, merchantOrderId);
        if (result.state !== "COMPLETED") {
          window.location.replace(destination || getPaymentStatusUrl(merchantOrderId));
          return;
        }

        initializeAnalytics({ route: THANKYOU_PATH });
        trackPaymentCompleted({
          merchantOrderId,
          amountPaise: result.payableAmountPaise ?? result.amountPaise,
          currency: result.currency,
          route: THANKYOU_PATH,
        });
        try {
          localStorage.removeItem("attractivemen-checkout-draft:v2");
        } catch {
          // Draft cleanup is best-effort and does not affect the confirmed order.
        }
        setVerified(true);
        setMessage("Your payment is confirmed. Your StyleIQ journey starts here.");
      })
      .catch(() => {
        if (!cancelled) setMessage("We couldn’t confirm your payment yet. Check its status before trying again.");
      });

    return () => { cancelled = true; };
  }, [merchantOrderId, preview]);

  return (
    <main className="thankyou-page">
      <section className="thankyou-card completed">
        {import.meta.env.DEV && preview ? <p className="payment-preview-notice">LOCAL PREVIEW · No payment was made and no conversion was recorded</p> : null}
        <div className="thankyou-status-panel">
          <div className="thankyou-icon" aria-hidden="true">{verified ? <Check size={30} weight="bold" /> : <LockKey size={30} weight="bold" />}</div>
          <p className="checkout-step">StyleIQ System</p>
          <h1>{verified ? "Payment confirmed" : merchantOrderId ? "Confirming payment" : "Order reference missing"}</h1>
          <p>{message}</p>
        </div>
        {verified ? (
          <div className="thankyou-next">
            <h2>Start your assessment</h2>
            <p>Use the same name, email address, and WhatsApp number you entered at checkout so we can match your answers to your order.</p>
            {assessmentUrl ? (
              <>
                <p className="thankyou-assessment-cue"><ArrowDown size={17} weight="bold" aria-hidden="true" /><span>Your next step: tap below to begin</span></p>
                <a className="checkout-pay thankyou-primary" href={assessmentUrl} target="_blank" rel="noreferrer"><span>Start my assessment</span><ArrowRight size={19} weight="bold" aria-hidden="true" /></a>
              </>
            ) : (
              <div className="thankyou-form-unavailable" role="status">Your assessment link is being prepared. Please contact support and include your order ID.</div>
            )}
            <p className="thankyou-delivery-note">Your report is delivered within 48 hours after we receive your completed assessment and required photos.</p>
          </div>
        ) : merchantOrderId ? (
          <div className="thankyou-next thankyou-confirming">
            <LockKey size={19} aria-hidden="true" />
            <span>We’ll show the next step as soon as your payment is confirmed.</span>
            <a href={getPaymentStatusUrl(merchantOrderId)}>Check payment status</a>
          </div>
        ) : null}
        {merchantOrderId ? <div className="thankyou-order"><span>Order reference</span><strong>{merchantOrderId}</strong></div> : null}
        <nav className="thankyou-legal" aria-label="Legal links"><a href="/privacy">Privacy Policy</a><a href="/terms">Terms &amp; Conditions</a></nav>
      </section>
    </main>
  );
}
