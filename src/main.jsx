import React, { Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/inter/300.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/600-italic.css";
import { getPageRoute } from "./routes.js";
import { resolveLandingRouteAsync } from "./lib/ab-testing.js";

const LandingPageAM2 = lazy(() => import("./pages/LandingPageAM2.jsx").then((module) => ({ default: module.LandingPageAM2 })));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage.jsx").then((module) => ({ default: module.CheckoutPage })));
const ThankYouPage = lazy(() => import("./pages/ThankYouPage.jsx").then((module) => ({ default: module.ThankYouPage })));
const PaymentStatusPage = lazy(() => import("./pages/PaymentStatusPage.jsx").then((module) => ({ default: module.PaymentStatusPage })));
const PaymentFailedPage = lazy(() => import("./pages/PaymentFailedPage.jsx").then((module) => ({ default: module.PaymentFailedPage })));
const LegalPage = lazy(() => import("./pages/LegalPage.jsx").then((module) => ({ default: module.LegalPage })));
const ExperimentDashboard = lazy(() => import("./pages/ExperimentDashboard.jsx").then((module) => ({ default: module.ExperimentDashboard })));
const StyleQuizPage = lazy(() => import("./features/style-quiz/StyleQuizPage.jsx").then((module) => ({ default: module.StyleQuizPage })));

function App({ route }) {
  if (route.page === "pending") return null;
  const page = route.page === "checkout" ? (
    <CheckoutPage preview={import.meta.env.DEV && new URLSearchParams(window.location.search).get("previewQuiz") === "1"} />
  ) : route.page === "style-quiz" ? (
    <StyleQuizPage preview={route.preview} />
  ) : route.page === "style-quiz-disabled" ? (
    <main className="style-quiz-disabled"><h1>StyleIQ is getting ready</h1><p>You can try the full walkthrough with a simulated checkout.</p><a href="/style-quiz?preview=1">Open the StyleIQ quiz demo</a></main>
  ) : route.page === "complexion" ? (
    <LandingPageAM2 variant="AM2" persona="complexion" />
  ) : route.page === "complexion-preview" ? (
    <LandingPageAM2 variant="AM2" preview persona="complexion" />
  ) : route.page === "landing" || route.page === "landing-am2" ? (
    <LandingPageAM2 variant={route.variant || (route.page === "landing-am2" ? "AM2" : "AM")} preview={route.preview} />
  ) : route.page === "thankyou" ? (
    <ThankYouPage merchantOrderId={route.merchantOrderId} preview={route.preview} />
  ) : route.page === "payment-status" ? (
    <PaymentStatusPage merchantOrderId={route.merchantOrderId} preview={route.preview} />
  ) : route.page === "payment-failed" ? (
    <PaymentFailedPage merchantOrderId={route.merchantOrderId} preview={route.preview} />
  ) : route.page === "experiment-dashboard" ? (
    <ExperimentDashboard />
  ) : route.page === "dashboard" ? (
    <ExperimentDashboard initialSection={route.section} />
  ) : route.page === "legal" ? (
    <LegalPage type={route.type} />
  ) : (
    <LandingPageAM2 variant="AM" />
  );

  return <Suspense fallback={null}>{page}</Suspense>;
}

resolveLandingRouteAsync(window).then((landingRoute) => {
  const route = import.meta.env.DEV && window.location.pathname === "/preview/deeper-complexion"
    ? { page: "complexion-preview" }
    : landingRoute || getPageRoute(window.location.pathname, window.location.search);
  createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <App route={route} />
    </React.StrictMode>,
  );
});
