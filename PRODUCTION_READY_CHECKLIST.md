# Production Ready Checklist

Last updated: 2026-09-01

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
| Release date | 2026-09-01 |
| Owner | Pending owner signoff |
| Git commit | Pending commit for current fixes; previous production commit was 3a70009 |
| Vercel deployment URL | Current production still needs redeploy after this checklist update; previous AM1 production: https://am1-7fprvxoda-harsh817s-projects.vercel.app |
| Production URL tested | https://thriveonp.com/a-m, /a-m-checkout, /a-m-thankyou |
| PhonePe mode | Owner reports real success and failure were already tested; capture final evidence before launch signoff |
| Make scenario tested | Not verified in Make dashboard during this run |
| Rollback deployment | AM1 previous: https://am1-lhd03zro5-harsh817s-projects.vercel.app; wrapper previous: https://pg-thriveonp-go2ksxkt2-harsh817s-projects.vercel.app |

## P0 Go/No-Go Gates

- [x] Local test suite passes. Evidence: `npm test` passed, 80/80 tests.
- [x] Production build passes. Evidence: `npm run build` passed.
- [~] Production Vercel deployment is Ready. Evidence: previous AM1 production deployment `am1-7fprvxoda` is Ready for commit `3a70009`; current local fixes need a new production deployment.
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
- [~] Pixel and Clarity events are verified on production URLs, not only local preview. Evidence: scripts and CSP are present on production HTML; browser-network or dashboard verification was not completed, and no funnel-specific Pixel events exist beyond PageView.
- [~] Payment success, failure, and pending states are tested end to end. Evidence: owner reports real success and failure were tested; pending-state evidence and reproducible proof were not captured in this run.
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
- [~] Avoid one-off abstractions. Extract only when it reduces real duplication or risk. Evidence: current abstractions are useful, but large page files should be split before adding more section logic.
- [~] Avoid magic numbers for prices, timeouts, body limits, and route names. Evidence: prices, GST, body limit, and route names are centralized; PhonePe expiry, Make timeout, and payload length limits should be named constants with comments/tests.
- [ ] Add JSDoc to complex public helper functions while the project remains JavaScript. Missing: complex exported helpers such as checkout tracking, payment creation, and webhook payload builders have no JSDoc.
- [x] Do not read browser globals in module scope unless the code is browser-only. Evidence: browser globals are used inside browser-only entry/page code or injectable helper context.
- [x] Do not add dependencies unless they remove meaningful complexity. Evidence: no new dependency was added for the latest fixes.
- [x] Do not mix generated files, artifacts, source files, and deployment config in one commit unless the release needs all of them. Evidence: current changes are source/tests/config/checklist only; generated build output and artifacts are not changed.
- [x] Add tests before changing checkout totals, route matching, payment payloads, tracking fields, or webhook logic. Evidence: tests were added before the route/legal/API behavior fixes and pass.
- [ ] Additional project-standard gap: source and test files should stay near the ~300-line budget. Missing: `src/styles/landing.css`, `src/pages/LandingPage.jsx`, `src/pages/CheckoutPage.jsx`, `src/pages/LandingPage.test.js`, and `src/styles/landing-palette.test.js` exceed that budget.

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

- [ ] Critical hero content is visible without waiting on analytics scripts.
- [ ] Meta Pixel and Clarity scripts load asynchronously and never block React rendering.
- [ ] Above-the-fold images are compressed, dimensioned, and intentionally eager/lazy.
- [ ] Below-the-fold images use lazy loading.
- [ ] Repeated icons come from the approved icon library, not copied inline everywhere.
- [ ] Long lists are data-driven from the landing data file where practical.
- [ ] Heavy visual experiments live in artifacts before being moved into production source.
- [ ] CSS uses shared tokens for spacing, width, radius, transitions, and color.
- [ ] No section-level CSS creates layout shift on hover, timer updates, or sticky bar visibility.
- [ ] Bundle size is reviewed after adding libraries.
- [ ] Production build output is checked for unexpected asset or CSS growth.

Examples:

- Good example: product images are local, compressed, dimensioned, and lazy-loaded below the fold.
- Bad example: large remote images are dropped into production without dimensions, compression, or ownership.
- Good example: analytics scripts load after critical page content can render.
- Bad example: third-party scripts block the hero and delay the first visible content.

## Cart And Offer Logic

