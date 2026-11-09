import { useEffect, useState } from "react";
import { ArrowDown, ArrowRight, Check, LockKey } from "@phosphor-icons/react";
import { initializeAnalytics, trackPaymentCompleted } from "../lib/analytics.js";
import { canTrackLivePayments, checkPaymentStatus, getAssessmentFormUrl, getPaymentDestination, getPaymentStatusUrl, prefillAssessmentOrder } from "../lib/payment-return.js";
import photoGuide from "../features/style-quiz/assets/approved/assessment-photo-guide.webp";
import { getQuizRetry, forgetQuizRetry } from "../lib/quiz-retry.js";
import { getCheckoutOrderTrackingPayload } from "../lib/checkout-tracking.js";
import { THANKYOU_PATH } from "../routes.js";
import "../styles/checkout.css";
import "../styles/quiz-thankyou.css";

export function ThankYouPage({ merchantOrderId = "", preview = "", onPreviewAssessment }) {
  const isDemo = Boolean(onPreviewAssessment) || (import.meta.env.DEV && preview === "completed");
  const [verified, setVerified] = useState(false);
  const [message, setMessage] = useState("Confirming your payment with PhonePe...");
  const [isQuizOrder] = useState(() => Boolean(onPreviewAssessment || getQuizRetry(merchantOrderId, false) ||
    getCheckoutOrderTrackingPayload(merchantOrderId).quiz?.source === "style-quiz"));
  const assessmentUrl = prefillAssessmentOrder(getAssessmentFormUrl(), merchantOrderId);

  useEffect(() => {
    if (isDemo) {
      setVerified(true);
      setMessage("Your payment is confirmed. Your StyleIQ journey starts here.");
      return undefined;
    }
    if (canTrackLivePayments()) initializeAnalytics({ route: THANKYOU_PATH });

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

        if (canTrackLivePayments()) trackPaymentCompleted({
          merchantOrderId,
          amountPaise: result.payableAmountPaise ?? result.amountPaise,
          currency: result.currency,
          route: THANKYOU_PATH,
        });
        forgetQuizRetry(merchantOrderId);
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
  }, [merchantOrderId, isDemo]);

  return (
    <main className={`thankyou-page${isQuizOrder ? " thankyou-page--quiz" : ""}`}>
      <section className="thankyou-card completed">
        {isDemo ? <p className="payment-preview-notice">DEMO · No payment was made and no conversion was recorded</p> : null}
        <div className="thankyou-status-panel">
          <div className="thankyou-icon" aria-hidden="true">{verified ? <Check size={30} weight="bold" /> : <LockKey size={30} weight="bold" />}</div>
          <p className="checkout-step">{isQuizOrder && verified ? "Your next step" : "StyleIQ System"}</p>
          <h1>{verified ? isDemo ? "Demo payment complete" : "Payment confirmed" : merchantOrderId ? "Confirming payment" : "Order reference missing"}</h1>
          <p>{isQuizOrder && verified ? "Have these three photos ready before you start." : message}</p>
        </div>
        {verified ? (
          <div className="thankyou-next">
            {!isQuizOrder && <h2>Start your assessment</h2>}
            <p>Use the same name, email address, and WhatsApp number you entered at checkout so we can match your answers to your order.</p>
            {isQuizOrder && <figure className="thankyou-photo-guide">
              <img src={photoGuide} alt="Examples of a front portrait, side profile and full-length photo" />
              <figcaption>Front portrait · Side profile · Full-length photo</figcaption>
            </figure>}
            {merchantOrderId && isQuizOrder && <p>Include order reference <strong>{merchantOrderId}</strong>, upload all three photos, and submit the assessment.</p>}
            {onPreviewAssessment ? (
              <button className="checkout-pay thankyou-primary" type="button" onClick={onPreviewAssessment}>Start my assessment <ArrowRight size={19} /></button>
            ) : assessmentUrl ? (
              <>
                <p className="thankyou-assessment-cue"><ArrowDown size={17} weight="bold" aria-hidden="true" /><span>Your next step: tap below to begin</span></p>
                <a className="checkout-pay thankyou-primary" href={assessmentUrl} target="_blank" rel="noreferrer"><span>Start my assessment</span><ArrowRight size={19} weight="bold" aria-hidden="true" /></a>
              </>
            ) : (
              <div className="thankyou-form-unavailable" role="status">Your assessment link is being prepared. Please contact support and include your order ID.</div>
            )}
            <p className="thankyou-delivery-note">Delivered within 48 hours after we receive your completed assessment and required photos.</p>
          </div>
        ) : merchantOrderId ? (
          <div className="thankyou-next thankyou-confirming">
            <LockKey size={19} aria-hidden="true" />
            <span>We’ll show the next step as soon as your payment is confirmed.</span>
            <a href={getPaymentStatusUrl(merchantOrderId)}>Check payment status</a>
          </div>
        ) : null}
        {merchantOrderId && !isQuizOrder ? <div className="thankyou-order"><span>Order reference</span><strong>{merchantOrderId}</strong></div> : null}
        <nav className="thankyou-legal" aria-label="Legal links"><a href="/privacy">Privacy Policy</a><a href="/terms">Terms &amp; Conditions</a></nav>
      </section>
    </main>
  );
}
