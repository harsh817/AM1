# Production Ready Checklist

Last updated: 2026-09-10

Scope: AttractiveMen landing pages, cart/offer state, checkout, PhonePe payment routes, thank-you page, Make tracking, Vercel deployment, and support operations.

Use this before every release that affects:

- /a-m
- /a-m-checkout
- /a-m-thankyou
- /api/phonepe/create-order
- /api/phonepe/status
- /api/phonepe/webhook

## How To Use This Checklist

- Every P0 item must be complete before production traffic.
- P1 items should be complete before scaling ads or running high-volume campaigns.
- P2 items improve operations, reporting, and long-term maintainability.
- Add evidence next to each item: PR, commit, test output, Vercel URL, screenshot, dashboard setting, or support SOP.

Status legend:

- [ ] Not checked
- [x] Verified
- [~] Partially verified
- [n/a] Not applicable

## Release Signoff

| Field | Value |
| --- | --- |
| Release date | 2026-09-10 |
| Owner | Pending owner signoff |
| Git commit | Pending direct thank-you Pixel fallback push |
| Vercel deployment URL | Pending Vercel deployment after current push |
| Production URL tested | https://thriveonp.com/a-m, /a-m-checkout, /a-m-thankyou |
| PhonePe mode | Owner reports real success and failure were already tested; capture final evidence before launch signoff |
| Make scenario tested | Not verified in Make dashboard during this run |
| Rollback deployment | AM1 previous: https://am1-lhd03zro5-harsh817s-projects.vercel.app; wrapper previous: https://pg-thriveonp-go2ksxkt2-harsh817s-projects.vercel.app |

## P0 Go/No-Go Gates

- [x] Local test suite passes. Evidence: `npm test` passed, 94/94 tests after the direct thank-you Pixel fallback change.
- [x] Production build passes. Evidence: `npm run build` passed after the direct thank-you Pixel fallback change.
- [~] Production Vercel deployment is Ready. Evidence: previous AM1 production deployment was Ready; current direct thank-you Pixel fallback needs a new Vercel deployment after this push.
- [x] Public routes return successful responses: /a-m, /a-m-checkout, /a-m-thankyou. Evidence: required production routes returned 200; `/am/temp` was removed from required AM1 routes.
- [x] Root domain and www DNS point to Vercel correctly. Evidence: root A record resolves to `76.76.21.21`; www CNAME resolves to `cname.vercel-dns.com`.
- [~] Required Vercel environment variables exist for production. Evidence: PhonePe core variables, `BASE_URL`, and `MAKE_WEBHOOK_URL` exist; webhook auth variables still need to match the selected PhonePe webhook authentication method.
- [x] No env files, API keys, webhook URLs, credentials, or private tokens are committed. Evidence: `.env` is gitignored, only `.env.example` is tracked, and tracked-source secret scan outside generated artifacts returned no hits.
- [x] Checkout amount is calculated on the server, not trusted from the browser. Evidence: `api/_lib/payment/create-order-service.js` calculates totals from `src/lib/checkout-config.js`, and tests cover trusted server totals.
- [~] PhonePe production credentials are intentionally selected when taking live payments. Evidence: `PHONEPE_ENV` exists in Vercel production and owner reports real success/failure tests were already done; screenshot/log evidence still needs to be attached.
- [~] PhonePe webhook credentials are configured and verified. Evidence: current code supports SHA webhook verification through `PHONEPE_WEBHOOK_USERNAME` and `PHONEPE_WEBHOOK_PASSWORD`; if PhonePe dashboard uses HMAC/API-key-style verification, update the code and env naming to match that method.
- [x] Webhook/event payload contract is documented and tested. Evidence: Make/PhonePe payload sections are documented below, and webhook/status/lead payload tests passed.
- [ ] Duplicate payment completion/failure events cannot create duplicate operational records. Missing: there is no durable idempotency store or duplicate-event guard; repeated final status checks or repeated verified webhooks can forward again.
- [~] Meta Pixel and Microsoft Clarity IDs are verified for the correct business/project accounts. Evidence: IDs are present in `index.html`; account ownership/correct business was not verified in Meta or Clarity dashboards.
- [~] Pixel and Clarity events are verified on production URLs, not only local preview. Evidence: scripts and CSP are present on production HTML, and the direct thank-you Pixel fallback plus verified Purchase rule are covered by local tests; browser-network or dashboard verification still needs to be captured after deployment.
- [~] Payment success, failure, and pending states are tested end to end. Evidence: owner reports real success and failure were tested; thank-you now retries pending status before final pending copy; pending-state dashboard evidence and reproducible proof were not captured in this run.
- [~] Make/CRM receives payment initiated, payment completed, payment failed, and PhonePe webhook payloads. Evidence: code/tests cover forwarding and `MAKE_WEBHOOK_URL` exists; actual Make/CRM receipt was not verified in the dashboard.
- [~] Legal links work from landing, checkout, and thank-you pages. Evidence: thank-you legal links are now added and local tests pass; production verification needs redeploy.
- [x] Mobile checkout has been tested on a real phone or device emulation. Evidence: Playwright MCP using installed Edge channel verified 390x844 mobile checkout and thank-you routes locally.
- [x] Rollback plan is known before launch. Evidence: previous Ready deployments are listed in Release Signoff.
- [~] Additional API gate: malformed JSON to `POST /api/phonepe/create-order` should return 400. Evidence: fixed locally and covered by tests; production needs redeploy.

## Project Structure And File Ownership

- [ ] Page-level files stay in the pages folder and do not accumulate unrelated helper logic.
- [ ] Shared browser helpers stay in the browser/shared library folder.
- [ ] Server-only helpers stay in the server utility folder.
- [ ] Thin Vercel route handlers stay in the PhonePe API routes folder.
- [ ] Payment business logic stays in the payment service layer.
- [ ] Content and offer copy stay in the copy document or landing data file, not scattered through CSS or API files.
- [ ] Pricing, GST, and bump config stay in one checkout config file.
- [ ] Generated standalone output stays in the artifacts folder and is regenerated intentionally.
- [ ] New landing sections become small section components before the landing page file becomes hard to review.
- [ ] New checkout widgets become small checkout components before the checkout page file becomes hard to review.
- [ ] Tests sit near the logic they protect with the project test naming convention.
- [ ] Public URLs are added in both the Vercel route config and the app route matcher, with route tests.

Target ownership example for the next refactor:

- Landing components: hero, trust badges, section heading, sticky buy bar.
- Checkout components: contact fields, order summary, payment button.
- Shared components: reusable buttons, script loaders, small UI primitives.
- Shared browser logic: analytics, checkout config, checkout tracking, landing data, phone normalization.
- Page files: only compose screens and pass data into components.
- Server files: route handlers stay thin, service files own payment and webhook decisions.

Examples:

- Good example: checkout totals are calculated by one shared pricing helper and reused by checkout UI and payment creation.
- Bad example: checkout totals are read from browser storage or copied manually into multiple files.
- Good example: a new landing section is extracted when it becomes a repeated or independently testable unit.
- Bad example: one page file keeps growing with unrelated timers, checkout logic, analytics calls, and payment code.

