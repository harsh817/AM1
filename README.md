# AttractiveMen Website

## Complexion persona release — 2026-11-07

Separate page: `/style-for-your-complexion`. AM and AM2 keep their existing designs; ads continue to use `/a-m`.

Routing matches the standalone word `dark`, case-insensitively, in decoded `utm_medium` only. Verified in Meta Ads Manager: active Dark Skin ad `Sep_PA_H2_dark_outside_CTA_M` points to `/a-m` and uses `utm_medium={{adset.name}}`. Its sibling ads and Dark avoids white V2 are visible in the campaign. Do not match `utm_content`: Belly creatives can retain old dark filenames. Meta name macros use the first published name; renamed ad sets need review before relying on their current display names.

Persona redirect precedes A/B assignment and preserves campaign parameters, click identifiers and fragments. `utm_term=COMPLEXION`, variant `COMPLEXION`, blank experiment ID, and direct classification keep this audience out of the randomized comparison. Direct here means non-randomized, not necessarily organic. Use the Complexion persona page filter in Overview, Orders, Campaigns and Funnel. Checkout carries tab-local context and orders snapshot attribution at initiation. Payment amounts and state rules are unchanged.

Switch: `COMPLEXION_ROUTING_ENABLED=true` enables matching redirects; default is off. Set false and redeploy to roll back redirects, keeping the direct page and historical orders. Configuration failure falls back to existing control behavior.

Verification: 127 tests passed; persona precedence, disabled routing, Belly exclusion, checkout/order attribution, click identifiers, invalid randomized persona rejection and retry checked. Build/bundle checks passed. Overall coverage: 94.57% statements, 81.20% branches, 95.28% functions. Runtime dependency audit: zero vulnerabilities. Additive Convex production changes deployed to grand-cod-27 after type checks; no indexes/data deleted. Standalone regenerated for route/composition changes. Local 390px and 1440px checks passed; recap scroll and checkout preserve UTMs. Referenced GIFs converted to lossless animated WebP; original working assets remain local.

Released commit 05dfb74 to origin/main. Initial deployment passed with routing disabled; enabled deployment https://am1-94ojw9z4q-harsh817s-projects.vercel.app was Ready on 2026-11-07 at approximately 18:22 IST. Production browser verified Dark Skin redirect with preserved campaign/hash and COMPLEXION checkout, while Belly with dark in utm_content stayed in AM/AM2 routing. Marked production test persona-release-test-20261107 persisted exactly one exposure and one checkout with entryType=test and blank experiment ID. All 24 optimized animations verified identical decoded pixels and timing (duplicate frames coalesced). No real payment used. Make payload fields remain stable; external mappings with AM/AM2-only filters may need extension. Existing dashboard aggregation limits are unchanged.


A responsive React and Vite sales page for the AttractiveMen Personalized Style Report, including a conversion-focused checkout prototype with optional order bumps.

## Features

- Responsive landing page for desktop and mobile
- Shared StyleIQ landing implementation with a promoted light control and dark AM2 variant
- `/a-m` control and `/AM2` dark variant, with configurable experiment routing
- Personalized StyleIQ report offer at INR 1,999 plus GST
- Cloudinary-optimized before-and-after, report, process and testimonial imagery
- Checkout form with locally saved contact and bump selections
- Optional 20-minute style-review call with a flirting guide for INR 499
- Live subtotal, GST and payable-total calculations
- Standalone downloadable HTML build
- Private Convex-backed experiment dashboard at `/experiment-dashboard`

## Development

```bash
npm install
npm run dev
```

Open the local URL shown by Vite. The checkout is available at:

```text
/a-m-checkout
```

The promoted StyleIQ page is available at `/a-m`; `/AM2` renders the same copy and sections in a dark theme. The previous `/a-m` page is preserved locally in `retired-pages/am-original/`, with its standalone reference, source snapshot, assets, hashes, and restoration notes. The retired folder is excluded from Vite's development watcher and production output.

## Project structure

```text
src/pages/        React page-level screens
src/lib/          Browser/shared checkout, tracking, and content helpers
src/styles/       Landing and checkout CSS
api/phonepe/      Thin Vercel API route handlers
api/_lib/         Server utilities, PhonePe client, Make payload builders
api/_lib/payment/ Payment service layer used by the route handlers
```

