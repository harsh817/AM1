# AttractiveMen Website

A responsive React and Vite sales page for the AttractiveMen Personalized Style Report, including a conversion-focused checkout prototype with optional order bumps.

## Features

- Responsive landing page for desktop and mobile
- Separate AM2 landing-page variant for future A/B testing
- A/B entry routing from `/a-m` with persistent `AM` / `AM2` assignment
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

The original landing page is available at `/a-m`. The AM2 variant is available at `/AM2`.

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

The dashboard uses `am-vs-am2-v2` and starts paused. After preview validation, an administrator can enable the experiment and set AM/AM2 percentages totaling 100%. `utm_term` is reserved for the displayed page label (`AM` or `AM2`); the other UTM values and ad click identifiers remain attached to the visitor and order.

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

`/a-m` is the shared campaign entry link. New visitors are assigned to the original `/a-m` page or redirected to `/AM2`; the assignment is remembered for 90 days. Direct `/AM2` visits remain available and are reported separately from randomized traffic. Use `utm_term=AM` and `utm_term=AM2` as the page labels in Make/Sheets.