## Programming Practices

- [x] Use descriptive names for variables, functions, and components. Evidence: checkout, route, payment, tracking, and webhook modules use domain-specific names.
- [x] Keep route files thin: validate method, parse input, call service, return JSON. Evidence: PhonePe route handlers delegate payment/status/webhook logic to service helpers.
- [x] Keep pure logic in helpers that can be tested without a browser. Evidence: checkout totals, route matching, tracking payloads, PhonePe payloads, and webhook verification have unit tests.
- [x] Avoid direct state mutation in React. Evidence: React state updates use setters and functional updates; no direct mutation of React state was found.
- [x] Use lazy initialization for browser storage reads. Evidence: checkout draft loading now uses lazy `useState(loadDraft)` initialization.
- [x] Clean up timers, event listeners, observers, and intervals in React effects. Evidence: sticky timer/listener/body-class effects clean up; checkout/thank-you async effects use cancellation guards.
- [x] Avoid one-off abstractions. Extract only when it reduces real duplication or risk. Evidence: landing page sections were split into focused page modules; shared components remain limited to repeated button, video, and heading behavior.
- [x] Avoid magic numbers for prices, timeouts, body limits, and route names. Evidence: prices, GST, body limit, route names, PhonePe expiry, Make timeout, merchant ID length, and payload field limits are named constants.
- [x] Add JSDoc to complex public helper functions while the project remains JavaScript. Evidence: checkout totals, payment creation, status/webhook services, payload builders, Make forwarding, and checkout tracking helpers now document inputs, outputs, and side effects.
- [x] Do not read browser globals in module scope unless the code is browser-only. Evidence: browser globals are used inside browser-only entry/page code or injectable helper context.
- [x] Do not add dependencies unless they remove meaningful complexity. Evidence: no new dependency was added for the latest fixes.
- [x] Do not mix generated files, artifacts, source files, and deployment config in one commit unless the release needs all of them. Evidence: current changes are source/tests/config/checklist only; generated build output and artifacts are not changed.
- [x] Add tests before changing checkout totals, route matching, payment payloads, tracking fields, or webhook logic. Evidence: tests were added before the route/legal/API behavior fixes and pass.
- [x] Additional project-standard gap: source and test files should stay near the ~300-line budget. Evidence: landing sections, landing stylesheet chunks, and landing stylesheet tests were split; `CheckoutPage.jsx` is within the project line-count target.

Examples:

- Good example: payment request timeout is named, documented, and tested.
- Bad example: a random timeout number is buried inside a payment request.
- Good example: payment creation receives server-calculated totals.
- Bad example: payment creation forwards the entire browser payload to the provider.
- Good example: route handlers validate the method and input, then delegate to a service.
- Bad example: route handlers parse, validate, calculate, call providers, build webhooks, and format responses in one long file.

## Landing Page

- [ ] Offer, headline, CTA, price, delivery promise, and bonuses match the approved copy document.
- [ ] All CTAs point to the correct checkout path: /a-m-checkout.
- [ ] Sticky buy bar appears after hero scroll and does not hide page content.
- [ ] Price is consistent across hero, sticky bar, final offer, checkout, and legal copy.
- [ ] "Today's Price" or urgency copy is accurate and not misleading.
- [ ] Testimonials, ratings, client counts, and delivery claims are factual.
- [ ] Before/after images have permission to be used.
- [ ] Images use meaningful alternative text where they communicate content.
- [ ] Decorative images/icons are hidden from assistive technology.
- [ ] All links are keyboard reachable and visibly focusable.
- [ ] No section has overlapping text on mobile.
- [ ] No horizontal scroll on common mobile widths: 320, 360, 390, 430.
- [ ] Page can be skimmed: headings, bold emphasis, and CTA hierarchy are clear.
- [ ] Legal/disclaimer language is visible enough for purchase decisions.

## Design System

- [ ] Page uses the approved palette and tokens from the design system document.
- [ ] Section headings follow the shared heading/backdrop rules.
- [ ] Body text follows the shared section text rules.
- [ ] CTA styling is consistent across landing, sticky bar, final offer, and checkout.
- [ ] Cards/subsections use consistent padding, radius, gap, and color rules.
- [ ] Desktop and mobile type scales are defined, not improvised per section.
- [ ] CSS avoids one-off hardcoded colors when a token exists.
- [ ] Motion is subtle and respects reduced-motion user preferences.
- [ ] Font weight is used intentionally for scanning, not randomly.

## Frontend Optimization

- [x] Critical hero content is visible without waiting on analytics scripts. Evidence: the HTML Pixel fallback exits immediately unless the path is `/a-m-thankyou`; landing and checkout analytics still initialize from route-owned React effects, and external scripts load asynchronously.
- [x] Meta Pixel and Clarity scripts load asynchronously and never block React rendering. Evidence: `src/lib/analytics.js` inserts both third-party scripts with async loading after mount and guards duplicate initialization.
- [x] Above-the-fold images are compressed, dimensioned, and intentionally eager/lazy. Evidence: the hero image uses Cloudinary `f_auto,q_auto,c_limit,w_900`, `loading="eager"`, `fetchPriority="high"`, `decoding="async"`, and explicit width/height.
- [x] Below-the-fold images use lazy loading. Evidence: landing image source tests verify all production image tags have loading, decoding, width, and height, with only the hero image eager-loaded.
- [x] Repeated icons come from the approved icon library, not copied inline everywhere. Evidence: source uses `@phosphor-icons/react`; no inline SVG elements were found in `src`.
- [x] Long lists are data-driven from the landing data file where practical. Evidence: trust badges, transformation personas, StyleIQ pillars, comparison rows, report contents, bonuses, process steps, recap items, testimonials, and FAQs live in `src/lib/landing-data.js`.
- [x] Heavy visual experiments live in artifacts before being moved into production source. Evidence: design palette, heading backdrop, sticky-buy, and style-direction previews exist under `artifacts/`.
- [x] CSS uses shared tokens for spacing, width, radius, transitions, and color. Evidence: landing CSS imports shared token chunks and tests verify palette, type, spacing, and motion tokens.
- [~] No section-level CSS creates layout shift on hover, timer updates, or sticky bar visibility. Evidence: source tests verify stable image ratios and sticky timer width with tabular numbers; missing: no automated browser CLS/layout-shift measurement exists yet.
- [n/a] Bundle size is reviewed after adding libraries. Evidence: no new dependency was added in this audit.
- [x] Production build output is checked for unexpected asset or CSS growth. Evidence: `npm run build` passed and `npm run check:bundle` passed with JS 60.65 kB gzip / 100 kB budget and CSS 12.88 kB gzip / 25 kB budget.

Examples:

- Good example: product images are local, compressed, dimensioned, and lazy-loaded below the fold.
- Bad example: large remote images are dropped into production without dimensions, compression, or ownership.
- Good example: analytics scripts load after critical page content can render.
- Bad example: third-party scripts block the hero and delay the first visible content.

