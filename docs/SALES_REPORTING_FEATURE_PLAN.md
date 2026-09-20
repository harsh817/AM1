# Sales, Campaigns and Experiment Reporting

Status: dashboard workspace implemented; payment-reconciliation rollout remains gated
Owner: AttractiveMen operations
Timezone: Asia/Kolkata
Primary route: `/dashboard`

## Purpose

This private Convex workspace answers four operating questions: how much traffic arrived, where visitors dropped, which payments need attention, and which page produces confirmed sales. It keeps `/a-m`, `/AM2`, checkout, and thank-you behavior separate from reporting UI.

## Delivered in this pass

- [x] Light responsive dashboard shell with desktop sidebar and mobile navigation drawer.
- [x] Independent Overview, Funnels, Orders & Payments, Contacts, Campaigns, Experiments, and Tracking Health screens.
- [x] Shared IST date, page, traffic, source, and campaign filters.
- [x] Paginated order and contact results with loading, empty, and end-of-results states.
- [x] Order detail drawer with customer contact details, attribution, line items, payment timeline, and status.
- [x] Explicit payment states: initiated, pending, completed, failed, and unknown.
- [x] Pending-over-24-hour, unmatched-receipt, and unresolved-reporting-failure indicators.
- [x] Funnel visualization for recorded landing, checkout visit, payment initiation, and confirmed purchase.
- [x] Explicit Save action for experiment allocation changes and pause/resume controls.
- [x] Contacts table backed by server-side checkout submission records.
- [x] Additive Convex tables for contacts, journey events, and reconciliation jobs.
- [x] Fixed the AM/AM2 purchasing visitor counter so repeat paid orders by one visitor do not count that visitor twice.
- [x] Fixed checkout tracking length so `randomized` and other entry types are not truncated.
- [x] Corrected checkout `utm_term` to the displayed page variant when attribution is captured.

## Data and metric rules

- Revenue includes only verified completed payments and counts each paid order once.
- Pending and failed amounts are potential order value and never enter confirmed revenue.
- A pending order is not changed to failed only because it is old.
- Experiment conversion is unique purchasing visitors divided by randomized exposures.
- Direct, test, and unattributed records remain visible in sales reporting and are excluded from randomized comparisons.
- Customer contacts are saved after valid checkout submission and are administrator-only.
- Visitor metrics represent identifiable browsers, not unique people across devices.
- Dates use Asia/Kolkata boundaries; zero denominators display as an empty result in the UI rather than a misleading percentage.

## Payment and reporting states

1. `INITIATED`: the order was created before a final provider response.
2. `PENDING`: the provider has not reached a final state.
3. `COMPLETED`: verified payment received; only this state enters revenue.
4. `FAILED`: the provider confirmed payment failure.
5. `UNKNOWN`: provider or network uncertainty requiring reconciliation.

Checkout creation errors, provider uncertainty, payment failures, and reporting delivery failures remain distinct fields. A thank-you page visit is never treated as proof of payment.

## Remaining release gates

- [ ] Replace bounded aggregate reads with rebuildable production aggregates for datasets beyond the current Convex query limit.
- [ ] Add durable journey-event ingestion for checkout submit, thank-you visit, and CTA diagnostics.
- [ ] Make verified payment receipt persistence happen before webhook acknowledgement and expose retryable failures.
- [ ] Complete unmatched-receipt reconciliation, scheduled status checks, and administrator retry actions.
- [ ] Add filtered CSV export with formula escaping and optional contact inclusion.
- [ ] Add server-issued enrollment attribution and durable per-tab attribution validation.
- [ ] Complete production Convex environment separation and migration rehearsal.
- [ ] Run marked sandbox payment tests for initiated, pending, failed, completed, duplicate, delayed, and out-of-order events.

## Deterministic test dataset

In development only, 100 AM visitors, 10 purchasing visitors, 12 completed orders, and INR 12,000 revenue must produce 10% conversion, INR 1,000 average order value, and INR 120 revenue per visitor. Add 8 pending and 5 failed orders; revenue must remain INR 12,000. Two completed orders by one visitor count as two orders and one purchasing visitor.

## Verification evidence

- [x] `npm test` — 101 tests passed before the dashboard pass; rerun after final Convex deployment.
- [x] `npm run build` — passed after the dashboard UI rewrite.
- [x] `npx tsc --noEmit -p convex/tsconfig.json` — passed after schema and dashboard changes.
- [ ] `npm run check:bundle` after final build.
- [ ] `npm audit --omit=dev --audit-level=moderate`.
- [ ] `node --test --experimental-test-coverage`.
- [ ] Convex typecheck and deployment against the intended production deployment.
- [ ] Desktop and mobile smoke tests for every dashboard route.
- [ ] Source-record, dashboard, and export reconciliation with marked test records.

## Known limitations

Historical rows created before reporting fields were introduced may show `Not recorded`. The current dashboard reports the existing payment history, but it does not yet provide full provider reconciliation, CSV exports, ad spend/ROAS, refund accounting, recovery messaging, or additional administrator roles. The active Convex deployment must be separated from development before production reporting is enabled.

## Rollback

Dashboard rollback is route-level: restore the previous dashboard component or disable dashboard access without changing public landing pages, checkout, payments, or stored Convex records. Keep the experiment allocation unchanged while investigating reporting issues. Reconcile verified provider receipts from operational records before re-enabling reporting.
