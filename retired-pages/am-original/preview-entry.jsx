import React from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/inter/300.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import { LandingPage } from "./source/pages/LandingPage.jsx";

createRoot(document.getElementById("root")).render(<LandingPage />);