## Cart And Offer Logic

- [x] Product price lives in one shared config. Evidence: `BASE_PRICE` is exported from `src/lib/checkout-config.js` and used by both checkout UI and server total calculation.
- [x] GST rate lives in one shared config. Evidence: `GST_RATE` is exported from `src/lib/checkout-config.js` and used by both checkout UI and server total calculation.
- [x] Optional bump IDs and prices live in one shared config. Evidence: `CHECKOUT_BUMPS` is exported from `src/lib/checkout-config.js`; UI only adds icons/descriptions on top of that config.
- [x] Unknown bump IDs are rejected by server validation. Evidence: `getCheckoutValidationErrors` rejects any selected id that is not in `CHECKOUT_BUMPS`; tests cover unknown ids.
- [x] Duplicate bump selections are deduplicated server-side. Evidence: `calculateCheckoutTotals` uses `new Set(selected)` before summing; tests cover duplicate `style-consultation` selection.
- [x] Browser-selected items are treated as intent only, not source of truth. Evidence: the browser posts selected ids only; `createCheckoutPaymentOrder` calculates `amountPaise` from server-owned totals before creating the PhonePe order.
- [x] Checkout totals display subtotal, GST, and total payable clearly. Evidence: checkout shows each pre-tax item price, GST, and total payable; the explicit subtotal label is intentionally omitted because the itemized price rows already create the subtotal context.
- [n/a] Total payable shown in the button matches the server-created order amount. Evidence: the payment button intentionally no longer shows an amount, so there is no button amount to reconcile.
- [x] Checkout draft storage does not contain sensitive payment data. Evidence: draft storage contains contact fields and selected add-on ids only; no card, UPI, PhonePe credential, token, or payment amount is stored.
- [n/a] If quantity, coupons, bundles, or multiple products are added later, pricing moves to a real cart/order model. Evidence: current checkout has one product and optional add-ons only; no quantity, coupon, bundle, or multi-product flow exists.

Examples:

- Good example: the server receives selected item IDs and calculates the payable amount itself.
- Bad example: the browser sends the payable amount and the server trusts it.
- Good example: unknown or duplicate order bump IDs are rejected or deduplicated server-side.
- Bad example: checkout accepts any item ID or price sent by the browser.

## Checkout UX

- [x] Name, email, and phone validation works before payment starts. Evidence: `handleSubmit` calls `validate()` before creating the PhonePe order; server validation also rejects invalid contact details before provider calls.
- [x] Validation errors are specific and appear near the field. Evidence: name, email, and phone each have field-specific messages rendered inside their own `checkout-field` labels.
- [x] Mobile keyboard types are correct: email, tel, numeric. Evidence: email input uses `type="email"`; WhatsApp input uses `type="tel"` and `inputMode="numeric"`.
- [x] Checkout button has loading and disabled states. Evidence: submit sets `isPaying`, changes button copy to `Opening secure payment...`, sets `aria-busy`, and disables the button.
- [~] Double-clicking the pay button cannot create accidental duplicate orders. Evidence: the button is disabled after submit and shows a loading state; missing: no synchronous in-handler lock/ref prevents two very fast submit events before React applies the disabled state.
- [x] Payment failure returns user to a clear retry state. Evidence: failed status sets clear retry copy on checkout and thank-you pages, and thank-you shows a retry checkout CTA.
- [x] Pending payment state tells the user what to do next. Evidence: thank-you retries pending status for up to 20 attempts at 3-second intervals, then tells the user to wait and refresh if money was deducted.
- [x] Thank-you page confirms the order and explains next steps. Evidence: completed payments show confirmation copy, merchant order ID, and next steps for assessment, stylist review, and 48-hour report delivery.
- [x] User can recover if they close the PhonePe tab and return with the merchant order ID. Evidence: `/a-m-thankyou?merchantOrderId=...` reads the query value and checks `/api/phonepe/status`; checkout also checks status when a merchant order ID is present.
- [x] Checkout works after refresh with saved draft data. Evidence: checkout draft loads through lazy `useState(loadDraft)` and persists contact details plus selected add-on ids in localStorage.
- [x] Checkout does not store card/UPI/payment credentials. Evidence: localStorage draft stores only `{ details, selected }`; no card, UPI, PhonePe token, provider credential, or payment credential is stored.
- [x] Privacy Policy and Terms are reachable before payment. Evidence: checkout footer links to `/privacy` and `/terms` before the payment button flow redirects to PhonePe.

## Order Ledger

For a proper cart platform, a durable order ledger is required. Make/Sheets is useful for operations, but it should not be the only record of paid orders once traffic increases.

- [~] Order is created server-side before redirecting to PhonePe. Evidence: `createCheckoutPaymentOrder` creates the PhonePe order server-side and returns the redirect URL; missing: no durable internal order row is created before redirect.
- [ ] Order record stores merchant order ID, selected items, amount, customer contact, status, and timestamps. Missing: these fields are sent to Make/Sheets payloads, but there is no first-party durable order record or database table.
- [ ] Order status transitions are controlled: created, payment initiated, paid, failed, pending, refunded, delivered. Missing: status is derived from PhonePe responses and sheet routing only; no controlled order state machine exists.
- [~] PhonePe order ID is stored when available. Evidence: PhonePe order ID is returned to the browser response and included in Make payloads; missing: it is not persisted in a durable internal order record.
- [ ] Every payment event has an idempotency key. Missing: payment initiation, status, and webhook payload builders do not include an idempotency key.
- [ ] Retried status checks do not create duplicate completed/failed rows. Missing: `checkPaymentOrderStatus` forwards every final `COMPLETED` or `FAILED` status check to Make again because there is no idempotency store.
- [ ] Webhook and browser return status reconcile into the same order record. Missing: PhonePe webhook and browser return status checks are forwarded as separate events; no shared order record exists to reconcile them.
- [~] Support can search by email, phone, merchant order ID, and PhonePe order ID. Evidence: Make payloads include these fields for sheet search when delivery succeeds; missing: no first-party support/admin lookup exists.
- [ ] Order data has a retention policy. Missing: no documented order ledger retention/deletion policy exists because the durable ledger does not exist yet.

Examples:

- Good example: one completed payment can create only one completed operational record, even after refreshes or repeated webhooks.
- Bad example: every thank-you page refresh adds another completed row to the sheet.
- Good example: support can search an order by email, phone, merchant order ID, or PhonePe order ID.
- Bad example: the only proof of payment is a row in a spreadsheet with no reliable order state.

## PhonePe Payment Integration

