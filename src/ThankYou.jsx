import { useEffect, useState } from "react";
import { Check, LockKey, WarningCircle } from "@phosphor-icons/react";
import { getCheckoutOrderTrackingPayload } from "./checkout-tracking.js";
import { CHECKOUT_PATH, LANDING_PATH } from "./routes.js";
import "./checkout.css";

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
          localStorage.removeItem("attractivemen-checkout-draft");
          setStatus("Payment received. Your report order is confirmed.");
        } else if (data.state === "FAILED") {
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

  return (
    <main className="thankyou-page">
      <section className={`thankyou-card ${state.toLowerCase()}`}>
        <div className="thankyou-icon" aria-hidden="true">
          <Icon size={30} weight="bold" />
        </div>
        <p className="checkout-step">AttractiveMen order</p>
        <h1>{isCompleted ? "Payment received" : isFailed ? "Payment failed" : "Payment pending"}</h1>
        <p>{status}</p>
        <div className="thankyou-order">
          <span>Merchant order ID</span>
          <strong>{merchantOrderId || "Unavailable"}</strong>
        </div>
        <div className="thankyou-actions">
          <a className="checkout-pay thankyou-primary" href={isCompleted ? LANDING_PATH : CHECKOUT_PATH}>
            {isCompleted ? "Back to landing page" : "Retry checkout"}
          </a>
          <a className="checkout-save" href={`mailto:attractivemen08@gmail.com?subject=AttractiveMen order ${merchantOrderId}`}>
            Contact support
          </a>
        </div>
      </section>
    </main>
  );
}
