import React, { Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/inter/300.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/600-italic.css";
import { getPageRoute } from "./routes.js";

const route = getPageRoute(window.location.pathname, window.location.search);
const LandingPage = lazy(() => import("./pages/LandingPage.jsx").then((module) => ({ default: module.LandingPage })));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage.jsx").then((module) => ({ default: module.CheckoutPage })));
const ThankYouPage = lazy(() => import("./pages/ThankYouPage.jsx").then((module) => ({ default: module.ThankYouPage })));
const LegalPage = lazy(() => import("./pages/LegalPage.jsx").then((module) => ({ default: module.LegalPage })));

function App() {
  const page = route.page === "checkout" ? (
    <CheckoutPage />
  ) : route.page === "thankyou" ? (
    <ThankYouPage merchantOrderId={route.merchantOrderId} />
  ) : route.page === "legal" ? (
    <LegalPage type={route.type} />
  ) : (
    <LandingPage />
  );

  return <Suspense fallback={null}>{page}</Suspense>;
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