- [~] PhonePe environment is intentionally set to production only for live launch. Evidence: endpoint selection now fails closed unless `PHONEPE_ENV` is `sandbox` or `production`; missing: current production Vercel value was not verified in this audit.
- [~] Production and sandbox credentials are never mixed. Evidence: credentials are read only from env, no credentials are committed, invalid environments fail closed, and the access-token cache is scoped by environment and client id; missing: PhonePe/Vercel dashboard evidence that production credential values are paired only with `PHONEPE_ENV=production`.
- [x] Access token request uses server-side credentials only. Evidence: token exchange lives in `api/_lib/phonepe.js` and reads `PHONEPE_CLIENT_ID`, `PHONEPE_CLIENT_VERSION`, and `PHONEPE_CLIENT_SECRET` through server env helpers.
- [x] PhonePe payment request uses a server-generated merchant order ID. Evidence: `createCheckoutPaymentOrder` defaults to `createMerchantOrderId()` before calling PhonePe; browser payload does not provide the order id.
- [~] Redirect URL uses the production base URL. Evidence: when `PHONEPE_ENV=production`, source now requires `BASE_URL` to be exactly `https://thriveonp.com` and validates the PhonePe redirect origin; missing: current production Vercel `BASE_URL` value was not verified in this audit.
- [x] Payment amount is sent in paise and matches server total. Evidence: `calculateCheckoutTotals` returns `amountPaise`, and `createCheckoutPaymentOrder` sends that exact value to PhonePe.
- [x] Payment expiry is intentional and documented. Evidence: `PHONEPE_ORDER_EXPIRY_SECONDS` is a named constant set to `20 * 60` and used as PhonePe `expireAfter`.
- [x] PhonePe response is validated before redirecting user. Evidence: PhonePe payment creation rejects non-OK responses and responses without `redirectUrl`; checkout also refuses to redirect without a returned `redirectUrl`.
- [x] PhonePe status API is used for return-page reconciliation. Evidence: `/a-m-thankyou?merchantOrderId=...` and checkout return handling call `/api/phonepe/status`, which delegates to `getPhonePeOrderStatus`.
- [x] PhonePe provider errors are sanitized before returning to browser. Evidence: create-order and status `502` responses now return controlled generic messages, while malformed JSON, validation, webhook verification, and unknown webhook failures still use controlled messages.
- [x] External PhonePe calls have timeouts. Evidence: PhonePe auth, payment creation, and status calls use the shared `fetchPhonePe` helper with `PHONEPE_REQUEST_TIMEOUT_MS = 10000` and `AbortController`.
- [x] Logs include order IDs and state, not secrets or full PII. Evidence: payment create, status, and webhook flows now emit structured JSON logs through a whitelist-only logger; tests verify PII, secrets, raw request bodies, and provider messages are excluded.

## Webhooks And Reconciliation

- [~] PhonePe webhook route is configured in the PhonePe dashboard. Evidence: source exposes `/api/phonepe/webhook` and route tests cover the handler; missing: PhonePe dashboard screenshot or live webhook delivery evidence.
- [~] Webhook username/password match production PhonePe dashboard credentials. Evidence: code reads `PHONEPE_WEBHOOK_USERNAME` and `PHONEPE_WEBHOOK_PASSWORD` from env and verifies SHA authorization; missing: production PhonePe dashboard credential comparison.
- [x] Webhook verification happens before business processing. Evidence: `handlePhonePeWebhook` verifies authorization before parsing payload, building Make payloads, or forwarding events.
- [x] Raw body parsing preserves the data needed for verification. Evidence: webhook route reads the body as a raw string with `readBody` and passes it into the webhook service; current verification uses the authorization header plus configured webhook credentials before payload processing.
- [x] Invalid webhook authorization returns an unauthorized response. Evidence: invalid webhook auth returns 401 and is covered by route tests.
- [x] Invalid webhook payload returns a bad request response. Evidence: verified auth with malformed JSON returns 400 and is covered by route tests.
- [~] Valid webhook returns a successful response quickly. Evidence: valid webhook returns 200 after verification, payload normalization, and Make forwarding; Make forwarding has a short timeout, but processing is not yet queued/asynchronous.
- [ ] Webhook processing is idempotent. Missing: there is no durable idempotency key/store, so repeated valid webhooks can forward duplicate operational events.
- [x] Final payment state is taken from verified webhook or verified status API response. Evidence: webhook state is processed only after authorization verification, and browser return reconciliation calls the PhonePe status API before building final-state payloads.
- [ ] Failed Make delivery does not lose the order state. Missing: no durable internal order ledger exists; if Make delivery fails, the final state is only available from logs/PhonePe and is not persisted first-party.
- [ ] Manual reconciliation process exists for PhonePe dashboard vs internal orders. Missing: no documented support/admin reconciliation procedure or searchable internal order ledger exists.

## Webhook Data Contract And Accuracy

Use this flow as the production truth model:

- Landing page records campaign and session context.
- Checkout visit stores a sanitized tracking snapshot.
- Checkout form submit sends contact details and selected item IDs to the server.
- Server creates the PhonePe order with trusted totals.
- Make receives the payment initiated event.
- Customer completes or exits PhonePe checkout.
- Thank-you/status check and PhonePe webhook both report payment state.
- Final order state is reconciled once.
- Make/CRM receives completed or failed payment outcome once.

- [~] Every outbound operational event has a documented schema. Evidence: payload builders and tests document the current initiated, status, and PhonePe webhook field shapes; missing: no dedicated versioned schema document/table exists for operations.
- [x] Every schema has tests for required fields and field names. Evidence: `lead-webhook.test.js`, `payment-status-webhook.test.js`, and `phonepe-webhook-payload.test.js` assert required operational fields and sheet-facing names.
- [x] Event names are stable: checkout payment initiated, checkout payment completed, checkout payment failed, PhonePe webhook. Evidence: payload tests assert `checkout.payment_initiated`, `checkout.payment_completed`, `checkout.payment_failed`, and `phonepe.webhook`.
- [x] Sheet names are stable: payment initiated, payment completed, payment failed, PhonePe webhook. Evidence: payload tests assert `payment_initiated`, `payment_completed`, `payment_failed`, and `phonepe_webhook`.
- [~] Every event includes event name, event timestamp, sheet name, and schema version. Evidence: every current payload includes `event_name`, `event_timestamp`, and `sheet_name`; missing: no `schema_version` field is emitted.
- [x] Every payment event includes merchant order ID, PhonePe order ID, payment state, and amount fields. Evidence: initiated, status, and raw webhook payload builders emit `merchant_order_id`, `phonepe_order_id`, `payment_state`, `amount_paise`, `payable_amount_paise`, and `fee_amount_paise` fields.
- [~] Amount fields clearly state units: rupees vs paise. Evidence: PhonePe/payment amount fields use `_paise` suffixes and checkout pricing carries `currency: INR`; missing: rupee checkout pricing fields such as `base_price`, `gst`, and `total` do not explicitly include a rupee/unit suffix.
- [x] Marketing fields are preserved: UTM source, UTM medium, UTM campaign, UTM content, UTM term, UTM ID, referrer. Evidence: checkout tracking and webhook payload tests cover UTM/referrer preservation through initiated and status-check payloads.
- [x] Device/location/engagement fields are sanitized and size-limited before forwarding. Evidence: `buildTrackingFields` normalizes device, location, marketing, and engagement fields with shared length limits before payload builders forward them.
- [x] Browser tracking snapshots are tied to the merchant order ID. Evidence: checkout stores tracking with `rememberCheckoutOrderTracking(data.merchantOrderId, tracking)` and thank-you/status checks retrieve it with `getCheckoutOrderTrackingPayload(merchantOrderId)`; tests cover storage and retrieval by order id.
- [ ] Final payment state is recorded once even if both browser status and webhook arrive. Missing: no durable idempotency store exists, so repeated final status checks or repeated verified webhooks can create duplicate Make/Sheets rows.
- [~] Webhook data and status API data are reconciled using the same merchant order ID. Evidence: both raw webhook and status payload builders normalize `merchant_order_id`; missing: there is no shared order record that reconciles webhook and browser-return status into one final state.
- [ ] Make/Sheets failures are visible to operations and do not silently erase paid orders. Missing: final payment state is forwarded directly to Make/Sheets without first persisting to a durable first-party order ledger or retry queue.
- [~] Payloads never include PhonePe secrets, webhook credentials, or unnecessary customer PII. Evidence: payload builders do not read or send PhonePe credentials or webhook secrets; missing: raw `phonepe.status` and `phonepe.webhook` provider payloads are still forwarded and need a minimization review before scale.

