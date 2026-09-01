# AttractiveMen Project Guide

This file defines project-specific engineering rules for the AttractiveMen Vite/React landing page, checkout flow, Vercel API routes, PhonePe payment integration, and Make webhook tracking.

Follow these instructions for every change in this repository unless the user explicitly asks for something different.

## Project Context

- Frontend: React 19 with Vite.
- Routing: single React entry point with path-based routing in `src/routes.js`.
- API: Vercel serverless functions under `api/`.
- Payments: PhonePe PG V2 Standard Checkout.
- Operations tracking: Make webhook payloads for initiated, completed, failed, and PhonePe webhook events.
- Static output: `npm run build` writes `dist/`; `./scripts/build-standalone.ps1` regenerates `artifacts/AttractiveMen.html`.

This is a conversion-oriented production site. Reliability of checkout, payment status, tracking, and lead delivery matters more than visual experimentation.

## Required Commands

Run these before considering a change complete:

```powershell
npm test
npm run build
```

When source changes affect the standalone landing page, also run:

```powershell
./scripts/build-standalone.ps1
```

For dependency or release work, also run:

```powershell
npm audit --omit=dev --audit-level=moderate
node --test --experimental-test-coverage
```

## Current Repository Structure

```text
api/
  _lib/                         Shared serverless utilities
    payment/                    Payment service layer used by API routes
  phonepe/                      PhonePe API route handlers
public/
  assets/                       Static images used by the site
  privacy.html                  Legacy/static legal page
  terms.html                    Legacy/static legal page
scripts/
  build-standalone.ps1          Creates self-contained HTML exports
artifacts/
  AttractiveMen-original.html   Archived pre-StyleIQ standalone page
  AttractiveMen.html            Generated current standalone landing page
src/
  pages/
    LandingPage.jsx             Landing page composition
    CheckoutPage.jsx            Checkout page
    ThankYouPage.jsx            Thank-you/payment status page
    LegalPage.jsx               Legal page renderer
  lib/
    checkout-config.js          Shared checkout pricing/config
    checkout-tracking.js        Browser-side tracking snapshot logic
    landing-data.js             Landing page content/data
    phone.js                    Phone normalization helper
  styles/
    landing.css                 Landing/legal global styles
    checkout.css                Checkout/thank-you styles
  routes.js                     Client route selection
  main.jsx                      React entry point
index.html                      Main Vite HTML entry
checkout.html                   Checkout Vite HTML entry
vercel.json                     Vercel routing/build configuration
```

## Target Structure For Future Refactors

Do not reorganize the project only for neatness. When a touched file becomes hard to maintain, move toward this shape:

```text
src/
  pages/
    LandingPage.jsx
    CheckoutPage.jsx
    ThankYouPage.jsx
    LegalPage.jsx
  components/
    landing/
    checkout/
    shared/
  lib/
    checkout-config.js
    checkout-tracking.js
    landing-data.js
    phone.js
  styles/
    landing.css
    checkout.css
  routes.js
  main.jsx
api/
  _lib/
    checkout.js
    env.js
    http.js
    make.js
    payment/
      create-order-service.js
      status-service.js
      webhook-service.js
    phonepe.js
    tracking-webhook.js
  phonepe/
    create-order.js
    status.js
    webhook.js
```

Keep files near 300 lines where practical. If a page stays large because it is mostly static copy, prefer extracting sections into small components before creating abstractions.

## General Coding Rules

- Read the relevant file before editing it.
- Prefer existing helpers in `api/_lib/` and `src/` before adding new helpers.
- Keep changes scoped to the requested behavior.
- Use descriptive names. Avoid single-letter variables outside tiny callbacks.
- Keep public functions small and testable.
- Use early returns instead of deep nesting.
- Avoid comments that repeat the code. Add comments only when they explain why a non-obvious decision exists.
- Do not add dependencies unless they remove meaningful complexity or risk.
- Do not hardcode secrets, tokens, webhook URLs, or private credentials.

Good:

```js
export function normalizeIndianMobile(value) {
  return String(value ?? "").replace(/\D/g, "").slice(-10);
}
```

Bad:

```js
export function phone(x) {
  return x.replace(" ", "");
}
```

## JavaScript And Module Practices

This repo currently uses JavaScript modules. Until the project moves to TypeScript, public helper functions should be clear enough to test directly. Use JSDoc for complex shapes or externally consumed helpers.

Good:

```js
/**
 * Builds a Make payload for a completed or failed PhonePe status response.
 *
 * @param {object} input
 * @param {string} input.merchantOrderId
 * @param {object} input.status
 * @returns {object}
 */
export function buildPaymentStatusPayload({ merchantOrderId, status = {} } = {}) {
  return {
    event_name: status.state === "COMPLETED" ? "checkout.payment_completed" : "checkout.payment_failed",
    merchant_order_id: clean(merchantOrderId, 128),
  };
}
```

Bad:

```js
export function payload(x) {
  return { event_name: x.status.state, id: x.id };
}
```

Use immutable updates in React state.

Good:

```js
setSelected((current) =>
  current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
);
```

Bad:

```js
selected.push(id);
setSelected(selected);
```

## React Practices

- Use function components.
- Keep section components focused on rendering one section or one workflow.
- Put business logic in helpers that can be tested without a browser.
- Use lazy state initialization for `localStorage` reads.
- Clean up timers and global event listeners in `useEffect`.
- Do not store sensitive data in `localStorage`.
- Version localStorage keys when the schema may evolve.
- Use accessible labels for icon-only buttons and form fields.
- Use `loading="lazy"` for below-the-fold images.
- Avoid manual DOM access unless it is isolated and cleaned up.

Good:

```jsx
function CheckoutTimer() {
  const [remaining, setRemaining] = useState(getTimeUntilIstMidnight);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRemaining(getTimeUntilIstMidnight());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  return <time>{formatTimer(remaining)}</time>;
}
```

Bad:

```jsx
function CheckoutTimer() {
  setInterval(() => setRemaining(getTimeUntilIstMidnight()), 1000);
  return <div>{remaining}</div>;
}
```

Good storage pattern:

```js
const CHECKOUT_DRAFT_KEY = "attractivemen-checkout-draft:v1";

export function readCheckoutDraft(storage = globalThis.window?.localStorage) {
  try {
    const draft = JSON.parse(storage?.getItem(CHECKOUT_DRAFT_KEY) || "{}");
    return {
      details: draft.details ?? { name: "", email: "", phone: "" },
      selected: Array.isArray(draft.selected) ? draft.selected : [],
    };
  } catch {
    return { details: { name: "", email: "", phone: "" }, selected: [] };
  }
}
```

Bad storage pattern:

```js
const saved = JSON.parse(localStorage.checkout);
```

## Styling And Frontend UX

- Keep landing/legal styles in `src/styles/landing.css` and checkout/thank-you styles in `src/styles/checkout.css`.
- Landing/legal styles must use the four-color palette in `src/styles/landing.css`: background `#f8f9f7`, ink `#1d2426`, brand `#5f7277`, and accent `#d7c4bd`.
- Do not introduce one-off color values. Create semantic variables, alpha values, or `color-mix()` tints from the four palette tokens.
- Landing/legal typography, spacing, widths, radius, and transitions must use the design-system tokens in `:root`: `--text-*`, `--heading-*`, `--weight-*`, `--section-y*`, `--content-*`, `--gap-*`, `--card-*`, and `--transition-*`.
- Section headings should be bold, use the shared heading scale, and keep supporting copy constrained to readable widths.
- Cards, grids, FAQ rows, process steps, and CTA surfaces should use shared gaps, padding, radius, and transition tokens so the page rhythm stays coherent.
- Keep mobile layouts explicit with stable dimensions, grid constraints, and no text overlap.
- Use real product/report/customer imagery for conversion sections. Do not use generic fashion stock photos for the hero.
- Preserve legal links, payment trust copy, and checkout clarity.
- Third-party analytics should not block the main app. Prefer async/deferred loading and document the tracking IDs.

Good:

```css
.checkout-pay {
  min-height: 56px;
  border-radius: 9px;
  background: var(--cta);
}
```

Bad:

```css
.new-button {
  height: 56px;
  border-radius: 999px;
  background: #123456;
}
```