- [ ] Product price lives in one shared config.
- [ ] GST rate lives in one shared config.
- [ ] Optional bump IDs and prices live in one shared config.
- [ ] Unknown bump IDs are rejected by server validation.
- [ ] Duplicate bump selections are deduplicated server-side.
- [ ] Browser-selected items are treated as intent only, not source of truth.
- [ ] Checkout totals display subtotal, GST, and total payable clearly.
- [ ] Total payable shown in the button matches the server-created order amount.
- [ ] Checkout draft storage does not contain sensitive payment data.
- [ ] If quantity, coupons, bundles, or multiple products are added later, pricing moves to a real cart/order model.

Examples:

- Good example: the server receives selected item IDs and calculates the payable amount itself.
- Bad example: the browser sends the payable amount and the server trusts it.
- Good example: unknown or duplicate order bump IDs are rejected or deduplicated server-side.
- Bad example: checkout accepts any item ID or price sent by the browser.

## Checkout UX

- [ ] Name, email, and phone validation works before payment starts.
- [ ] Validation errors are specific and appear near the field.
- [ ] Mobile keyboard types are correct: email, tel, numeric.
- [ ] Checkout button has loading and disabled states.
- [ ] Double-clicking the pay button cannot create accidental duplicate orders.
- [ ] Payment failure returns user to a clear retry state.
- [ ] Pending payment state tells the user what to do next.
- [ ] Thank-you page confirms the order and explains next steps.
- [ ] User can recover if they close the PhonePe tab and return with the merchant order ID.
- [ ] Checkout works after refresh with saved draft data.
- [ ] Checkout does not store card/UPI/payment credentials.
- [ ] Privacy Policy and Terms are reachable before payment.

## Order Ledger

For a proper cart platform, a durable order ledger is required. Make/Sheets is useful for operations, but it should not be the only record of paid orders once traffic increases.

- [ ] Order is created server-side before redirecting to PhonePe.
- [ ] Order record stores merchant order ID, selected items, amount, customer contact, status, and timestamps.
- [ ] Order status transitions are controlled: created, payment initiated, paid, failed, pending, refunded, delivered.
- [ ] PhonePe order ID is stored when available.
- [ ] Every payment event has an idempotency key.
- [ ] Retried status checks do not create duplicate completed/failed rows.
- [ ] Webhook and browser return status reconcile into the same order record.
- [ ] Support can search by email, phone, merchant order ID, and PhonePe order ID.
- [ ] Order data has a retention policy.

Examples:

- Good example: one completed payment can create only one completed operational record, even after refreshes or repeated webhooks.
- Bad example: every thank-you page refresh adds another completed row to the sheet.
- Good example: support can search an order by email, phone, merchant order ID, or PhonePe order ID.
- Bad example: the only proof of payment is a row in a spreadsheet with no reliable order state.

## PhonePe Payment Integration

- [ ] PhonePe environment is intentionally set to production only for live launch.
- [ ] Production and sandbox credentials are never mixed.
- [ ] Access token request uses server-side credentials only.
- [ ] PhonePe payment request uses a server-generated merchant order ID.
- [ ] Redirect URL uses the production base URL.
- [ ] Payment amount is sent in paise and matches server total.
- [ ] Payment expiry is intentional and documented.
- [ ] PhonePe response is validated before redirecting user.
- [ ] PhonePe status API is used for return-page reconciliation.
- [ ] PhonePe provider errors are sanitized before returning to browser.
- [ ] External PhonePe calls have timeouts.
- [ ] Logs include order IDs and state, not secrets or full PII.

## Webhooks And Reconciliation

- [ ] PhonePe webhook route is configured in the PhonePe dashboard.
- [ ] Webhook username/password match production PhonePe dashboard credentials.
- [ ] Webhook verification happens before business processing.
- [ ] Raw body parsing preserves the data needed for verification.
- [ ] Invalid webhook authorization returns an unauthorized response.
- [ ] Invalid webhook payload returns a bad request response.
- [ ] Valid webhook returns a successful response quickly.
- [ ] Webhook processing is idempotent.
- [ ] Final payment state is taken from verified webhook or verified status API response.
- [ ] Failed Make delivery does not lose the order state.
- [ ] Manual reconciliation process exists for PhonePe dashboard vs internal orders.

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