Examples:

- Good example: completed payment events use a stable schema version, stable event name, stable sheet name, merchant order ID, and amount fields with clear units.
- Bad example: completed payment events forward the raw request body with vague field names.
- Good example: marketing fields retain first-touch UTM values through initiated, completed, and failed events.
- Bad example: completed payment events lose campaign attribution because the browser tracking snapshot was not tied to the order.

## Make And Operations Tracking

- [x] Make webhook URL is configured in Vercel production environment variables. Evidence: `vercel env ls production` shows encrypted `MAKE_WEBHOOK_URL` on the `am1` production project.
- [ ] Make scenario is active before launch. Missing: Make dashboard/scenario status was not verified.
- [x] Every payload includes event name, event timestamp, and sheet name. Evidence: initiated, status, and PhonePe webhook payload builders emit `event_name`, `event_timestamp`, and `sheet_name`; payload tests assert these fields.
- [ ] Every payload includes a schema version before campaign scale. Missing: outbound Make payloads do not currently include `schema_version`.
- [ ] Make scenario rejects or flags unknown event names instead of silently accepting malformed data. Missing: no Make scenario/router validation evidence or unknown-event rejection test exists.
- [x] Payment payloads include merchant order ID, PhonePe order ID, amount, status, error code, and error message when available. Evidence: payload builders emit order IDs, payment state, `_paise` amount fields, and error fields; tests cover failed and completed payloads.
- [~] UTM and referrer fields are stable across initiated/completed/failed events. Evidence: checkout tracking preserves first-touch UTM/referrer and ties snapshots to merchant order IDs for status checks; missing: raw PhonePe webhook events cannot restore browser attribution without an internal order ledger.
- [~] Meta, Google, and other ad click IDs are captured if the ad channel requires attribution. Evidence: `utm_id` is captured and preserved; missing: dedicated click-id fields such as `fbclid`, `gclid`, `msclkid`, or channel-specific IDs are not captured.
- [x] Failed payment events preserve failure reason, error code, and gateway state when available. Evidence: status/webhook payload builders include `payment_state`, `error_code`, `error_message`, `error.context`, and raw provider status/webhook context.
- [~] Completed payment events preserve payable amount and fee/tax fields when available. Evidence: completed status/webhook payloads preserve `payable_amount_paise` and `fee_amount_paise` when provided by PhonePe; missing: completed final-state payloads do not include an explicit GST/tax field reconstructed from checkout totals.
- [~] Payload timestamps use ISO strings and the dashboard knows the reporting timezone. Evidence: payload builders use `new Date().toISOString()` / ISO timestamps; missing: Make/Sheet reporting timezone was not verified in the dashboard.
- [ ] Make failure is logged or visible enough for operations. Missing: `forwardMakeWebhookPayload` returns `{ sent: false }` on failure, but payment services do not persist, retry, or surface Make delivery failures to operations.
- [ ] Make retries or fallback queue exist before scaling campaigns. Missing: no retry queue, dead-letter queue, or durable fallback event store exists.
- [~] Google Sheet tabs/columns match payload schema. Evidence: code emits stable `sheet_name` values and tests assert sheet-facing field names; missing: actual Google Sheet tab/column setup was not verified.
- [~] No payload sends unnecessary PII. Evidence: payload builders do not send PhonePe secrets or webhook credentials; missing: raw `phonepe.status` and `phonepe.webhook` provider payloads are forwarded and may duplicate customer PII from metadata.

## Meta Pixel And Clarity

Current IDs found in the main HTML entries:

- Meta Pixel: 2647411082380065
- Microsoft Clarity: xx2rulxltt

Required event plan:

| Funnel step | Meta Pixel | Clarity |
| --- | --- | --- |
| Page load | PageView | default page/session capture |
| Landing page viewed | ViewContent or custom LandingView | landing view event |
| Checkout page opened | InitiateCheckout | checkout view event |
| Pay button clicked | PaymentStarted or standard checkout event with value/currency | payment started event |
| Payment completed | Purchase only after verified completed status | payment completed event |
| Payment failed | PaymentFailed | payment failed event |

- [x] Pixel base setup exists once per HTML entry and fires exactly one page view per page load. Evidence: `index.html` and `checkout.html` include a route-gated direct Meta `PageView` fallback only for `/a-m-thankyou`; `src/lib/analytics.js` loads route-owned analytics, guards duplicate Pixel initialization, and guards duplicate Meta `PageView` calls.
- [~] Pixel ID belongs to the correct Meta Business account. Evidence: Pixel ID `2647411082380065` is present in source and production HTML fallback. Missing: ownership was not verified in Meta Events Manager.
- [~] Clarity project ID belongs to the correct Microsoft Clarity project. Evidence: Clarity project ID `xx2rulxltt` is present in source. Missing: ownership was not verified in the Microsoft Clarity dashboard.
- [x] Pixel and Clarity are present only where intended by route. Evidence: landing and checkout own their analytics effects; thank-you has an intentional Meta-only HTML `PageView` fallback for URL custom conversion and initializes full analytics after verified payment status; global `main.jsx` and legal routes do not initialize analytics.
- [x] Purchase is not fired on simple thank-you page load unless payment status is verified as completed. Evidence: thank-you waits for `/api/phonepe/status`; only `COMPLETED` calls `trackPaymentCompleted`.
- [x] Direct URL-based Meta custom conversion fallback for `/a-m-thankyou` is intentionally enabled. Evidence: `index.html` and `checkout.html` route-gate a direct Meta `PageView` on `/a-m-thankyou` before React so Meta can detect the URL custom conversion; React still fires `Purchase` only after verified `COMPLETED` status. Caveat: this fallback can count anyone who reaches the thank-you URL, including pending or failed redirects.
- [x] Purchase value uses server-verified total and INR. Evidence: `/api/phonepe/status` returns client-safe `amountPaise`, `payableAmountPaise`, and `currency`; the thank-you page uses verified status amount before firing `Purchase`.
- [x] Client-side Pixel events and any future server-side Conversions API events use deduplication IDs. Evidence: all Pixel funnel events pass an `eventID`; payment event IDs are derived from event name plus merchant order ID without sending the raw order ID in event parameters.
- [x] Do not send raw email, phone, address, or payment details to Pixel or Clarity custom events. Evidence: analytics helpers allowlist low-risk event fields and tests prove raw email, phone, and merchant order IDs are excluded from Pixel and Clarity calls.
- [x] Checkout form fields are masked from Clarity recording. Evidence: the checkout form has `data-clarity-mask="true"` and tests cover the attribute.
- [x] Clarity custom tags/events use low-risk values such as route, funnel step, and payment state. Evidence: Clarity events use route, funnel step, payment state, and currency tags only.
- [ ] Meta Pixel Helper or Events Manager confirms PageView and funnel events on production URLs. Missing: production dashboard/browser-extension verification has not been captured after these tracking changes are deployed.
- [ ] Clarity collection requests are visible during production QA. Missing: browser network or Clarity dashboard verification has not been captured.
- [x] Pixel/Clarity behavior is documented when adding consent management. Evidence: `AGENTS.md` documents the route-owned analytics contract, no-PII rule, dedupe IDs, verified-payment-only `Purchase`, and future consent gating.
- [x] Privacy Policy discloses Meta Pixel, Clarity, cookies, and ad attribution. Evidence: the Privacy Policy includes an Analytics, Cookies, And Ads section naming Meta Pixel, Microsoft Clarity, cookies/local storage, ad attribution, and session recordings.

