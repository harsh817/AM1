# AttractiveMen Website

A responsive React and Vite sales page for the AttractiveMen Personalized Style Report, including a conversion-focused checkout prototype with optional order bumps.

## Features

- Responsive landing page for desktop and mobile
- Personalized style report offer at INR 1,900 plus GST
- Local before-and-after, report, process and testimonial imagery
- Checkout form with locally saved contact and bump selections
- Optional 20-minute style-review call with a flirting guide for INR 499
- Live subtotal, GST and payable-total calculations
- Standalone downloadable HTML build

## Development

```bash
npm install
npm run dev
```

Open the local URL shown by Vite. The checkout is available at:

```text
/a-m-checkout
```

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

This creates `AttractiveMen.html` in the project root.

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

`MAKE_WEBHOOK_URL` receives all tracking events. Every payload includes `event_name`, `event_timestamp`, and `sheet_name` so Make can route each event into a separate Google Sheet tab. Current sheet names are `payment_initiated`, `payment_completed`, `payment_failed`, and `phonepe_webhook`.

Initiated, completed, and failed payment events share the same tracking fields: `location`, `device`, `marketing`, and `engagement`. UTM values are also duplicated into sheet-friendly top-level columns: `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `utm_id`, and `referrer`. All event payloads also include normalized payment columns: `merchant_order_id`, `phonepe_order_id`, `payment_state`, `amount_paise`, `payable_amount_paise`, `fee_amount_paise`, `error_code`, and `error_message`. Checkout saves the original browser tracking snapshot by Merchant Order ID and sends it with the completed/failed status check. Completed and failed payment events also include the full raw PhonePe status response under `phonepe.status`.

Raw PhonePe webhook events preserve the original provider payload under `phonepe.webhook`. They also include the same tracking keys, but browser-only fields are blank unless that data is available from the webhook request or provider payload.

For webhook verification, also configure `PHONEPE_WEBHOOK_USERNAME` and `PHONEPE_WEBHOOK_PASSWORD` to match the SHA webhook credentials set in the PhonePe dashboard.

The checkout currently calculates GST at 18%. Confirm the applicable tax rate before launch.

## Live deployment

Production URLs:

```text
https://thriveonp.com/a-m
https://thriveonp.com/a-m-checkout
https://thriveonp.com/a-m-thankyou
```
