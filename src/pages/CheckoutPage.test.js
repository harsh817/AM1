import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const checkoutSource = readFileSync(new URL("./CheckoutPage.jsx", import.meta.url), "utf8");
const thankyouSource = readFileSync(new URL("./ThankYouPage.jsx", import.meta.url), "utf8");
const landingSource = readFileSync(new URL("./LandingPage.jsx", import.meta.url), "utf8");
const legalSource = readFileSync(new URL("./LegalPage.jsx", import.meta.url), "utf8");
const mainSource = readFileSync(new URL("../main.jsx", import.meta.url), "utf8");
const checkoutCss = readFileSync(new URL("../styles/checkout.css", import.meta.url), "utf8");
const checkoutConfigSource = readFileSync(new URL("../lib/checkout-config.js", import.meta.url), "utf8");

test("checkout page uses a simplified Ink Luxury checkout structure", () => {
  assert.match(checkoutSource, /import \{ trustBadges \} from "\.\.\/lib\/landing-data\.js";/);
  assert.match(checkoutSource, /<h1 id="checkout-title">Complete Your Order for Personal Style Report<\/h1>/);
  assert.match(checkoutSource, /trustBadges\.map\(\(badge\) => <span key=\{badge\}>\{badge\}<\/span>\)/);
  assert.match(checkoutSource, /className="checkout-trust-row"/);
  assert.match(checkoutSource, /<div className="checkout-page">\s*<section className="checkout-intro"/);
  assert.match(checkoutSource, /aria-label="Checkout trust points"/);
  assert.match(checkoutSource, /Completely Customized/);
  assert.match(checkoutSource, /One-Time Payment/);
  assert.match(checkoutSource, /Secure Payment/);
  assert.match(checkoutSource, /Encrypted Details/);
  assert.doesNotMatch(checkoutSource, /<p className="checkout-step">Secure checkout<\/p>|No Subscription/);
  assert.doesNotMatch(checkoutSource, /A human stylist will review your details and build a personalized style report/);
  assert.doesNotMatch(checkoutSource, /checkout-summary-line|Today's Price \{BASE_PRICE_LABEL\}|BASE_PRICE_LABEL/);
  assert.match(checkoutSource, /<form className="checkout-card" onSubmit=\{handleSubmit\} noValidate data-clarity-mask="true">/);
  assert.match(checkoutSource, /data-clarity-mask="true"/);
  assert.match(checkoutSource, /const \[initialDraft\] = useState\(loadDraft\);/);
  assert.doesNotMatch(checkoutSource, /useMemo\(loadDraft/);
  assert.match(checkoutSource, /<h2 id="contact-title">Where should we send your report\?<\/h2>/);
  assert.match(checkoutSource, /<h2 id="addons-title">100X Add-Ons<\/h2>/);
  assert.match(checkoutSource, /CHECKOUT_BUMPS\.map\(\(bump\) =>/);
  assert.match(checkoutSource, /Get a private style review call to understand your report/);
  assert.match(checkoutSource, /Get your Instagram profile reviewed for photos/);
  assert.match(checkoutSource, /\+\{formatAddOnPrice\(price\)\} \+ GST/);
  assert.doesNotMatch(checkoutSource, /20-Minute Style Review Call \+ Flirting Guide|Optional 20-minute style review call/);
  assert.match(checkoutSource, /const orderItems = \[/);
  assert.match(checkoutSource, /<h2 id="order-title">Recap of Your Order<\/h2>/);
  assert.match(checkoutSource, /className="checkout-recap-items"/);
  assert.match(checkoutSource, /orderItems\.map\(\(item\) =>/);
  assert.match(checkoutSource, /<span>GST \(18%\)<\/span><b>\{formatMoney\(gst\)\}<\/b>/);
  assert.doesNotMatch(checkoutSource, /Review your order|See exactly what you are paying|className="checkout-product"|className="checkout-selected-items"|<span>Subtotal<\/span>/);
  assert.match(checkoutSource, /isPaying \? "Opening secure payment\.\.\." : "Proceed My Order"/);
  assert.doesNotMatch(checkoutSource, /Proceed to secure payment|Proceed My Order [`$+{]/);
  assert.doesNotMatch(checkoutSource, /<span>1<\/span>\s*<h2 id="contact-title"|<span>2<\/span>[\s\S]*<h2 id="order-title"/);
  assert.match(checkoutSource, /<section className="checkout-next">/);
  assert.doesNotMatch(checkoutSource, /checkout-intro-panel|checkout-layout|checkout-sidebar|checkout-reassurance/);
  assert.doesNotMatch(checkoutSource, /src="\/assets\/product\/style-report\.png"/);
  assert.doesNotMatch(checkoutSource, /className="bump-benefits"/);
});

test("funnel pages own analytics side effects by route", () => {
  assert.doesNotMatch(mainSource, /initializeAnalytics|trackLandingView|trackCheckoutView|trackPayment/);
  assert.match(landingSource, /import \{ useEffect \} from "react";/);
  assert.match(landingSource, /initializeAnalytics\(\{ route: LANDING_PATH \}\);/);
  assert.match(landingSource, /trackLandingView\(\{ route: LANDING_PATH \}\);/);
  assert.match(checkoutSource, /initializeAnalytics\(\{ route: CHECKOUT_PATH \}\);/);
  assert.match(checkoutSource, /trackCheckoutView\(\{ route: CHECKOUT_PATH \}\);/);
  assert.match(checkoutSource, /trackPaymentStarted\(\{[\s\S]*merchantOrderId: data\.merchantOrderId,[\s\S]*amountPaise: data\.amountPaise,[\s\S]*currency: data\.currency,/);
  assert.match(thankyouSource, /if \(data\.state === "COMPLETED"\) \{[\s\S]*initializeAnalytics\(\{ route: THANKYOU_PATH \}\);/);
  assert.match(thankyouSource, /else if \(data\.state === "FAILED"\) \{[\s\S]*initializeAnalytics\(\{ trackPageView: false, route: THANKYOU_PATH \}\);/);
  assert.match(thankyouSource, /trackPaymentCompleted\(\{[\s\S]*merchantOrderId,[\s\S]*amountPaise: getVerifiedStatusAmountPaise\(data\),[\s\S]*currency: data\.currency,/);
  assert.match(thankyouSource, /trackPaymentFailed\(\{[\s\S]*merchantOrderId,[\s\S]*amountPaise: getVerifiedStatusAmountPaise\(data\),[\s\S]*currency: data\.currency,/);
});

test("route entry lazy-loads page modules and keeps landing styles out of checkout", () => {
  assert.match(mainSource, /import React, \{ Suspense, lazy \} from "react";/);
  assert.match(mainSource, /lazy\(\(\) => import\("\.\/pages\/LandingPage\.jsx"\)/);
  assert.match(mainSource, /lazy\(\(\) => import\("\.\/pages\/CheckoutPage\.jsx"\)/);
  assert.match(mainSource, /lazy\(\(\) => import\("\.\/pages\/ThankYouPage\.jsx"\)/);
  assert.match(mainSource, /lazy\(\(\) => import\("\.\/pages\/LegalPage\.jsx"\)/);
  assert.doesNotMatch(mainSource, /from "\.\/pages\/LandingPage\.jsx"|from "\.\/pages\/CheckoutPage\.jsx"|from "\.\/styles\/landing\.css"/);
  assert.match(landingSource, /import "\.\.\/styles\/landing\.css";/);
  assert.match(checkoutSource, /import "\.\.\/styles\/checkout\.css";/);
  assert.match(legalSource, /import "\.\.\/styles\/legal\.css";/);
  assert.doesNotMatch(checkoutSource, /landing\.css|\.\/landing\//);
  assert.doesNotMatch(legalSource, /landing\.css|checkout\.css/);
});

test("checkout add-ons use the approved shared config", () => {
  assert.match(checkoutConfigSource, /id: "style-consultation",[\s\S]*title: "Personal Style Consultation",[\s\S]*price: 499,/);
  assert.match(checkoutConfigSource, /id: "instagram-makeover",[\s\S]*title: "Instagram Profile Analysis \+ Makeover",[\s\S]*price: 299,/);
  assert.doesNotMatch(checkoutConfigSource, /20-Minute Style Review Call \+ Flirting Guide|id: "call"/);
});

test("thank-you page uses the same status and next-step treatment", () => {
  assert.match(thankyouSource, /className="thankyou-status-panel"/);
  assert.match(thankyouSource, /className="thankyou-next"/);
  assert.match(thankyouSource, /Complete your assessment/);
  assert.match(thankyouSource, /Your report arrives within 48 hours/);
  assert.match(thankyouSource, /Keep this order ID saved/);
  assert.match(thankyouSource, /className="thankyou-legal"/);
  assert.match(thankyouSource, /href="\/privacy"/);
  assert.match(thankyouSource, /href="\/terms"/);
  assert.match(thankyouSource, /const THANKYOU_STATUS_RETRY_DELAY_MS = 3000;/);
  assert.match(thankyouSource, /const THANKYOU_STATUS_MAX_ATTEMPTS = 20;/);
  assert.match(thankyouSource, /retryTimeout = window\.setTimeout\(\(\) => checkStatus\(attempt \+ 1\), THANKYOU_STATUS_RETRY_DELAY_MS\);/);
  assert.match(thankyouSource, /window\.clearTimeout\(retryTimeout\);/);
});

test("privacy page explicitly discloses analytics and ad attribution", () => {
  assert.match(legalSource, /Meta Pixel/);
  assert.match(legalSource, /Microsoft Clarity/);
  assert.match(legalSource, /cookies and local storage/);
  assert.match(legalSource, /ad attribution/);
  assert.match(legalSource, /session recordings/);
});

test("checkout stylesheet follows the approved Ink Luxury tokens", () => {
  assert.match(checkoutCss, /--checkout-black: #050505;/);
  assert.match(checkoutCss, /--checkout-ink: #161616;/);
  assert.match(checkoutCss, /--checkout-deep: #10232A;/);
  assert.match(checkoutCss, /--checkout-linen: #d3c3b9;/);
  assert.match(checkoutCss, /--checkout-copper: #b58863;/);
  assert.match(checkoutCss, /--checkout-headline-size: 1\.75rem;/);
  assert.match(checkoutCss, /--checkout-trust-size: clamp\(1rem, 0\.95rem \+ 0\.2vw, 1\.125rem\);/);
  assert.match(checkoutCss, /--checkout-form-heading-size: clamp\(1\.38rem, 1\.14rem \+ 0\.85vw, 1\.75rem\);/);
  assert.match(checkoutCss, /--checkout-body-size: clamp\(1\.05rem, 0\.99rem \+ 0\.24vw, 1\.18rem\);/);
  assert.match(checkoutCss, /--checkout-detail-size: clamp\(0\.98rem, 0\.94rem \+ 0\.18vw, 1\.08rem\);/);
  assert.match(checkoutCss, /\.checkout-intro\s*{[^}]*border-radius: 0;[^}]*background: var\(--checkout-deep\);[^}]*box-shadow: none;/s);
  assert.match(checkoutCss, /\.checkout-intro h1\s*{[^}]*text-align: center;/s);
  assert.match(checkoutCss, /\.checkout-trust-row\s*{[^}]*margin-top: clamp\(28px, 4vw, 36px\);/s);
  assert.doesNotMatch(checkoutCss, /\.checkout-intro > p:not/);
  assert.doesNotMatch(checkoutCss, /checkout-summary-line|--checkout-subheadline-size/);
  assert.doesNotMatch(checkoutCss, /\.checkout-block-heading > span/);
  assert.match(checkoutCss, /\.checkout-block-heading h2\s*{[^}]*font-size: var\(--checkout-form-heading-size\);/s);
  assert.match(checkoutCss, /\.checkout-addons-heading\s*{[^}]*margin-bottom: 16px;/s);
  assert.match(checkoutCss, /\.checkout-field\s*{[^}]*font-size: var\(--checkout-body-size\);/s);
  assert.match(checkoutCss, /\.bump-summary\s*{[^}]*font-size: var\(--checkout-detail-size\);/s);
  assert.match(checkoutCss, /\.bump-price\s*{[^}]*text-align: right;/s);
  assert.match(checkoutCss, /\.checkout-recap-item\s*{[^}]*grid-template-columns: minmax\(0, 1fr\) auto;/s);
  assert.match(checkoutCss, /\.checkout-pay\s*{[^}]*background: var\(--checkout-copper\);[^}]*font-size: 24px;[^}]*font-weight: 900;/s);
  assert.match(checkoutCss, /\.checkout-page button\.checkout-pay\s*{[^}]*font-size: 24px;[^}]*font-weight: 900;[^}]*}/s);
  assert.match(checkoutCss, /\.thankyou-status-panel\s*{[^}]*background: var\(--checkout-black\);/s);
});

test("checkout stylesheet stays compact and mobile-safe", () => {
  assert.ok(checkoutCss.split(/\r?\n/).length <= 300);
  assert.match(checkoutCss, /\.checkout-main,[\s\S]*\.checkout-recap-item span\s*{ min-width: 0; }/);
  assert.match(checkoutCss, /@media \(max-width: 640px\)\s*{[\s\S]*\.checkout-intro h1 \{ font-size: var\(--checkout-headline-size\); \}/s);
  assert.match(checkoutCss, /@media \(max-width: 640px\)\s*{[\s\S]*\.checkout-trust-row \{ gap: 9px; font-size: clamp\(0\.875rem, 3\.6vw, 1rem\); \}/s);
  assert.match(checkoutCss, /@media \(max-width: 640px\)\s*{[\s\S]*\.bump-title-row,[\s\S]*\.checkout-recap-item,[\s\S]*\.checkout-total \{ display: grid; gap: 8px; \}/s);
  assert.doesNotMatch(checkoutCss, /checkout-product|checkout-selected-items/);
  assert.doesNotMatch(checkoutCss, /\.checkout-sidebar|\.checkout-reassurance|\.checkout-intro-panel|\.checkout-layout/);
  assert.match(checkoutCss, /\.thankyou-page\s*{[^}]*overflow-x: hidden;/s);
});
