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
- `GET /api/phonepe/status?merchantOrderId=...` checks the order status after redirect.
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

For webhook verification, also configure `PHONEPE_WEBHOOK_USERNAME` and `PHONEPE_WEBHOOK_PASSWORD` to match the SHA webhook credentials set in the PhonePe dashboard.

The checkout currently calculates GST at 18%. Confirm the applicable tax rate before launch.

## Live deployment

Production URLs:

```text
https://thriveonp.com/a-m
https://thriveonp.com/a-m-checkout
https://thriveonp.com/a-m-thankyou
```