## API Route Practices

Every API route must:

- Reject unsupported methods with `405`.
- Validate body and query inputs before doing external work.
- Enforce request body size limits.
- Return JSON through `sendJson`.
- Avoid leaking secrets, raw provider errors, or stack traces to clients.
- Use explicit timeouts for external calls.
- Keep provider-specific code in `api/_lib/`.
- Keep route files thin; put payment business logic in `api/_lib/payment/`.
- Include tests for success, validation errors, and provider failures.

Good:

```js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return sendJson(res, 405, { message: "Method not allowed." });
  }

  let payload = {};
  try {
    payload = await readJson(req, { maxBytes: 32_000 });
  } catch {
    return sendJson(res, 400, { message: "Invalid request payload." });
  }

  const errors = getCheckoutValidationErrors(payload);
  if (Object.keys(errors).length) {
    return sendJson(res, 400, { message: "Invalid checkout details.", errors });
  }
}
```

Bad:

```js
export default async function handler(req, res) {
  const payload = JSON.parse(req.body);
  const payment = await createPhonePePayment(payload);
  res.end(JSON.stringify(payment));
}
```

## Payment And Webhook Rules

Payment code is production-critical.

- Never trust amounts, GST, selected items, or order IDs from the browser.
- Always calculate payable amount on the server from `src/lib/checkout-config.js`.
- Use idempotency for payment lifecycle events sent to Make.
- Treat PhonePe verified webhooks as the durable source for final payment state.
- Do not let public status endpoints create duplicate operational events.
- Verify PhonePe webhook signatures before parsing business logic.
- Store only necessary payment identifiers in browser storage.
- Never log full customer PII, PhonePe credentials, or webhook secrets.
- Keep PhonePe credentials in environment variables only.

Good:

```js
const totals = calculateCheckoutTotals(selected);

await createPhonePePayment({
  merchantOrderId,
  amountPaise: totals.amountPaise,
  redirectUrl,
  phoneNumber,
  metaInfo,
});
```

Bad:

```js
await createPhonePePayment({
  merchantOrderId: req.body.orderId,
  amountPaise: req.body.amount,
});
```

Good webhook forwarding:

```js
await forwardMakeWebhookPayload({
  event_name: "checkout.payment_completed",
  idempotency_key: `${merchantOrderId}:COMPLETED`,
  merchant_order_id: merchantOrderId,
  payment_state: "COMPLETED",
});
```

Bad webhook forwarding:

```js
await fetch(process.env.MAKE_WEBHOOK_URL, {
  method: "POST",
  body: JSON.stringify(status),
});
```

## Environment Variables

Required production variables:

```text
PHONEPE_CLIENT_ID
PHONEPE_CLIENT_SECRET
PHONEPE_CLIENT_VERSION
PHONEPE_ENV
PHONEPE_WEBHOOK_USERNAME
PHONEPE_WEBHOOK_PASSWORD
BASE_URL
MAKE_WEBHOOK_URL
```

Rules:

- Read env through `getEnv` or `requireEnv`.
- Never commit `.env`, `.env.*`, `.npmrc`, credentials, or API keys.
- Validate required env at startup or before first provider call.
- Keep public analytics IDs documented if they remain hardcoded in HTML.
- Prefer deployment environment variables over local `.env` in production.

Good:

```js
const webhookUrl = getEnv("MAKE_WEBHOOK_URL");
if (!webhookUrl) return { sent: false };
```

Bad:

```js
const webhookUrl = "https://hook.eu2.make.com/private-value";
```

## Tracking And Analytics

