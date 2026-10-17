import { useEffect, useState } from "react";
import { WarningCircle } from "@phosphor-icons/react";
import { checkPaymentStatus, getFailedPaymentRetryUrl, getPaymentDestination, getPaymentStatusUrl, markFailedPaymentRetry } from "../lib/payment-return.js";
import "../styles/checkout.css";

export function PaymentFailedPage({ merchantOrderId = "", preview = "" }) {
  const [verified, setVerified] = useState(false);
  const [message, setMessage] = useState("Confirming the payment outcome with PhonePe...");
  const reassurance = "Don’t worry—you can still look attractive, masculine and confident with a personal style report tried by 1,119+ men and rated 4.5 stars.";

  useEffect(() => {
    if (import.meta.env.DEV && preview === "failed") {
      setVerified(true);
      setMessage(reassurance);
      return undefined;
    }
    let cancelled = false;
    if (!merchantOrderId) {
      setMessage("We need your order reference to check what happened. If money was deducted, contact support before trying again.");
      return () => { cancelled = true; };
    }

    checkPaymentStatus(merchantOrderId)
      .then((result) => {
        if (cancelled) return;
        if (result.state !== "FAILED") {
          const destination = getPaymentDestination(result.state, merchantOrderId);
          window.location.replace(destination || getPaymentStatusUrl(merchantOrderId));
          return;
        }
        setVerified(true);
        setMessage(reassurance);
      })
      .catch(() => {
        if (!cancelled) {
          setMessage("We can’t confirm the payment outcome yet. Please check its status before trying again.");
          window.setTimeout(() => {
            if (!cancelled) window.location.replace(getPaymentStatusUrl(merchantOrderId));
          }, 1800);
        }
      });

    return () => { cancelled = true; };
  }, [merchantOrderId, preview]);

  const retryUrl = getFailedPaymentRetryUrl(merchantOrderId);
  const handleRetry = () => {
    if (!verified || !merchantOrderId) return;
    markFailedPaymentRetry(merchantOrderId);
    window.location.assign(retryUrl);
  };

  return (
    <main className="thankyou-page">
      <section className="thankyou-card failed">
        {import.meta.env.DEV && preview ? <p className="payment-preview-notice">LOCAL PREVIEW · No payment was made</p> : null}
        <div className="thankyou-status-panel">
          <div className="thankyou-icon" aria-hidden="true"><WarningCircle size={30} weight="bold" /></div>
          <p className="checkout-step">{verified ? "Payment not completed" : "StyleIQ System"}</p>
          <h1>{verified ? "Oops, seems like something didn’t go as planned" : "Checking payment"}</h1>
          <p aria-live="polite">{message}</p>
        </div>
        {merchantOrderId ? <div className="thankyou-order"><span>Order reference</span><strong>{merchantOrderId}</strong></div> : null}
        {verified ? (
          <div className="thankyou-next">
            <h2>Your style upgrade is still within reach</h2>
            <p>Your StyleIQ report brings together hairstyle and beard ideas, colours, clothing fits, outfits and grooming guidance chosen around you.</p>
            <p className="thankyou-delivery-note">If money was deducted, please check your payment status before starting another payment attempt.</p>
            <div className="thankyou-actions">
              <button className="checkout-pay thankyou-primary" type="button" onClick={handleRetry}>Continue to checkout</button>
            </div>
          </div>
        ) : (
          <div className="thankyou-next thankyou-confirming"><a href={getPaymentStatusUrl(merchantOrderId)}>Check payment status</a></div>
        )}
        <nav className="thankyou-legal" aria-label="Legal links"><a href="/privacy">Privacy Policy</a><a href="/terms">Terms &amp; Conditions</a></nav>
      </section>
    </main>
  );
}
