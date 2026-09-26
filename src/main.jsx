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
const LegalPage = lazy(() => import("./pages/LegalPage.jsx").then((module) => ({ default: module.LegalPage })));
const ExperimentDashboard = lazy(() => import("./pages/ExperimentDashboard.jsx").then((module) => ({ default: module.ExperimentDashboard })));

function App({ route }) {
  if (route.page === "pending") return null;
  const page = route.page === "checkout" ? (
    <CheckoutPage />
  ) : route.page === "landing" || route.page === "landing-am2" ? (
    <LandingPageAM2 variant={route.variant || (route.page === "landing-am2" ? "AM2" : "AM")} preview={route.preview} />
  ) : route.page === "thankyou" ? (
    <ThankYouPage merchantOrderId={route.merchantOrderId} />
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
  const route = landingRoute || getPageRoute(window.location.pathname, window.location.search);
  createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <App route={route} />
    </React.StrictMode>,
  );
});
