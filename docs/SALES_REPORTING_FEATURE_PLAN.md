# Sales, Campaigns and Experiment Reporting

Status: implemented; production rollout pending  
Owner: AttractiveMen operations  
Timezone: Asia/Kolkata  
Primary route: `/dashboard`

## Purpose

This feature provides one private place to answer four operating questions: how much traffic arrived, where people dropped, which payments need attention, and which page produces confirmed sales. It uses the existing Convex deployment and Convex Auth administrator account.

The original `/experiment-dashboard` route redirects to `/dashboard/experiments` for compatibility. Advertising spend, ROAS, refunds, and customer messaging are future phases.

## Delivered views

- [x] Overview: visitors, checkout visitors, initiated, pending, failed, completed and confirmed revenue.
- [x] Sales and payments: searchable order records with customer details, amounts, attribution and status history.
- [x] Pending and failed payments: separate current-state counts, stale pending flags and safe failure context.
- [x] Campaigns: source, medium, campaign and page comparisons across traffic and sales.
- [x] Funnel: recorded landing, checkout visit, payment initiation and confirmed purchase.
- [x] Experiments: AM/AM2 allocation, conversion and experiment controls.
- [x] Tracking health: unmatched receipts, reporting failures and stale payment checks.
- [x] Responsive admin navigation, empty states, loading states and mobile layout.

## Data rules

- Dates are displayed and filtered in Asia/Kolkata.
- Confirmed revenue includes only verified completed payments and each paid order is counted once.
- Pending and failed amounts are potential order value; they never enter confirmed revenue.
- Pending orders are not converted to failed orders because of age.
- Experiment conversion is unique purchasing visitors divided by recorded randomized exposures.
- Direct, test and unattributed records remain visible in sales reporting and are excluded from randomized comparisons.
- Attribution is captured at payment initiation and cannot be replaced by a later browser request.
- Customer contact fields are administrator-only and are excluded from analytics and logs.

## Payment states

The dashboard keeps these cases separate:

1. `INITIATED`: an order was created before the payment provider completed the request.
2. `PENDING`: the provider has not reached a final state.
3. `COMPLETED`: verified payment received; this is the only state included in revenue.
4. `FAILED`: the provider confirmed payment failure.
5. `UNKNOWN`: provider or network uncertainty that requires reconciliation.

Checkout creation errors, provider uncertainty, payment failures and reporting delivery failures have separate labels and must not be combined.

## End-to-end checks

- [ ] Sign in, sign out, password recovery configuration and unauthorized access.
- [ ] Fresh AM/AM2 assignment, returning assignment, direct AM2 access, paused experiment and storage fallback.
- [ ] UTM source, medium, campaign, content, term, ID, gclid, gbraid, wbraid and fbclid preservation.
- [ ] Landing and checkout deduplication across refreshes and separate tabs.
- [ ] Order attribution remains unchanged after thank-you navigation.
- [ ] Initiated, pending, failed, completed, duplicate and out-of-order payment events.
- [ ] Successful payment without a thank-you return is still attributed from the verified webhook.
- [ ] Unmatched receipts, delayed order records, Convex outage, Make outage and retry recovery.
- [ ] Search, status tabs, page filters, campaign filters, funnel counts, empty results and mobile layout.
- [ ] CSV export escaping and administrator-only customer data access.

## Deterministic test dataset

Use development-only fixtures: 100 AM visitors, 10 purchasing visitors, 12 completed orders and ₹12,000 revenue must produce 10% conversion, ₹1,000 average order value and ₹120 revenue per visitor. Add 8 pending and 5 failed orders; the completed revenue must remain unchanged. Two completed orders by one visitor count as two orders and one purchasing visitor.

## Release evidence

- [x] `npm test` — 101 passing tests.
- [x] `npm run build` — production Vite build passed.
- [x] `npm run check:bundle` — JavaScript and CSS budgets passed.
- [x] `npx tsc --noEmit -p convex/tsconfig.json` — passed.
- [x] Convex typecheck and deployment — functions ready on `notable-wolf-488`.
- [x] `npm audit --omit=dev --audit-level=moderate` — 0 vulnerabilities.
- [x] `node --test --experimental-test-coverage` — 93.38% line coverage overall.
- [ ] Production dashboard login and read-only smoke test
- [ ] Production payment and reconciliation smoke test with marked test records
- [ ] Standalone export regenerated when landing source changes
- [ ] Deployment URL, commit and verification timestamp recorded here

## Known limitations

- Historical rows created before reporting fields were added may show `Not recorded`.
- Visitor counts represent identifiable browsers, not people across devices.
- Ad spend and ROAS are not calculated until a spend source is connected.
- Refund and net-revenue reporting is a later phase.
- CSV export, administrator status-refresh actions, and payment reconciliation imports remain follow-up work in the health module.
- The connected Convex deployment is currently the existing development deployment; a separate production Convex deployment remains a release prerequisite.
- A dashboard zero can mean no activity or missing historical tracking; the health view must be checked before drawing conclusions.

## Rollback

Keep the experiment paused if reporting health is uncertain. The public landing pages and checkout remain available. Disable dashboard access through the deployment feature flag, preserve payment operations, and reconcile verified PhonePe receipts from the operational records before re-enabling reporting.
