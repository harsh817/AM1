# StyleIQ Quiz Production Readiness

## Scope and release posture

The StyleIQ quiz is available at `/style-quiz` behind a release flag. The flag defaults off outside local development. This work prepares the application and its staging test plan; it does not deploy to production or enable public quiz traffic.

The approved flow keeps the 48-hour delivery promise, starting only after the completed assessment and required photos arrive. There is no countdown. The regular landing pages and checkout remain available.

## Implementation record

### Quiz and checkout

- [x] Dedicated `/style-quiz` route with a release flag and Vercel rewrite.
- [x] Seven concern paths, age question including “Prefer not to say,” concern-specific questions/examples, and hair versus beard variations.
- [x] Current-tab progress persistence; Back preserves answers and changing concern clears branch answers.
- [x] Checklist-derived starting score and checklist, suggested goal labelled as a goal, five-step plan progress, and reduced-motion completion.
- [x] Contact details are collected once and passed in memory into the existing checkout; they are not put in the URL or persistent quiz storage.
- [x] Existing server-calculated PhonePe totals are reused. The base total is ₹2,359 (235900 paise); selecting the optional ₹499 add-on gives ₹2,858 (285800 paise).
- [x] Checkout has no countdown. Delivery copy consistently says: “Delivered within 48 hours after we receive your completed assessment and required photos.”
- [x] Quiz analytics contain only quiz version, opaque visitor ID, event name, and campaign identifiers. Age, answers, contact details, and photos are rejected by the event endpoint and are not sent to Meta Pixel or Clarity.
- [x] Quiz attribution is snapshotted on the order and attached to one verified-purchase event per merchant order ID.
- [x] Assessment link is restricted to the production form on the production hostname; local and Preview environments require an explicitly configured form URL.
- [x] Browser QA caught and fixed the contact-to-checkout handoff; the local checkout shows the passed contact once and remains in no-payment preview mode.

### Staging and fulfilment items still required

- [ ] Create a dedicated quiz branch and Vercel Preview deployment. Record its URL and commit here.
- [ ] Set the quiz release flag on Preview only; confirm it remains off in production.
- [ ] Configure separate staging Convex, Make, PhonePe sandbox credentials, webhook verification, return URLs, and assessment form/response storage.
- [ ] Configure the staging assessment form URL explicitly and ensure it cannot submit to or notify production systems.
- [x] Implement the authenticated assessment intake and staff queue for ready, unmatched, incomplete, and duplicate responses.
- [ ] Connect the staging form to the intake. Photos stay in the restricted form storage. The queue references the private response ID.
- [ ] Confirm the assessment form collects an order reference and all required photographs; verify how the team determines when the 48-hour window starts.

## Staging test record

No staging URL, sandbox order IDs, webhook evidence, or form-to-fulfilment evidence has been recorded yet. Local application tests are not evidence that PhonePe sandbox, Convex, Make, the assessment form, or the fulfilment process works end to end.

| Test | Required evidence | Status |
|---|---|---|
| All seven paths, age preference, branching, Back, refresh, and multi-select | Preview recording or test log showing each route and result | Not run on staging |
| 320px, 390px, desktop, keyboard, reduced motion, and slow connection | Device/browser checklist and screenshots | Not run on staging |
| Invalid contact data and both checkout selections | Expected values: ₹2,359 and ₹2,858; no countdown | Not run on staging |
| PhonePe sandbox payment at both totals | Order records and provider amounts: 235900 and 285800 paise | Not run on staging |
| Completed, pending, failed, retry, duplicate callback, and payment without return | Provider/webhook/order reconciliation by merchant order ID | Not run on staging |
| Assessment, required photos, order matching, incomplete and duplicate submissions | Staging response and fulfilment queue evidence; 48-hour start timestamp | Not run on staging |
| Campaign attribution and existing route regression | Sanitized order attribution plus landing/checkout/status smoke test | Not run on staging |

## Local verification

- [x] `npm test` — 141 tests passed.
- [x] `npm run build` — production build succeeded; quiz code is a lazy-loaded page chunk.
- [x] `npm run check:bundle` — main JS and landing CSS are within configured budgets.
- [x] `node --test --experimental-test-coverage` — 141 tests passed. Aggregate coverage was 92.47% lines, 81.72% branches, and 90.84% functions.
- [x] Local Convex type check passed.
- [x] `npm audit --omit=dev --audit-level=moderate` — zero vulnerabilities reported.
- [x] Chrome walkthrough of all seven paths and both grooming variations at 320px, 390px or 1440px. Verified checkout totals, optional upgrade, validation, refresh, Back, demo payment, demo retry and photo assessment.
- [ ] Full interactive walk-through of every path on iPhone Safari and Android Chrome remains part of staging sign-off.

## Controlled rollout and rollback

1. Complete the staging setup and all staging evidence above.
2. Obtain review approval for staging, including both PhonePe totals and a completed assessment matched to the paid order.
3. Deploy with the quiz disabled. Smoke-test production landing, checkout, payment return, and thank-you routes.
4. Enable `/style-quiz` only for an approved pilot source after verifying the production flag and fulfilment destination. Review the first five paid quiz orders against PhonePe, order records, attribution, and the assessment queue.
5. If amounts, payment verification, assessment access, or order matching fail, disable the quiz flag and stop new quiz traffic. Preserve status and assessment access for existing paid orders.

Production deployment and flag activation have not been performed by this implementation.

## Staging assessment integration

1. Set the form URL and the order-reference Google Forms `entry.<number>` field in the staging build. Enable the assessment queue in the staging dashboard.
2. Configure the private form integration to POST JSON to `/api/quiz/assessment` with the staging bearer token. Send `responseId`, `merchantOrderId`, `name`, `email`, `phone`, and `photos` with the boolean fields `front`, `side`, and `fullLength`. Set a photo flag only when the corresponding upload is available in the restricted response storage.
3. Reuse the form response ID when retrying delivery or reprocessing an updated response. Use Tracking health → StyleIQ assessments to review exceptions. A ready response writes a single `assessment_received` event and records the start of the delivery window.
4. Configure Make to deduplicate by `idempotency_key`, including delivery retries after timeouts. The assessment and verified purchase funnel stages are recorded in Convex.

The local walkthrough uses a simulated payment outcome and a local photo form. PhonePe sandbox, protected retry retrieval, and the actual form submission into the fulfilment queue still need staging verification.