- [ ] Every outbound operational event has a documented schema.
- [ ] Every schema has tests for required fields and field names.
- [ ] Event names are stable: checkout payment initiated, checkout payment completed, checkout payment failed, PhonePe webhook.
- [ ] Sheet names are stable: payment initiated, payment completed, payment failed, PhonePe webhook.
- [ ] Every event includes event name, event timestamp, sheet name, and schema version.
- [ ] Every payment event includes merchant order ID, PhonePe order ID, payment state, and amount fields.
- [ ] Amount fields clearly state units: rupees vs paise.
- [ ] Marketing fields are preserved: UTM source, UTM medium, UTM campaign, UTM content, UTM term, UTM ID, referrer.
- [ ] Device/location/engagement fields are sanitized and size-limited before forwarding.
- [ ] Browser tracking snapshots are tied to the merchant order ID.
- [ ] Final payment state is recorded once even if both browser status and webhook arrive.
- [ ] Webhook data and status API data are reconciled using the same merchant order ID.
- [ ] Make/Sheets failures are visible to operations and do not silently erase paid orders.
- [ ] Payloads never include PhonePe secrets, webhook credentials, or unnecessary customer PII.

Examples:

- Good example: completed payment events use a stable schema version, stable event name, stable sheet name, merchant order ID, and amount fields with clear units.
- Bad example: completed payment events forward the raw request body with vague field names.
- Good example: marketing fields retain first-touch UTM values through initiated, completed, and failed events.
- Bad example: completed payment events lose campaign attribution because the browser tracking snapshot was not tied to the order.

## Make And Operations Tracking

- [ ] Make webhook URL is configured in Vercel production environment variables.
- [ ] Make scenario is active before launch.
- [ ] Every payload includes event name, event timestamp, and sheet name.
- [ ] Every payload includes a schema version before campaign scale.
- [ ] Make scenario rejects or flags unknown event names instead of silently accepting malformed data.
- [ ] Payment payloads include merchant order ID, PhonePe order ID, amount, status, error code, and error message when available.
- [ ] UTM and referrer fields are stable across initiated/completed/failed events.
- [ ] Meta, Google, and other ad click IDs are captured if the ad channel requires attribution.
- [ ] Failed payment events preserve failure reason, error code, and gateway state when available.
- [ ] Completed payment events preserve payable amount and fee/tax fields when available.
- [ ] Payload timestamps use ISO strings and the dashboard knows the reporting timezone.
- [ ] Make failure is logged or visible enough for operations.
- [ ] Make retries or fallback queue exist before scaling campaigns.
- [ ] Google Sheet tabs/columns match payload schema.
- [ ] No payload sends unnecessary PII.

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

- [ ] Pixel base setup exists once per HTML entry and fires exactly one page view per page load.
- [ ] Pixel ID belongs to the correct Meta Business account.
- [ ] Clarity project ID belongs to the correct Microsoft Clarity project.
- [ ] Pixel and Clarity are present on landing and checkout only where intended.
- [ ] Purchase is not fired on simple thank-you page load unless payment status is verified as completed.
- [ ] Purchase value uses server-verified total and INR.
- [ ] Client-side Pixel events and any future server-side Conversions API events use deduplication IDs.
- [ ] Do not send raw email, phone, address, or payment details to Pixel or Clarity custom events.
- [ ] Checkout form fields are masked from Clarity recording.
- [ ] Clarity custom tags/events use low-risk values such as route, funnel step, and payment state.
- [ ] Meta Pixel Helper or Events Manager confirms PageView and funnel events on production URLs.
- [ ] Clarity collection requests are visible during production QA.
- [ ] Pixel/Clarity behavior is documented when adding consent management.
- [ ] Privacy Policy discloses Meta Pixel, Clarity, cookies, and ad attribution.

Examples:

- Good example: purchase tracking fires only after payment is verified as completed and uses the server-confirmed amount.
- Bad example: purchase tracking fires just because the user reached the thank-you page.
- Good example: Pixel and Clarity events use low-risk values such as funnel step, route, amount, currency, and payment state.
- Bad example: Pixel or Clarity custom events include raw email, phone number, address, or payment details.

## Security

- [ ] API routes reject unsupported methods with method-not-allowed responses.
- [ ] API routes enforce request body limits.
- [ ] API routes validate body/query before provider calls.
- [ ] API routes return JSON through shared helpers.
- [ ] Public responses do not expose stack traces, secrets, or raw provider internals.
- [ ] Environment variables are read through shared environment helpers.
- [ ] Secrets are only stored in Vercel environment variables and local env files.
- [ ] Production dependency audit has no unresolved moderate or high-risk issue.
- [ ] Security headers are configured for production pages.
- [ ] Checkout and payment routes are rate limited or protected from basic abuse before high-volume traffic.
- [ ] CSP allows required scripts only: app bundle, PhonePe, Meta/Clarity if used.
- [ ] Third-party scripts do not run on checkout unless needed.
- [ ] Checkout inputs have server-side validation even if browser validation passes.
- [ ] Webhook verification uses timing-safe comparison.
- [ ] Webhook endpoints do not expose detailed failure information to attackers.
- [ ] API routes do not log full request bodies containing PII.
- [ ] Sensitive pages and APIs are reviewed for cache behavior.
- [ ] Dependency versions are pinned or lockfile-controlled.