- Keep tracking payload fields stable for Make and Google Sheets.
- Every event payload should include `event_name`, `event_timestamp`, `sheet_name`, and payment identifiers when available.
- Normalize browser-provided tracking before forwarding it.
- Duplicate UTM values into top-level sheet-friendly columns.
- Do not collect more PII than checkout operations require.
- Load Meta Pixel and Microsoft Clarity from route-owned React effects, not inline HTML snippets or the global app entry.
- Pixel funnel events must use deduplication IDs. Payment event IDs must be derived from event name and merchant order ID without sending the raw merchant order ID as an event parameter.
- Do not send raw name, email, phone, address, UPI, card, or payment credential fields to Pixel or Clarity custom events.
- Fire Meta `Purchase` only after a verified `COMPLETED` PhonePe status response and use the verified amount in paise converted to INR rupees.
- Keep Clarity tags low-risk: route, funnel step, payment state, and currency.
- Mask checkout contact fields from Clarity recording.
- If consent management is added later, analytics initialization and funnel events must be gated by the accepted consent category before scripts load.
- Add idempotency keys for repeated status checks and webhooks.
- Add tests when adding or changing payload fields.

Good:

```js
return {
  event_name: "checkout.payment_initiated",
  event_timestamp: timestamp,
  sheet_name: "payment_initiated",
  merchant_order_id: merchantOrderId,
  ...buildTrackingFields({ req, tracking }),
};
```

Bad:

```js
return {
  event: "paid",
  data: req.body,
};
```

## Testing Standards

- Use `node:test` and `node:assert/strict` for existing JS modules.
- Test pure logic directly; do not mock what can be tested with plain inputs.
- Add tests before modifying checkout calculation, payment payload, tracking, routing, or environment behavior.
- Use isolated in-memory fakes for storage, requests, responses, and fetch.
- Keep unit tests deterministic. Do not call real PhonePe, Make, or remote image URLs in tests.
- Maintain at least 80% coverage on core modules.

Good:

```js
test("rejects unknown checkout bump ids", () => {
  const errors = getCheckoutValidationErrors({
    details: { name: "Harsh", email: "h@example.com", phone: "9876543210" },
    selected: ["unknown"],
  });

  assert.equal(errors.selected, "Please refresh and try again.");
});
```

Bad:

```js
test("works", async () => {
  await fetch("https://api.phonepe.com/real-endpoint");
});
```

## Production Readiness Checklist

Before release, confirm:

- `npm test` passes.
- `npm run build` passes.
- `node --test --experimental-test-coverage` shows at least 80% coverage for core modules.
- `npm audit --omit=dev --audit-level=moderate` has no unresolved high-risk issue.
- No `.env`, secrets, webhook URLs, API keys, or credentials are staged.
- PhonePe sandbox and production modes are configured intentionally.
- Webhook verification credentials are configured in production.
- Payment status events are idempotent.
- Make webhook failures are logged or retried.
- Request body limits exist on API routes.
- Checkout amounts are server-calculated.
- Legal links work on deployed routes.
- Analytics scripts load asynchronously and do not block checkout.
- `artifacts/AttractiveMen.html` is regenerated after source changes that affect the standalone page.
- Mobile checkout and landing page have been visually checked.
- Vercel routes in `vercel.json` match public URLs.

## Dependency Management

- Keep runtime dependencies minimal.
- Build-only tools such as Vite and Vite plugins belong in `devDependencies`.
- Use `package-lock.json` for reproducible installs.
- Review `npm audit` output before releases.
- Do not run `npm audit fix --force` without reviewing breaking changes.

Good:

```json
{
  "dependencies": {
    "@fontsource/inter": "^5.2.8",
    "@phosphor-icons/react": "^2.1.10",
    "react": "19.2.0",
    "react-dom": "19.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "5.0.4",
    "vite": "6.4.3"
  }
}
```

Bad:

```json
{
  "dependencies": {
    "vite": "6.4.2",
    "large-unused-package": "latest"
  }
}
```

## Git And Change Safety

- Do not force-push `main`.
- Do not bypass hooks with `--no-verify`.
- Do not revert unrelated local changes.
- Keep generated artifacts intentional. If `artifacts/AttractiveMen.html` changes, explain why.
- Do not commit `dist/`, `node_modules/`, `.vercel/`, `.env`, local screenshots, or temporary exports.
- Keep commit messages direct and behavior-focused.

## When Something Feels Risky

Ask before:

- Deleting files or assets.
- Changing production payment behavior.
- Changing PhonePe credentials, webhook verification, or Make routing.
- Replacing large chunks of landing-page copy.
- Reorganizing the app structure.

Otherwise, make the smallest correct change, run the required checks, and report the result.