Examples:

- Good example: purchase tracking fires only after payment is verified as completed and uses the server-confirmed amount.
- Bad example: purchase tracking fires just because the user reached the thank-you page.
- Good example: Pixel and Clarity events use low-risk values such as funnel step, route, amount, currency, and payment state.
- Bad example: Pixel or Clarity custom events include raw email, phone number, address, or payment details.

## Security

- [x] API routes reject unsupported methods with method-not-allowed responses. Evidence: PhonePe route handlers return 405 through the shared JSON helper; route tests cover create-order, status, and webhook.
- [x] API routes enforce request body limits. Evidence: `readBody` enforces `DEFAULT_MAX_BODY_BYTES`; body-limit tests cover create-order, status, and webhook 413 responses.
- [x] API routes validate body/query before provider calls. Evidence: create-order validates checkout details and bump IDs, status validates merchant order IDs, and webhook verifies authorization before business processing.
- [x] API routes return JSON through shared helpers. Evidence: public API handlers use `sendJson` for success and error responses.
- [x] Public responses do not expose stack traces, secrets, or raw provider internals. Evidence: route tests cover sanitized create-order/status provider failures and generic webhook failure responses.
- [x] Environment variables are read through shared environment helpers. Evidence: production source references `process.env` only inside `api/_lib/env.js`; env consumers use `getEnv` or `requireEnv`.
- [~] Secrets are only stored in Vercel environment variables and local env files. Evidence: `.env`, `.env.*`, and `.npmrc` are gitignored and no secret file is tracked beyond `.env.example`; missing: current Vercel production secret storage/values were not re-verified in this run.
- [x] Production dependency audit has no unresolved moderate or high-risk issue. Evidence: `npm audit --omit=dev --audit-level=moderate` returned `found 0 vulnerabilities`.
- [~] Security headers are configured for production pages. Evidence: `vercel.json` sets CSP and `frame-ancestors 'none'`; missing: explicit `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, and HSTS headers are not configured.
- [ ] Checkout and payment routes are rate limited or protected from basic abuse before high-volume traffic. Missing: no rate limiter, 429 response, CAPTCHA/Turnstile, or equivalent abuse protection was found in `api`, `src`, or `vercel.json`.
- [~] CSP allows required scripts only: app bundle, PhonePe, Meta/Clarity if used. Evidence: CSP source list is limited around app, PhonePe, Meta, and Clarity domains; missing: `script-src` still includes `'unsafe-inline'` and `'unsafe-eval'`, so the policy is not strict enough for a complete mark.
- [x] Third-party scripts do not run on checkout unless needed. Evidence: checkout intentionally initializes route-owned Meta/Clarity funnel tracking; the only HTML-level Pixel fallback is route-gated to `/a-m-thankyou` and does not run on checkout.
- [x] Checkout inputs have server-side validation even if browser validation passes. Evidence: `getCheckoutValidationErrors` runs inside server-side payment creation before PhonePe calls.
- [x] Webhook verification uses timing-safe comparison. Evidence: PhonePe webhook verification compares SHA authorization using `crypto.timingSafeEqual`.
- [x] Webhook endpoints do not expose detailed failure information to attackers. Evidence: invalid auth/payload return generic 401/400 responses and unexpected webhook failures return a generic 502 response.
- [x] API routes do not log full request bodies containing PII. Evidence: payment logging allowlists safe order/status fields only, and source scan found no API console logging of request bodies.
- [ ] Sensitive pages and APIs are reviewed for cache behavior. Missing: no explicit `Cache-Control` or `no-store` policy was found for payment APIs, thank-you/status responses, or production HTML routes.
- [x] Dependency versions are pinned or lockfile-controlled. Evidence: `package-lock.json` is tracked and the dependency audit ran against the locked install.

## Privacy And Legal

- [x] Privacy Policy describes what customer data is collected and why. Evidence: privacy copy lists contact details, order/payment status, body details, styling preferences, uploaded photos, assessment inputs, device/page/timestamp data, and the reasons for using them.
- [x] Terms describe product delivery, refund policy, revisions, limitations, and support channel. Evidence: terms copy covers 48-hour delivery after complete assessment, refunds/cancellations after work begins, review/support handling, personal-use limits, outcome limitations, and support email/hours.
- [~] Payment, delivery, and refund language matches the actual process. Evidence: checkout and terms match the 48-hour delivery promise, PhonePe payment flow, INR 1,999 + GST base offer, and non-refundable-after-analysis policy; missing: terms should explicitly mention current add-ons and the one revision within 3 days that appears in the FAQ.
- [x] Customer photos and assessment data handling is described. Evidence: privacy copy explains that photos, body-related details, measurements, and preferences are used for style analysis, report preparation, quality checks, and order support.
- [~] Data retention and deletion process exists. Evidence: privacy copy allows access/correction/deletion requests and explains legal/tax/dispute retention reasons; missing: no concrete retention period, deletion SLA, or internal deletion SOP is documented.
- [~] Marketing pixels and analytics are disclosed where required. Evidence: React privacy content discloses Meta Pixel, Microsoft Clarity, cookies/local storage, ad attribution, analytics, and session recording; missing: the static `public/privacy/index.html` page does not include the analytics/pixel disclosure and may be the production-served `/privacy` page.
- [x] GST/tax display is accurate. Evidence: `GST_RATE` is `0.18`, checkout displays `GST (18%)`, add-ons show `+ GST`, and sales/terms copy states INR 1,999 plus GST.
- [~] Business contact details are correct. Evidence: legal pages list `DYN PRODUCTIVITY SEMPRE PRIVATE LIMITED`, Noida address, support email, and support hours; missing: correctness was not verified against company records or GST/legal registration documents in this run.
- [ ] PCI scope is reviewed with the payment provider/acquirer when card payments are enabled. Missing: no PCI scope note, PhonePe/acquirer responsibility confirmation, or card-payment compliance record is documented in the repo.

## Performance

- [x] Landing page LCP image is optimized and not oversized. Evidence: hero image uses Cloudinary `f_auto,q_auto,c_limit,w_900`, `loading="eager"`, `fetchPriority="high"`, `decoding="async"`, and explicit `900x900` dimensions.
- [x] Below-the-fold images use lazy loading. Evidence: source tests verify only one eager image and below-fold landing images use `loading="lazy"`.
- [x] Images have stable dimensions to avoid layout shift. Evidence: landing image tests verify every production `<img>` has `width`, `height`, and async decoding; section CSS also uses stable ratios/wrappers.
- [~] CSS bundle is reviewed for unused large sections before launch. Evidence: CSS is split into route-owned chunks and the build CSS passes the gzip budget; missing: no selector-level unused CSS audit or Lighthouse coverage report has been completed.
- [x] Third-party scripts are async/deferred where possible. Evidence: HTML entries contain only the app module script before React; Meta Pixel and Clarity are inserted after route initialization with `script.async = true`.
- [x] Checkout page loads quickly on mobile data. Evidence: checkout now lazy-loads as its own route chunk, does not eagerly import landing sections or `landing.css`, has no large product imagery, and the build stays under bundle budget.
- [x] Font loading does not block critical content. Evidence: generated Inter `@font-face` rules use `font-display: swap`, so text can render before webfont files finish loading.
- [x] Production build bundle output is reviewed for unexpected growth. Evidence: `npm run build` passed; `npm run check:bundle` reported JS gzip `60.65 kB / 100.00 kB` and CSS gzip `12.88 kB / 25.00 kB`.
- [x] Vercel cache headers are intentional for static assets and HTML. Evidence: `vercel.json` sets app/legal routes to `Cache-Control: no-store, max-age=0` and hashed `/assets/(.*)` to `public, max-age=31536000, immutable`.
- [x] API routes are not cached by browser/CDN when returning payment state. Evidence: the shared `sendJson` helper now adds `Cache-Control: no-store, max-age=0`, `Pragma: no-cache`, and `Expires: 0`; tests cover the headers.
- [x] PhonePe and Make calls have timeout and failure behavior tests. Evidence: tests cover PhonePe abort signals, timeout errors, provider failure sanitization, and Make webhook failure behavior with abort signals.

## SEO And Sharing

- [x] Title and meta description are correct. Evidence: `index.html` defines the landing title `AttractiveMen | Your Personalized Style Report` and a landing meta description; `checkout.html` defines checkout-specific title and description.
- [ ] Canonical URL is set for the production landing route. Missing: no `<link rel="canonical" href="https://thriveonp.com/a-m">` is present in `index.html` or the built HTML.
- [ ] Open Graph title, description, and image are configured. Missing: no `og:title`, `og:description`, `og:image`, Twitter card tags, or share image asset are configured.
- [~] Favicon and theme color are correct. Evidence: `index.html` and `checkout.html` set `theme-color` to `#f8f9f7`; missing: no favicon, app icon, or manifest asset/link exists in `public/` or the HTML entries.
- [ ] Robots behavior is intentional. Missing: no `robots.txt`, sitemap, or explicit robots policy is present; the current behavior is default indexability by omission.
- [x] Legal pages are not accidentally blocked if they need to be public. Evidence: `public/privacy/index.html` and `public/terms/index.html` exist, no robots rule blocks them, and local production preview returned `200` for `/privacy` and `/terms`.
- [~] Broken links are checked before launch. Evidence: local production preview returned `200` for `/`, `/a-m`, `/a-m-checkout`, `/a-m-thankyou`, `/privacy`, and `/terms`; missing: full production crawl and external/share-preview validation after deployment.

