# Shared Meta gateway delivery

## Configuration verified on 2026-11-07

Meta Business Manager shows AM-Purchase (2647411082380065) connected to Conversions API with Meta under AdWiseli (163575429261242). The pixel's own public configuration at https://connect.facebook.net/signals/config/2647411082380065 supplies these OpenBridge destinations:

- Primary: `https://d3-36c34dc0877246a0b32c4f4e24be6ce8.ecs.us-east-1.on.aws`
- Meta-configured fallback: `https://demo-1.conversionsapigateway.com`

The fallback name is supplied by Meta, not a project development setting. Both destinations were blocked by the site's Content Security Policy. The shared policy now permits only these exact additional connection origins and the SDK's `https://www.facebook.com` frame. It does not allow arbitrary AWS hosts or change framing protections for this site.

No pixel ID, page content, route ownership, event code, payment logic or Meta account settings changed. `/am-ds`, `/a-m` and `/AM2` retain their shared analytics implementation.

## Verification

- Regression policy tests failed before the fix and passed afterward.
- All 130 repository tests passed.
- Production build and bundle budgets passed.
- Dependency audit found zero vulnerabilities.
- Coverage command passed: 94.57% lines overall. Existing `payment-return.js` coverage is 75%, below the project target; this header-only change does not modify it.
- No standalone regeneration required: source and standalone HTML are unchanged; this change affects Vercel response headers only.
- Production event receipt verification pending deployment.

## Rollback

Revert the narrow `vercel.json` policy change and redeploy to restore the previous headers. This will reintroduce the gateway delivery block. Keep pixel and payment event IDs unchanged. If Meta rotates its managed gateway, verify the new exact origin from its pixel configuration before updating the allowlist.