## Production build

```bash
npm run build
```

The production files are written to `dist/`.

## Standalone HTML

After building the project, generate the self-contained offline file with:

```powershell
./scripts/build-standalone.ps1
```

This creates `artifacts/AttractiveMen.html`. The previous standalone page is archived at `artifacts/AttractiveMen-original.html`.

## Payment integration

Checkout uses PhonePe PG V2 Standard Checkout through serverless API routes:

- `POST /api/phonepe/create-order` creates a PhonePe order and returns the hosted checkout URL.
- `GET /api/phonepe/status?merchantOrderId=...` checks order status; the browser uses `POST /api/phonepe/status` so it can include the saved checkout tracking snapshot.
- `POST /api/phonepe/webhook` accepts verified PhonePe webhooks when webhook credentials are configured.

Required environment variables:

```text
PHONEPE_CLIENT_ID
PHONEPE_CLIENT_SECRET
PHONEPE_CLIENT_VERSION
PHONEPE_ENV
BASE_URL
MAKE_WEBHOOK_URL
```

Use `.env.example` as the local template. Keep real values in `.env` or deployment environment variables only.

`MAKE_WEBHOOK_URL` receives all tracking events. Every payload includes `event_name`, `event_timestamp`, and `sheet_name` so Make can route each event into a separate Google Sheet tab. Current sheet names are `experiment_landing`, `payment_initiated`, `payment_completed`, `payment_failed`, and `phonepe_webhook`.

The experiment dashboard uses Convex for durable attribution and verified order state. Configure `CONVEX_URL`, `CONVEX_INGEST_TOKEN`, `ADMIN_EMAIL`, `ADMIN_SETUP_TOKEN`, `RESEND_API_KEY`, and `VITE_CONVEX_URL` in the deployment environment. The browser receives only the public Convex URL; ingest and setup tokens stay server-side. Provision the first admin with the one-time `provisionAdmin` Convex action, then sign in at `/experiment-dashboard` with email and password.

The new experiment is `am-vs-am2-v3` and must remain paused until separately approved for production. Its variants are **AM — Promoted Control** (`/a-m`) and **AM2 — Dark Variant** (`/AM2`). Assignments are configured in Convex and persist for 90 days. `utm_term` is reserved for the displayed page label (`AM` or `AM2`); the other UTM values and ad click identifiers remain attached to the visitor and order. In local Vite development, routing assignment and marketing analytics are disabled; use `/a-m?previewVariant=AM` or `/a-m?previewVariant=AM2` to inspect either theme without creating experiment traffic.

Initiated, completed, and failed payment events share the same tracking fields: `location`, `device`, `marketing`, `engagement`, `experiment_id`, `visitor_id`, `page_variant`, and `entry_type`. UTM values are also duplicated into sheet-friendly top-level columns: `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `utm_id`, and `referrer`. Checkout saves the browser tracking snapshot by Merchant Order ID and sends it with the completed/failed status check, so `AM` or `AM2` can be matched to the confirmed payment.

Raw PhonePe webhook events preserve the original provider payload under `phonepe.webhook`. They also include the same tracking keys, but browser-only fields are blank unless that data is available from the webhook request or provider payload.

For webhook verification, also configure `PHONEPE_WEBHOOK_USERNAME` and `PHONEPE_WEBHOOK_PASSWORD` to match the SHA webhook credentials set in the PhonePe dashboard.

The checkout currently calculates GST at 18%. Confirm the applicable tax rate before launch.

## Live deployment

Production URLs:

```text
https://thriveonp.com/a-m
https://thriveonp.com/AM2
https://thriveonp.com/a-m-checkout
https://thriveonp.com/a-m-thankyou
```

`/a-m` is the shared campaign entry link. With `am-vs-am2-v3` paused it serves the promoted control; when enabled, new visitors are assigned to **AM — Promoted Control** or redirected to **AM2 — Dark Variant**. Direct `/AM2` visits remain available and are reported separately from randomized traffic. Use `utm_term=AM` and `utm_term=AM2` as the page labels in Make/Sheets.
