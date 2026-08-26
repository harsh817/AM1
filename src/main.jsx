import React from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/inter/300.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/600-italic.css";
import { CheckoutPage } from "./pages/CheckoutPage.jsx";
import { LandingPage } from "./pages/LandingPage.jsx";
import { LegalPage } from "./pages/LegalPage.jsx";
import { ThankYouPage } from "./pages/ThankYouPage.jsx";
import { getPageRoute } from "./routes.js";
import "./styles/landing.css";

const route = getPageRoute(window.location.pathname, window.location.search);

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {route.page === "checkout" ? (
      <CheckoutPage />
    ) : route.page === "thankyou" ? (
      <ThankYouPage merchantOrderId={route.merchantOrderId} />
    ) : route.page === "legal" ? (
      <LegalPage type={route.type} />
    ) : (
      <LandingPage />
    )}
  </React.StrictMode>,
);
