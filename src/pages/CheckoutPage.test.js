import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const checkoutSource = readFileSync(new URL("./CheckoutPage.jsx", import.meta.url), "utf8");
const thankyouSource = readFileSync(new URL("./ThankYouPage.jsx", import.meta.url), "utf8");
const landingSource = readFileSync(new URL("./LandingPageAM2.jsx", import.meta.url), "utf8");
const legalSource = readFileSync(new URL("./LegalPage.jsx", import.meta.url), "utf8");
const mainSource = readFileSync(new URL("../main.jsx", import.meta.url), "utf8");
const checkoutCss = readFileSync(new URL("../styles/checkout.css", import.meta.url), "utf8");
const landingAm2Css = readFileSync(new URL("../styles/landing-am2.css", import.meta.url), "utf8");
const checkoutConfigSource = readFileSync(new URL("../lib/checkout-config.js", import.meta.url), "utf8");

test("checkout page uses a simplified Ink Luxury checkout structure", () => {
  assert.match(checkoutSource, /<h1 id="checkout-title">You're One Step Closer to Looking Like A Smart Handsome Gentleman<\/h1>/);
  assert.match(checkoutSource, /className="checkout-intro-copy"/);
  assert.match(checkoutSource, /className="checkout-product"/);
  assert.match(checkoutSource, /REPORT_PREVIEW_URL/);
  assert.match(checkoutSource, /<div className="checkout-page">\s*<section className="checkout-intro"/);
  assert.match(checkoutSource, /aria-label="Secure payment"/);
  assert.match(checkoutSource, /PAYMENT_TRUST_IMAGE_URL/);
  assert.doesNotMatch(checkoutSource, /trustBadges|checkout-trust-row|payment-confidence/);
  assert.doesNotMatch(checkoutSource, /No Subscription/);
  assert.doesNotMatch(checkoutSource, /A human stylist will review your details and build a personalized style report/);
  assert.doesNotMatch(checkoutSource, /checkout-summary-line|Today's Price \{BASE_PRICE_LABEL\}|BASE_PRICE_LABEL/);
  assert.match(checkoutSource, /<form className="checkout-card" onSubmit=\{handleSubmit\} noValidate data-clarity-mask="true">/);
  assert.match(checkoutSource, /data-clarity-mask="true"/);
  assert.match(checkoutSource, /const \[initialDraft\] = useState\(loadDraft\);/);
  assert.doesNotMatch(checkoutSource, /useMemo\(loadDraft/);
  assert.match(checkoutSource, /<h2 id="contact-title">Where should we send your report\?<\/h2>/);
  assert.match(checkoutSource, /<h2 id="addons-title">Optional Upgrades<\/h2>/);
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
  assert.doesNotMatch(checkoutSource, /Review your order|See exactly what you are paying|className="checkout-selected-items"|<span>Subtotal<\/span>/);
  assert.match(checkoutSource, /isPaying \? "Processing" : "Complete My Order"/);
  assert.doesNotMatch(checkoutSource, /Proceed to secure payment|Proceed My Order [`$+{]/);
  assert.doesNotMatch(checkoutSource, /<span>1<\/span>\s*<h2 id="contact-title"|<span>2<\/span>[\s\S]*<h2 id="order-title"/);
  assert.match(checkoutSource, /<section className="checkout-next">/);
  assert.doesNotMatch(checkoutSource, /checkout-intro-panel|checkout-layout|checkout-sidebar|checkout-reassurance/);
  assert.doesNotMatch(checkoutSource, /src="\/assets\/product\/style-report\.png"/);
  assert.doesNotMatch(checkoutSource, /className="bump-benefits"/);
});

test("funnel pages own analytics side effects by route", () => {
  assert.doesNotMatch(mainSource, /initializeAnalytics|trackLandingView|trackCheckoutView|trackPayment/);
  assert.match(landingSource, /import \{ Fragment, useEffect \} from "react";/);
  assert.match(landingSource, /initializeAnalytics\(\{ route \}\);/);
  assert.match(landingSource, /trackLandingView\(\{ route \}\);/);
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
  assert.match(mainSource, /lazy\(\(\) => import\("\.\/pages\/LandingPageAM2\.jsx"\)/);
  assert.match(mainSource, /lazy\(\(\) => import\("\.\/pages\/CheckoutPage\.jsx"\)/);
  assert.match(mainSource, /lazy\(\(\) => import\("\.\/pages\/ThankYouPage\.jsx"\)/);
  assert.match(mainSource, /lazy\(\(\) => import\("\.\/pages\/LegalPage\.jsx"\)/);
  assert.doesNotMatch(mainSource, /from "\.\/pages\/LandingPage\.jsx"|from "\.\/pages\/CheckoutPage\.jsx"|from "\.\/styles\/landing\.css"/);
  assert.match(landingSource, /import "\.\.\/styles\/landing\.css";/);
  assert.match(landingSource, /data-page-variant=\{variant\}/);
  assert.match(landingSource, /className=\{`am2-site\$\{isDarkVariant \? " am2-theme-dark" : ""\}`\}/);
  assert.match(landingSource, /if \(preview \|\| import\.meta\.env\?\.DEV\) return;/);
  assert.match(checkoutSource, /import "\.\.\/styles\/checkout\.css";/);
  assert.match(legalSource, /import "\.\.\/styles\/legal\.css";/);
  assert.doesNotMatch(checkoutSource, /landing\.css|\.\/landing\//);
  assert.doesNotMatch(legalSource, /landing\.css|checkout\.css/);
});

test("AM2 dark theme uses bright text and dark surfaces for copy panels", () => {
  assert.match(landingAm2Css, /\.am2-page \.am2-styleiq-hero,[\s\S]*\.am2-page \.trust-section-shell\s*\{\s*background: var\(--palette-hero-black\);/);
  assert.match(landingAm2Css, /body:has\(\.am2-site\.am2-theme-dark\)\s*\{\s*background: var\(--palette-hero-black\);/);
  assert.match(landingAm2Css, /\.am2-page \.am2-styleiq-hero \.hero-eyebrow\s*\{\s*color: var\(--palette-accent\);/);
  assert.match(landingAm2Css, /--am2-dark-text: var\(--palette-soft-linen\);/);
  assert.match(landingAm2Css, /--am2-dark-muted: color-mix\(in srgb, var\(--palette-ice-slate\) 70%, var\(--palette-soft-linen\)\);/);
  assert.match(landingAm2Css, /--am2-dark-page: var\(--palette-brand\);/);
  assert.match(landingAm2Css, /--am2-dark-surface: color-mix\(in srgb, var\(--palette-brand\) 78%, var\(--palette-hero-black\)\);/);
  assert.match(landingAm2Css, /--am2-dark-raised: color-mix\(in srgb, var\(--palette-brand\) 88%, var\(--palette-soft-linen\) 12%\);/);
  assert.match(landingAm2Css, /--am2-dark-highlight: color-mix\(in srgb, var\(--palette-accent\) 58%, var\(--palette-soft-linen\)\);/);
  assert.match(landingAm2Css, /--am2-dark-edge: var\(--palette-hero-black\);/);
  assert.match(landingAm2Css, /\.am2-theme-dark \.am2-page :is\(h1, h2, h3, h4, summary\)\s*\{\s*color: var\(--am2-dark-text\);/);
  assert.match(landingAm2Css, /\.am2-theme-dark \.am2-page :is\(p, li, small, label, blockquote, figcaption, dt, dd\)\s*\{\s*color: var\(--am2-dark-muted\);/);
  assert.match(landingAm2Css, /\.am2-theme-dark \.am2-narrative-subsection,[\s\S]*\.am2-theme-dark \.faq-editorial \.faq-answer p\s*\{[^}]*background-color: var\(--am2-dark-surface\);/);
  assert.match(landingAm2Css, /\.am2-theme-dark \.am2-page > \.section,[\s\S]*background: var\(--am2-dark-page\);/);
  assert.match(landingAm2Css, /\.am2-theme-dark \.styleiq-page-shell,[\s\S]*\.am2-theme-dark \.am2-process-heading\s*\{[^}]*background-color: var\(--am2-dark-raised\);/);
  assert.match(landingAm2Css, /\.am2-theme-dark \.report-content-subsection-heading,[\s\S]*\.am2-theme-dark \.am2-bonus-heading\s*\{\s*background-color: var\(--am2-dark-heading\);/);
  assert.match(landingAm2Css, /\.am2-theme-dark \.report-content-subsection-heading \+ \.report-content-subsection-body,[\s\S]*border-radius: 0 0 7px 7px;/);
  assert.match(landingAm2Css, /\.am2-theme-dark \.section-editorial-preview \.section-heading h2\s*\{[\s\S]*padding: 16px 20px;[\s\S]*background: var\(--am2-dark-heading\);/);
  assert.match(landingAm2Css, /\.am2-comparison \.comparison-subsections\s*\{[\s\S]*display: block;/);
  assert.match(landingAm2Css, /\.am2-comparison \.comparison-table-row\s*\{[\s\S]*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);/);
  assert.match(landingAm2Css, /\.am2-theme-dark \.am2-comparison \.comparison-cell-without\s*\{[\s\S]*background: color-mix\(in srgb, var\(--am2-dark-edge\)/);
  assert.match(landingAm2Css, /\.am2-theme-dark \.am2-comparison \.comparison-cell-with\s*\{[\s\S]*background: var\(--am2-dark-raised\);/);
  assert.match(landingAm2Css, /\.am2-comparison \.comparison-cell\s*\{[\s\S]*grid-template-columns: 18px minmax\(0, 1fr\);[\s\S]*line-height: 1\.45;/);
  assert.match(landingAm2Css, /\.am2-theme-dark \.section-heading h2 span,[\s\S]*\.am2-theme-dark \.am2-process-heading span\s*\{\s*color: var\(--am2-dark-highlight\);/);
  assert.match(landingAm2Css, /\.am2-theme-dark \.am2-comparison \.comparison-heading-with h3\s*\{\s*color: var\(--am2-dark-highlight\);/);
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
  assert.match(thankyouSource, /\{isFailed \? \(/);
  assert.match(thankyouSource, /href=\{CHECKOUT_PATH\}/);
  assert.match(thankyouSource, /Retry checkout/);
  assert.doesNotMatch(thankyouSource, /Back to landing page|LANDING_PATH/);
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
  assert.match(checkoutCss, /--checkout-headline-size: clamp\(1\.65rem, 1\.35rem \+ 1\.1vw, 2\.2rem\);/);
  assert.match(checkoutCss, /--checkout-form-heading-size: clamp\(1\.18rem, 1\.04rem \+ 0\.45vw, 1\.42rem\);/);
  assert.match(checkoutCss, /--checkout-body-size: 1rem;/);
  assert.match(checkoutCss, /--checkout-detail-size: 0\.9rem;/);
  assert.match(checkoutCss, /\.checkout-intro\s*{[^}]*background: var\(--checkout-deep\);[^}]*box-shadow: none;/s);
  assert.match(checkoutCss, /\.checkout-intro h1\s*{[^}]*text-align: center;/s);
  assert.match(checkoutCss, /\.checkout-intro-copy\s*{[^}]*font-size: 0\.98rem;/s);
  assert.match(checkoutCss, /\.checkout-report-body\s*{[^}]*grid-template-columns: 88px minmax\(0, 1fr\);/s);
  assert.doesNotMatch(checkoutCss, /checkout-summary-line|--checkout-subheadline-size/);
  assert.doesNotMatch(checkoutCss, /\.checkout-block-heading > span/);
  assert.match(checkoutCss, /\.checkout-block-heading h2\s*{[^}]*font-size: var\(--checkout-form-heading-size\);/s);
  assert.match(checkoutCss, /\.checkout-addons-heading\s*{[^}]*margin-bottom: 16px;/s);
  assert.match(checkoutCss, /\.checkout-field\s*{[^}]*font-size: var\(--checkout-body-size\);/s);
  assert.match(checkoutCss, /\.bump-summary\s*{[^}]*font-size: var\(--checkout-detail-size\);/s);
  assert.match(checkoutCss, /\.bump-price\s*{[^}]*text-align: right;/s);
  assert.match(checkoutCss, /\.checkout-recap-item\s*{[^}]*grid-template-columns: minmax\(0, 1fr\) auto;/s);
  assert.match(checkoutCss, /\.checkout-pay\s*{[^}]*background: var\(--checkout-copper\);[^}]*font-size: 1\.05rem;[^}]*font-weight: 900;/s);
  assert.match(checkoutCss, /\.checkout-page button\.checkout-pay\s*{[^}]*font-size: 1\.05rem;[^}]*font-weight: 900;[^}]*}/s);
  assert.match(checkoutCss, /\.thankyou-status-panel\s*{[^}]*background: var\(--checkout-black\);/s);
});

test("checkout stylesheet stays compact and mobile-safe", () => {
  assert.ok(checkoutCss.split(/\r?\n/).length <= 300);
  assert.match(checkoutCss, /\.checkout-main,[\s\S]*\.checkout-recap-item span\s*{ min-width: 0; }/);
  assert.match(checkoutCss, /@media \(max-width: 640px\)\s*{[\s\S]*\.checkout-intro h1 \{ font-size: var\(--checkout-headline-size\); \}/s);
  assert.match(checkoutCss, /@media \(max-width: 640px\)\s*{[\s\S]*\.checkout-report-body \{ grid-template-columns: 72px minmax\(0, 1fr\);/s);
  assert.match(checkoutCss, /@media \(max-width: 640px\)\s*{[\s\S]*\.bump-title-row,[\s\S]*\.checkout-recap-item,[\s\S]*\.checkout-total \{ display: grid; gap: 8px; \}/s);
  assert.doesNotMatch(checkoutCss, /checkout-selected-items/);
  assert.doesNotMatch(checkoutCss, /\.checkout-sidebar|\.checkout-reassurance|\.checkout-intro-panel|\.checkout-layout/);
  assert.match(checkoutCss, /\.thankyou-page\s*{[^}]*overflow-x: hidden;/s);
});