## Accessibility

- [ ] One clear top-level heading per page.
- [ ] Heading order is logical.
- [ ] Form labels are connected to inputs.
- [ ] Error states are announced or readable by assistive tech.
- [ ] Buttons and links have accessible names.
- [ ] Color contrast passes for body text, buttons, error states, and badges.
- [ ] Keyboard navigation works through landing CTAs, checkout fields, FAQ, and payment button.
- [ ] Focus styles are visible.
- [ ] Motion does not block users with reduced-motion preferences.

## Deployment And DNS

- [x] Vercel project is linked to the intended GitHub repo and branch. Evidence: local `.vercel/project.json` links this workspace to Vercel project `am1`, local branch is `main`, git remote `am1` points to `https://github.com/harsh817/AM1.git`, and owner confirmed the Vercel/GitHub connection.
- [x] Vercel route config matches public URLs. Evidence: `vercel.json` rewrites `/a-m`, `/a-m-checkout`, and `/a-m-thankyou` to the app entry, excludes `/am/temp`, and local/live route checks returned `200`.
- [x] Root DNS record points to Vercel when root domain should serve Vercel. Evidence: `Resolve-DnsName thriveonp.com -Type A` returns `76.76.21.21`.
- [x] www CNAME points to Vercel DNS. Evidence: `Resolve-DnsName www.thriveonp.com -Type CNAME` returns `cname.vercel-dns.com`.
- [x] Vercel domain status is verified after DNS changes. Evidence: Vercel project-domain API lists `thriveonp.com` and `www.thriveonp.com` under project `am1` with `verified: true`; `vercel inspect https://thriveonp.com` and `https://www.thriveonp.com` resolve to the Ready `am1` production deployment; live HTTPS returns `Server: Vercel`.
- [x] SSL certificate is active. Evidence: `https://thriveonp.com/a-m`, `/a-m-checkout`, `/a-m-thankyou`, and `https://www.thriveonp.com/a-m` return HTTPS `200` with Vercel/HSTS headers.
- [x] Production env vars are configured in Vercel, not only locally. Evidence: `vercel env ls production` for `harsh817s-projects/am1` shows encrypted production entries for `MAKE_WEBHOOK_URL`, `BASE_URL`, `PHONEPE_ENV`, `PHONEPE_CLIENT_VERSION`, `PHONEPE_CLIENT_SECRET`, and `PHONEPE_CLIENT_ID`.
- [ ] Preview deployment is checked before production promotion when possible. Missing: no validated preview deployment URL or preview-before-promote evidence is documented for the latest release.
- [x] Rollback deployment URL is known. Evidence: `vercel ls` lists previous Ready production deployments for `am1`, including `https://am1-9thgu7y0y-harsh817s-projects.vercel.app`; `vercel ls pg-thriveonp` also lists previous Ready production deployments for the currently aliased domain project.
- [x] Build output, dependencies, Vercel local config, and env files are not committed. Evidence: `git ls-files .env .env.* .vercel dist node_modules` returns only `.env.example`; `.gitignore` ignores `.env`, `.env.*`, `.vercel`, `dist/`, and `node_modules/`.
- [x] GitHub branch connected to Vercel is confirmed before release. Evidence: local branch is `main`, the AM1 remote points to `https://github.com/harsh817/AM1.git`, and owner confirmed the Vercel/GitHub connection before release.
- [x] Production aliases point to the intended Vercel project. Evidence: `vercel alias set` mapped `thriveonp.com` and `www.thriveonp.com` to `am1-373xs124z-harsh817s-projects.vercel.app`; Vercel project-domain API now lists both domains under project `am1`.
- [~] Base URL matches the public production domain used in PhonePe redirects. Evidence: `.env.example` and production-mode PhonePe validation use `https://thriveonp.com`, Vercel production has encrypted `BASE_URL`, and the root/`www` aliases now point to `am1`; missing: actual encrypted production `BASE_URL` value was not inspected to avoid exposing secrets.
- [x] Domain change is checked with DNS and HTTP headers, not only browser view. Evidence: DNS was checked with `Resolve-DnsName`; live routes were checked with `curl -I -L` and returned Vercel HTTPS headers.