## Privacy And Legal

- [ ] Privacy Policy describes what customer data is collected and why.
- [ ] Terms describe product delivery, refund policy, revisions, limitations, and support channel.
- [ ] Payment, delivery, and refund language matches the actual process.
- [ ] Customer photos and assessment data handling is described.
- [ ] Data retention and deletion process exists.
- [ ] Marketing pixels and analytics are disclosed where required.
- [ ] GST/tax display is accurate.
- [ ] Business contact details are correct.
- [ ] PCI scope is reviewed with the payment provider/acquirer when card payments are enabled.

## Performance

- [ ] Landing page LCP image is optimized and not oversized.
- [ ] Below-the-fold images use lazy loading.
- [ ] Images have stable dimensions to avoid layout shift.
- [ ] CSS bundle is reviewed for unused large sections before launch.
- [ ] Third-party scripts are async/deferred where possible.
- [ ] Checkout page loads quickly on mobile data.
- [ ] Font loading does not block critical content.
- [ ] Production build bundle output is reviewed for unexpected growth.
- [ ] Vercel cache headers are intentional for static assets and HTML.
- [ ] API routes are not cached by browser/CDN when returning payment state.
- [ ] PhonePe and Make calls have timeout and failure behavior tests.

## SEO And Sharing

- [ ] Title and meta description are correct.
- [ ] Canonical URL is set for the production landing route.
- [ ] Open Graph title, description, and image are configured.
- [ ] Favicon and theme color are correct.
- [ ] Robots behavior is intentional.
- [ ] Legal pages are not accidentally blocked if they need to be public.
- [ ] Broken links are checked before launch.

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

- [ ] Vercel project is linked to the intended GitHub repo and branch.
- [ ] Vercel route config matches public URLs.
- [ ] Root DNS record points to Vercel when root domain should serve Vercel.
- [ ] www CNAME points to Vercel DNS.
- [ ] Vercel domain status is verified after DNS changes.
- [ ] SSL certificate is active.
- [ ] Production env vars are configured in Vercel, not only locally.
- [ ] Preview deployment is checked before production promotion when possible.
- [ ] Rollback deployment URL is known.
- [ ] Build output, dependencies, Vercel local config, and env files are not committed.
- [ ] GitHub branch connected to Vercel is confirmed before release.
- [ ] Production aliases point to the intended Vercel project.
- [ ] Base URL matches the public production domain used in PhonePe redirects.
- [ ] Domain change is checked with DNS and HTTP headers, not only browser view.

## CI And Quality Automation

- [ ] GitHub push triggers Vercel deployment for the intended project.
- [ ] CI runs the local test suite.
- [ ] CI runs the production build.
- [ ] CI fails on dependency install or lockfile mismatch.
- [ ] Add linting before the project grows further.
- [ ] Add formatting rules before multiple contributors edit the same CSS/JS files.
- [ ] Add route smoke tests for public URLs after deploy.
- [ ] Add checkout API health checks that do not create real payments.
- [ ] Add coverage reporting for server utilities and shared browser helpers.
- [ ] Do not bypass hooks or CI checks for production payment changes.

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
- Confirm the temporary landing page returns a successful HTTP response.
- Confirm the checkout page returns a successful HTTP response.
- Confirm the thank-you page returns a successful HTTP response.

## Current Repo Priorities

Based on the current project shape, prioritize these before scaling paid traffic:

- [ ] Add a durable order ledger instead of relying only on Make/Sheets for order state.
- [ ] Add idempotency keys for payment lifecycle events.
- [ ] Prevent duplicate payment initiation from rapid double-submit.
- [ ] Add explicit timeouts to PhonePe API calls.
- [ ] Add production smoke tests for public routes and checkout API health.
- [ ] Add a support/admin process to look up orders by email, phone, and merchant order ID.
- [ ] Add an analytics helper for Meta Pixel and Clarity instead of inline event calls.
- [ ] Add Pixel funnel events: checkout view, payment started, verified purchase, payment failed.
- [ ] Add Clarity masking on checkout form surfaces and low-risk funnel events.
- [ ] Add schema version and idempotency keys to Make payloads.
- [ ] Split large landing/checkout page files into section components when making the next functional change.
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