## CI And Quality Automation

- [x] GitHub push triggers Vercel deployment for the intended project. Evidence: pushing commit `8cc8883` to `harsh817/AM1.git` `main` created AM1 production deployment `https://am1-beasmcjim-harsh817s-projects.vercel.app`; `thriveonp.com` and `www.thriveonp.com` now resolve to that Ready `am1` deployment.
- [ ] CI runs the local test suite. Missing: no `.github/workflows` or other CI config runs `npm test`; local `npm test` passed 93/93, but this is not enforced on push.
- [x] CI runs the production build. Evidence: Vercel Git deployment runs the project production build for pushes to `main`; commit `8cc8883` deployed successfully to Ready AM1 production.
- [~] CI fails on dependency install or lockfile mismatch. Evidence: `package-lock.json` is tracked and `npm ci --dry-run --ignore-scripts` passes locally; missing: no CI workflow explicitly uses `npm ci` as a required lockfile gate.
- [ ] Add linting before the project grows further. Missing: no `lint` script, ESLint/Biome config, or lint CI gate exists.
- [ ] Add formatting rules before multiple contributors edit the same CSS/JS files. Missing: no `format`/`format:check` script, Prettier/Biome config, or formatting CI gate exists.
- [~] Add route smoke tests for public URLs after deploy. Evidence: manual production checks returned `200` for `https://thriveonp.com/a-m`, `/a-m-checkout`, and `/a-m-thankyou`; missing: no automated post-deploy smoke script or CI/Vercel deployment check exists.
- [ ] Add checkout API health checks that do not create real payments. Missing: no non-payment health endpoint or deployed health-check script exists for checkout/PhonePe route availability.
- [ ] Add coverage reporting for server utilities and shared browser helpers. Missing: no coverage dependency, `coverage` script, generated report, or CI coverage threshold exists.
- [~] Do not bypass hooks or CI checks for production payment changes. Evidence: this run did not use `--no-verify`, and no hooks were bypassed; missing: no git hooks, branch protection evidence, or required CI checks enforce this rule.

Recommended automation examples:

- Add a lint check for JavaScript and React quality.
- Add a format check so CSS and JavaScript do not drift across contributors.
- Add one combined local check that runs tests and the production build.
- Add deployed route smoke checks for the public landing, checkout, and thank-you URLs.

## QA Matrix

- [ ] Chrome desktop: landing -> checkout -> payment start.
- [ ] Safari desktop or iOS Safari: landing -> checkout -> payment start.
- [ ] Android Chrome: landing -> checkout -> payment start.
- [ ] Small mobile width: 320px.
- [ ] Common mobile width: 390px.
- [ ] Tablet width: 768px.
- [ ] Desktop width: 1440px.
- [ ] Slow network checkout behavior.
- [ ] Refresh on checkout.
- [ ] Refresh on thank-you page with merchant order ID.
- [ ] Invalid name/email/phone.
- [ ] Optional bump selected and unselected.
- [ ] Payment success.
- [ ] Payment failed/cancelled.
- [ ] Payment pending.
- [ ] Webhook received.
- [ ] Make webhook unavailable.

## Release Commands

Before committing:

- Run the local test suite.
- Run the production build.
- Check the diff for whitespace or formatting errors.

For release hardening:

- Run a production dependency audit.
- Run coverage and confirm core modules meet the agreed threshold.

After deployment:

- Confirm the landing page returns a successful HTTP response.
- Confirm the checkout page returns a successful HTTP response.
- Confirm the thank-you page returns a successful HTTP response.

## Current Repo Priorities

Based on the current project shape, prioritize these before scaling paid traffic:

- [ ] Add a durable order ledger instead of relying only on Make/Sheets for order state.
- [ ] Add idempotency keys for payment lifecycle events.
- [ ] Prevent duplicate payment initiation from rapid double-submit.
- [x] Add explicit timeouts to PhonePe API calls.
- [ ] Add production smoke tests for public routes and checkout API health.
- [ ] Add a support/admin process to look up orders by email, phone, and merchant order ID.
- [x] Add an analytics helper for Meta Pixel and Clarity instead of inline event calls. Evidence: route-owned analytics helpers handle funnel events; the documented exception is the direct `/a-m-thankyou` Pixel `PageView` fallback for URL custom conversion capture.
- [x] Add Pixel funnel events: checkout view, payment started, verified purchase, payment failed.
- [x] Add Clarity masking on checkout form surfaces and low-risk funnel events.
- [ ] Add schema version and idempotency keys to Make payloads.
- [x] Split large landing page files into section components and bring checkout page within the line-count target.
- [ ] Add CI scripts for lint, format check, tests, and production build.

## Official References

- [PhonePe Standard Checkout introduction](https://developer.phonepe.com/payment-gateway/website-integration/standard-checkout/api-integration/api-integration-website)
- [PhonePe Create Payment API](https://developer.phonepe.com/payment-gateway/website-integration/standard-checkout/api-integration/api-reference/create-payment)
- [PhonePe Order Status API](https://developer.phonepe.com/payment-gateway/website-integration/standard-checkout/api-integration/api-reference/order-status)
- [Meta Pixel getting started](https://developers.facebook.com/documentation/meta-pixel/get-started)
- [Meta Pixel reference](https://developers.facebook.com/documentation/meta-pixel/reference)
- [Microsoft Clarity setup](https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-setup)
- [Microsoft Clarity client API](https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-api)
- [Vercel custom domains](https://vercel.com/docs/domains/working-with-domains/add-a-domain)
- [Vercel DNS records](https://vercel.com/docs/domains/managing-dns-records)
- [PCI SSC merchant resources](https://www.pcisecuritystandards.org/merchants/)
- [PCI SSC ecommerce SAQ A clarification](https://blog.pcisecuritystandards.org/faq-clarifies-new-saq-a-eligibility-criteria-for-e-commerce-merchants)
