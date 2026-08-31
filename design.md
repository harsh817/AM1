# AttractiveMen Design System

This file defines the selected visual direction for the StyleIQ landing page. Use it when editing `src/styles/landing.css`, `src/pages/LandingPage.jsx`, and generated artifacts.

## Selected Direction

Use **Option 05 - Ink Luxury** from [artifacts/design-system-combinations.html](artifacts/design-system-combinations.html).

Ink Luxury is the highest contrast direction. It should feel private, expensive, decisive, and editorial without becoming decorative or hard to scan.

## Artifact Match Rule

The implementation should match the Ink Luxury direction shown in `artifacts/design-system-combinations.html`, with one user-approved adjustment: the hero background must be a single black/ink tone, not the artifact's ink-to-deep blue diagonal. Do not treat this document as a loose reinterpretation of Option 5.

Exact artifact reference:

```js
{
  slug: "ink",
  number: "05",
  name: "Ink Luxury",
  className: "theme-ink",
  summary: "The highest contrast option. It feels expensive, private, and decisive.",
  fit: "Best for luxury positioning. It needs generous spacing and fewer dense modules so the page does not feel cramped.",
  rhythm: [
    ["Hero", "#161616", "#D3C3B9"],
    ["Proof", "#10232A", "#D3C3B9"],
    ["Report", "#D3C3B9", "#161616"],
    ["Process", "#3D4D55", "#F2ECE8"],
    ["FAQ", "#202020", "#D3C3B9"],
    ["Offer", "#B58863", "#161616"]
  ],
  dots: ["#161616", "#10232A", "#D3C3B9"]
}
```

When applying this to the live page, use the artifact's visual hierarchy, contrast, spacing, and rhythm as the source of truth except for the hero background override. Extra live-page sections should be mapped into the closest artifact band instead of inventing a new palette direction.

The left "Option 05 / Ink Luxury" panel in the artifact is only the design-board wrapper. Do not implement that panel on the live landing page. The live page should match the right-side StyleIQ direction after removing the top navigation strip and hero preview visual: dark hero, compact silver-white headline, copper accent treatment, and copper CTA.

Live implementation theme tokens:

```css
.theme-ink {
  --page: #161616;
  --page-text: #d3c3b9;
  --page-muted: rgba(211, 195, 185, 0.72);
  --hero-bg: #050505;
  --hero-text: #F2ECE8;
  --surface: #161616;
  --surface-alt: #202020;
  --surface-text: #d3c3b9;
  --surface-muted: rgba(211, 195, 185, 0.68);
  --strong: #d3c3b9;
  --strong-text: #161616;
  --accent: #b58863;
  --cta: #b58863;
  --cta-text: #161616;
  --border: rgba(211, 195, 185, 0.16);
  --soft-border: rgba(211, 195, 185, 0.09);
  --image-bg: #2a2a2a;
}
```

The page should feel:

- Premium and restrained, not loud.
- High contrast, but still readable on mobile.
- Structured like a serious paid report, not a fashion blog.
- Warmed by copper accents, not dominated by copper.
- Consistent with the approved landing page copy.

## Checkout And Thank-You Extension

The checkout and thank-you pages must follow the same Ink Luxury direction as the landing page, while keeping payment behavior, tracking, validation, and webhook flow unchanged.

- Checkout starts with a compact full-width deep-ink editorial intro (`#10232A`) with no outside whitespace above it or beside it. Do not use a report preview, sidebar, secondary product mockup, or price row in the checkout intro.
- Checkout intro must not use an eyebrow line. Start directly with the checkout headline.
- Checkout intro headline is centered and reads exactly `Complete Your Order for Personal Style Report`.
- Checkout intro must not use a subheadline paragraph.
- Checkout intro typography follows the sales page hero scale: 28px headline and sales-page trust text at roughly 16px to 18px.
- Checkout intro trust points use the shared sales-page `trustBadges` data from `src/lib/landing-data.js`: `1,119+ happy clients`, `★★★★★ 4.8 star rating`, `Delivered in 48 hours`, and `Lifetime access`.
- Checkout intro trust text uses linen on deep ink, uppercase display styling, sales-page trust sizing, and a 2x2 grid on narrow screens.
- Checkout intro needs a clear gap between headline and trust strip: use `clamp(28px, 4vw, 36px)` or the closest equivalent.
- Payment-specific trust points sit below the payment CTA, not in the intro: `Completely Customized`, `One-Time Payment`, `Secure Payment`, and `Encrypted Details`.
- Checkout headings should feel like a payment screen, not a large landing hero. Keep the intro direct and easy to scan.
- The checkout form uses one centered white purchase card with plain unnumbered section headings, clear black headings, and high-contrast fields.
- Checkout form typography must stay large enough to scan quickly: form headings use `--checkout-form-heading-size`, primary form/order text uses `--checkout-body-size`, and supporting copy uses `--checkout-detail-size`.
- Primary payment action uses the copper CTA treatment, low-radius rectangle button, `24px` bold text, and clear secure-payment icon support. The idle CTA label reads exactly `Proceed My Order` and must not include the payable amount.
- Checkout CTA typography must use a selector specific enough to beat the local button reset, such as `.checkout-page button.checkout-pay`, so DevTools computes the button text at `24px` and bold.
- Checkout add-ons must appear under the heading `100X Add-Ons` and use the trusted shared config from `src/lib/checkout-config.js`.
- Current checkout add-ons are `Personal Style Consultation` at `₹499 + GST` and `Instagram Profile Analysis + Makeover` at `₹299 + GST`.
- Add-ons must stay compact: one checkbox row, one title, one `+ GST` price label, and one short summary. Do not add nested benefit lists unless specifically requested.
- Order recap heading reads exactly `Recap of Your Order`. Do not use a supporting paragraph under this heading.
- Order recap rows show only item name and price for the base report and selected add-ons. Do not show per-item base/GST labels.
- GST appears once at the end as `GST (18%)`, followed by the high-contrast `Total payable` row.
- Order recap and reassurance must stay inside the same single-column flow. Totals must remain high-contrast and easy to scan.
- Desktop and mobile checkout both use the same centered single-column flow. Mobile must not have horizontal overflow.
- The thank-you page uses the same black status panel, copper status icon, soft-linen support blocks, and clear next-step list.
- Do not change server totals, PhonePe request/response handling, status checks, draft persistence, or marketing tracking while applying visual changes.

## Non-Negotiable Copy Rule

Do not rewrite approved page copy while applying this design. Design work can change layout, hierarchy, color, spacing, emphasis, and component treatment. It must not change the words in `src/pages/LandingPage.jsx` or `copy.md` unless the user explicitly asks for a copy pass.

Good:

```jsx
<h1>Stop Guessing What Actually Looks Good On You</h1>
```

Bad:

```jsx
<h1>
  Stop wasting money on the <span className="text-accent-italic">wrong clothes</span>
</h1>
```

The bad example changes the promise and tone of the headline. That is copywriting, not styling.

## Palette

Use the base palette, plus the exact artifact-derived section surfaces from Option 5.

| Token | Hex | Ink Luxury Role |
|---|---:|---|
| `--color-ink` | `#161616` | Header, final offer, premium dark surfaces, primary dark text. |
| `--color-hero-black` | `#050505` | Solid dark black hero background. Do not use gradients or sheen effects. |
| `--color-deep` | `#10232A` | Secondary dark surface, proof sections, analytical authority, section bridges. |
| `--color-slate` | `#3D4D55` | Process, FAQ, problem sections, cool contrast against warmer surfaces. |
| `--color-ice-slate` | `#B9CBD0` | Option 5 heading accent for the live section heading backdrop. |
| `--color-taupe` | `#A79E9C` | Muted text, subtle borders, inactive states, quiet supporting fills. |
| `--color-linen` | `#D3C3B9` | Main text on dark, report cards, product surfaces, warm readable sections. |
| `--color-copper` | `#B58863` | Primary CTA, price, rating stars, labels, stylized premium emphasis. |
| `--color-soft-linen` | `#F2ECE8` | Exact artifact process text/surface value. Treat as approved for Option 5. |
| `--color-heading-split` | `#0E0E0E` | Option 5 headline backdrop split tone. Use only inside the black heading box. |
| `--color-clean` | `#FFFFFF` | Clean post-hero editorial preview surface. Use only when the page needs a true white reading band. |
| `--color-faq-ink` | `#202020` | Exact artifact FAQ surface. Treat as approved for Option 5. |
| `--color-image-bg` | `#2A2A2A` | Exact artifact product/report visual background. Treat as approved for Option 5. |

Recommended semantic CSS:

```css
:root {
  --color-ink: #161616;
  --color-hero-black: #050505;
  --color-brand: #10232A;
  --color-brand-soft: #3D4D55;
  --color-muted: #A79E9C;
  --color-page: #D3C3B9;
  --color-page-soft: #F2ECE8;
  --color-accent: #B58863;
  --color-faq-surface: #202020;
  --color-image-bg: #2A2A2A;

  --surface-dark: var(--color-ink);
  --surface-deep: var(--color-brand);
  --surface-cool: var(--color-brand-soft);
  --surface-light: var(--color-page);
  --surface-warm: color-mix(in srgb, var(--color-page) 82%, var(--color-accent));
  --hero-bg: var(--color-hero-black);

  --text-on-dark: var(--color-page);
  --text-on-light: var(--color-ink);
  --cta-primary: var(--color-accent);
  --cta-primary-text: var(--color-ink);
}
```

Good:

```css
.report-card {
  background: color-mix(in srgb, var(--color-page) 88%, var(--color-ink));
  color: var(--color-ink);
}
```

Bad:

```css
.report-card {
  background: #faf7ef;
  color: #222;
}
```

The bad example introduces unapproved colors and breaks the system.

The only approved non-base hex values are the exact artifact values `#F2ECE8`, `#202020`, and `#2A2A2A`, plus `#FFFFFF` for approved clean editorial preview bands. The selected heading backdrop may also use the artifact Option 5 values `#B9CBD0` and `#0E0E0E`.

## Section Rhythm

Ink Luxury works only if the page follows the artifact's deliberate color transitions. Do not keep every section on the same light background.

Current preview: problem, waste, you-first, professional-styling, StyleIQ system, comparison, report contents, bonuses, process, and reviews sections may use `section-editorial-preview` to test the selected Option 05 heading treatment from `artifacts/heading-backdrop-examples.html`: compact black rectangle, hard near-black right split, soft-linen heading, icy-slate accent words, and soft heading glow. Most preview sections use a clean white background, while report contents intentionally uses a brand-ink background and reviews uses a soft-linen background to create color transitions. Do not add internal hairlines, divider rules, eyebrow text, subheadline, support sentence, or any other text inside this heading box. The live heading box must contain only the headline text. Use the same headline size as the hero (`--hero-headline-size`, currently 28px), `1.08` line-height, `22px` vertical desktop padding, and `18px` vertical mobile padding. Do not roll this to every section until the preview is approved.

Editorial heading backdrop rules:

- When a section is approved for the editorial preview treatment, the section must use `section-editorial-preview` and a section-specific class such as `problem-editorial` or `waste-editorial`.
- The section background must be `var(--palette-clean)`. Do not leave it on linen, slate, or inherited section colors.
- The heading box must use the Option 05 compact black backdrop from `.section-editorial-preview .section-heading`.
- The heading box must contain headline text only. No eyebrow, intro, divider, support sentence, icon, or decorative element goes inside it.
- If the section direction says centered, do not pass `align="left"` to `SectionHeading`.
- If the section direction says all caps, apply `text-transform: uppercase` in the section CSS rather than rewriting the JSX copy.
- Heading text inside the backdrop must stay `var(--palette-soft-linen)`, with the optional `<span>` accent using `var(--palette-ice-slate)`.
- Consecutive clean white editorial sections must not show a visible separator line or hairline. Remove borders/shadows or use the approved adjacent-section overlap rule.
- Body copy under the backdrop must stay outside the heading box and use `var(--palette-hero-black)` on white.
- Update `design.md` and the relevant tests whenever a section adopts this treatment, so alignment, casing, background, and separator behavior do not drift.

Good:

```jsx
<section className="section waste-section section-editorial-preview waste-editorial">
  <div className="shell narrow-shell">
    <SectionHeading>
      Stop wasting money on the <span>wrong clothes</span>
    </SectionHeading>
  </div>
</section>
```

Good:

```css
.waste-editorial {
  border-top: 0;
  background: var(--palette-clean);
  color: var(--palette-hero-black);
  box-shadow: none;
}

.waste-editorial .section-heading h2 {
  color: var(--palette-soft-linen);
  text-align: center;
  text-transform: uppercase;
}
```

Bad:

```jsx
<section className="section waste-section">
  <SectionHeading align="left">
    STOP WASTING MONEY ON THE WRONG CLOTHES
  </SectionHeading>
</section>
```

The bad example misses the white editorial background, misses the black backdrop class, hardcodes the all-caps copy in JSX, and keeps the heading left-aligned.

Live implementation rhythm:

| Artifact Section | Background | Text |
|---|---:|---:|
| Page frame | `#161616` | `#D3C3B9` |
| Hero | solid `#050505` | `#F2ECE8` |
| Proof | `#10232A` | `#D3C3B9` |
| Report | `#D3C3B9` | `#161616` |
| Process | `#FFFFFF` | `#161616` |
| FAQ | `#202020` | `#D3C3B9` |
| Offer | `#B58863` | `#161616` |

Live-page sections should map into this rhythm:

| Section | Background | Text | Accent Use |
|---|---|---|---|
| Header | None inside hero | None | Do not show a top nav strip above the hero content. |
| Hero | Solid dark black background | Silver-white headline, linen body | Copper eyebrow, italic accent, CTA, checks, and metric fills. |
| Trust proof | Clean white | Ink | Small outlined badges only; this band sits outside the hero and must not show a bottom divider. |
| Problem | Clean white preview | Hero black | Option 05 heading backdrop, centered title-case headline, left-aligned body copy, hero-black subheadline-sized text, one sentence per line, bold question rows, and selective uppercase or accent-underlined keyword emphasis so readers can skim the impact quickly. |
| Waste | Clean white preview | Hero black | Option 05 heading backdrop, centered all-caps headline, no visible separator line from the previous white section, one sentence per paragraph, hero-black body copy, selective uppercase impact words, and accent underlines for the sharpest decision or mistake. |
| You-first | Clean white preview | Hero black | Option 05 heading backdrop, centered all-caps headline, no visible separator line from the previous white section, one sentence per paragraph, hero-black body copy, stacked quote lines, the four before/after transformation images stacked vertically immediately after `But good styling starts with you.`, stacked personal-context lines, and selective emphasis on personal, generic, and you. Each moved transformation image must have exactly one plain persona/outcome sentence immediately before it, using the same section text size and rhythm. Do not use avatar badges, black dot icons, multi-line blurbs, polished marketing-card tone, or forced uppercase labels. Match the persona to the image: 40-year-old with the casual polo transformation, corporate with the blazer/formal mismatch transformation, skinny guy with the graphic tee transformation, and short guy with the checked-shirt/stacked-jeans proportion transformation. Each image must carry visible Before/After labels and a center divider overlay. Do not use a standalone transformation carousel section. |
| Professional styling | Clean white preview | Hero black | Option 05 heading backdrop, centered all-caps headline, no visible separator line from the previous white section, one sentence per paragraph, hero-black body copy, bold reason stack, and selective emphasis on styling inputs and personalized styling. |
| StyleIQ system | Clean white preview | Hero black body text | Option 05 heading backdrop, centered all-caps headline, no heading intro, body copy outside the heading, vertical subsections instead of cards, pure-black centered subsection heading rows with copper numbers sized like the title, no-wrap number/title pairing for long headings, icy-slate titles, and white description areas with left-aligned hero-black text. |
| Comparison | Clean white preview | Hero black body text | Option 05 heading backdrop, centered all-caps headline, no heading intro, body copy outside the heading, and exactly two subsections: one for all "Without StyleIQ" items and one for all "With StyleIQ" items. "Without" uses a soft-linen body surface with X icons as list bullets and hero-black text. "With" uses a brand-ink body surface with Check icons as list bullets and soft-linen text. Both subsection heading rows stay pure black with centered icy-slate title text only. |
| Report contents | Brand ink | Soft-linen intro and soft-linen subsection bodies | Option 05 heading backdrop, centered all-caps headline, no heading intro, body copy outside the heading, and five numbered subsections instead of cards. Each subsection uses a pure-black number/title row with copper number and icy-slate title, then a consistent soft-linen body surface with hero-black text and copper check icons. Do not alternate subsection body backgrounds. |
| Bonuses | Clean white preview | Hero black body text | Option 05 heading backdrop, centered all-caps headline, no heading intro, and exactly two numbered subsections instead of cards. Each subsection uses a pure-black number/title row with copper number and icy-slate title, then a consistent soft-linen body surface with hero-black text. Strip the visible `Bonus #N -` prefix from the title row because the number already carries the bonus count. |
| Process | Clean white preview | Hero black body text | Option 05 heading backdrop, centered all-caps headline, no heading intro, and intro copy outside the heading. Use a clean editorial step flow, not a rail, card grid, subsection row, horizontal process, or arrow sequence. Each step order must be number + title first, image second, description third. The step number and title must use matching font size, weight, and line-height; number uses copper and title uses hero black. Descriptions use hero black at subheadline size with regular weight, not bold. Images sit in a soft-linen framed area without shadows. Process CTA and the note below it use the subheadline size token. |
| Reviews | Soft-linen preview | Hero black body text | Option 05 heading backdrop, centered all-caps headline only, and a single-column testimonial ledger. Do not use intro copy, cards, carousels, or number markers. Each review row starts with the client picture and name/meta, then five copper stars, then italic regular-weight hero-black quote text at subheadline size with subtle row dividers. |
| Final offer | Clean white preview | Hero black body text | Use the standard Option 05 heading backdrop like the rest of the editorial page, with centered all-caps headline text and icy-slate highlight words. The offer details below the heading must be one continuous clean flow, not a copper outer section with a black inner panel and not a two-column split. Supporting copy, included items, CTA, and delivery proof use the subheadline size token. Pointer labels should read like recommendations and remove leading numbers except `20 Outfit Ideas`. Price label reads `Today's Price`, uses subheadline size, and stays bold. Price uses `PRICE_LABEL` and stays bold. CTA stays copper, has no arrow icon, and uses a taller vertical button. Delivery proof uses separate relevant icons for delivery and lifetime access. |
| FAQ | FAQ ink with white answer surfaces | Linen questions, black answer text | Option 05 heading backdrop, centered all-caps headline only, one-column accordion ledger, copper open state, and white expanded answer panels. |
| Sticky buy bar | Hero black | Soft-linen text with copper CTA | Match `artifacts/sticky-buy-diagram.html`. Use a compact two-column layout: left details column contains `Today's Price`, `PRICE_LABEL`, and an inline `Ends In` + timer row; right column is the rectangular copper `Get My Report` CTA. Once the hero section has fully scrolled past, the sticky bar must remain visible for the rest of the page and must not hide when the final offer/purchase section enters view. On mobile, the CTA should stretch left enough to use the empty space, around 44% of the inner bar width, with only a tight gap from the details column. Button corners must be straight/low-radius, never pill-shaped. Add a subtle shimmer on the copper CTA and disable it under reduced-motion preferences. On mobile, do not right-align the timer into the lower corner. Sticky text must stay readable: desktop values around 26px to 28px, mobile price around 20px to 22px, mobile timer around 18px to 20px, and mobile CTA around 16px to 18px. Do not use a CTA arrow in the sticky bar. Reserve enough mobile bottom padding including `safe-area-inset-bottom`. |
| Footer | Ink | Linen | Minimal copper hover state. |

Final offer implementation rules:

- Scope final-offer styling through `.final-offer-section`; do not rely on broad `.final-offer`, `.price-line`, or `.delivery-proof` rules.
- Final offer headline must use the standard `.section-editorial-preview .section-heading` treatment and all-caps styling from CSS.
- Final offer body must stay as one clean flow. Do not create an inner black panel, copper outer block, side columns, or a two-portion grid.
- Supporting copy, included items, price label, CTA, and delivery proof use `--hero-subheadline-size`; do not shrink them to `--text-body`.
- Final CTA must pass `showIcon={false}` and use a taller vertical button.
- Delivery proof must show delivery and lifetime access as separate icon-labeled items.
- Regenerate `artifacts/AttractiveMen.html` with `./scripts/build-standalone.ps1` after changing the React or CSS source.

FAQ implementation rules:

- FAQ must use `section faq section-editorial-preview faq-editorial` so it gets the approved heading system while keeping the FAQ-specific dark surface.
- FAQ section background must stay `var(--palette-faq-ink)`.
- FAQ heading must use the standard Option 05 compact black backdrop, centered all-caps headline text, and icy-slate `<span>` accent.
- FAQ must not render an intro/support sentence under the heading unless specifically requested.
- FAQ layout must be one centered column. Do not use a sticky heading split, cards, carousel, grid of cards, or decorative image.
- FAQ rows must behave as an accordion ledger with left-aligned question and answer text.
- Question text must use `--hero-subheadline-size`, bold weight, and soft-linen color.
- Expanded answers must use a white `var(--palette-clean)` background, hero-black text, regular weight, and `--hero-subheadline-size`.
- Open FAQ state uses copper for the icon and active question emphasis.
- Use Plus/Minus icons for closed/open state. Do not use a rotating caret.

Good:

```css
.styleiq-hero {
  background: #161616;
  color: var(--color-page);
}
```

Bad:

```css
.styleiq-hero,
.section,
.final-offer {
  background: var(--color-page);
}
```

The bad example makes the page flat and removes the luxury contrast.

## Hero Direction

The Ink Luxury hero should be dark, spacious, and direct.

- Keep the approved H1 copy unchanged.
- Hero eyebrow copy must be `Dear Men`, render at 24px, use bold weight, and use the same color token as the primary CTA.
- Hero H1 must render around 28px on desktop and mobile.
- Hero subheadline must render around 24px on desktop and mobile.
- Hero CTA text and hero price/rate must use the same font-size token as the hero subheadline.
- Hero CTA must be text-only with no arrow icon.
- Hero price/rate text must read `Today's Price ₹1,999 + GST`.
- Hero price/rate must use the same silver-white color token as the H1.
- The hero must end at the CTA and price row. Trust badges sit outside the hero in a clean white proof band.
- Trust badges must use readable small text and render as a 2x2 grid on mobile.
- Hero H1 text must render in a silver-white tone: `#F2ECE8`.
- Hero H1 may use a restrained luminous text shadow based on the same silver-white token.
- On mobile, the hero H1 must be exactly three balanced centered lines: `Stop Guessing` / `What Actually Looks` / `Good On You`.
- Use a solid dark black hero background: `#050505`. Do not use gradients or sheen effects.
- Do not show a visible border or side frame line around the hero shell.
- Do not show the `Your Inputs` / `Your Style Plan` preview card in the hero.
- Do not show any report/product preview card, mockup stack, or right-side hero visual in the hero.
- Do not show the old hero benefits bullet list. Use one centered 3:4 before/after transformation block between the subheadline and CTA.
- Do not show a top navigation strip inside the hero.
- Use silver-white for the headline and linen for body copy.
- Use copper for the eyebrow, stylized emphasis, primary CTA, check icons, and report metric fills.
- Avoid beige cards floating inside beige sections.
- Avoid changing the headline just to insert stylized text.

Good hero CTA:

```css
.styleiq-hero .button {
  background: var(--color-accent);
  color: var(--color-ink);
  border-color: var(--color-accent);
}
```

Bad hero CTA:

```css
.styleiq-hero .button {
  background: transparent;
  color: var(--color-page);
}
```

The bad example lowers conversion clarity on the first screen.

## Typography

Use type hierarchy to make the page feel classy, not oversized everywhere.

| Element | Rule |
|---|---|
| Hero eyebrow | 24px, bold, CTA color token. |
| Hero H1 | 28px desktop and mobile, bold, tight but readable line-height. |
| Hero subheadline | 24px desktop and mobile, readable line-height. |
| Hero CTA and hero rate | 24px, same token as hero subheadline, bold. Hero rate uses H1 silver-white. |
| Section H2 | 42-56px desktop, 32-40px mobile, bold, max width around 820px. |
| Card H3 | 20-26px, bold, never hero-sized. |
| Body | 17-19px, 1.6 line-height. |
| Small labels | 12-13px uppercase, medium weight, letter spacing only if readable. |
| Other CTAs | 16-17px, bold, high contrast, stable height. |
| Final offer headline | Use the standard section headline backdrop rule, all caps via CSS. |
| Final offer support, included items, CTA, and delivery proof | 24px desktop and mobile, readable line-height, high contrast. |

Keep font-size rules tokenized in CSS. Do not scale text with viewport width only.

Good:

```css
:root {
  --heading-hero: clamp(2.5rem, 4.7vw, 4.75rem);
  --heading-section: clamp(2rem, 3.8vw, 3.5rem);
  --text-body: 1.0625rem;
}
```

Bad:

```css
h1 {
  font-size: 8vw;
}
```

The bad example can become too large on wide screens and too unstable across devices.

## Stylized Text

Stylized text is allowed, but it must support approved copy.

Use it for:

- Short existing phrases inside body copy.
- Section labels.
- Price emphasis.
- Pull quotes.
- Review highlights.

Do not use it to rewrite headlines.

Recommended treatment:

```css
.text-accent-italic {
  color: var(--color-accent);
  font-family: Georgia, "Times New Roman", serif;
  font-style: italic;
  font-weight: 700;
}
```

Good:

```jsx
<p>
  You need better decisions about the clothes, grooming, and style choices you already make.
</p>
```

Bad:

```jsx
<p>
  You need <span className="text-accent-italic">luxury certainty</span> in every outfit.
</p>
```

The bad example invents copy that was not approved.

## Skimmable Section Copy

Apply this rule to every content-heavy section after the hero. The goal is that a reader can skim the section and still understand the main impact without reading every word.

Core rules:

- Keep approved copy unchanged unless the user asks for a copy pass.
- Use one sentence per paragraph when the section is narrative or objection-led.
- Use the section's highest-contrast text token for body copy. On clean white editorial sections, use `var(--palette-hero-black)`.
- Choose 1-2 impact phrases per cluster for emphasis. Do not emphasize every noun.
- Use uppercase only for short existing words or phrases, such as `HAIRCUT`, `TROUSERS`, `WORKS`, `TERRIBLE`, or `WHAT LOOKS GOOD ON YOU`.
- Use underline only for the sharpest contrast idea in a cluster, with `var(--palette-accent)` as the underline color.
- Question lists should stay as complete readable sentences. Do not split a question into multiple inline fragments just to style one word.
- Question rows may be bold, but they should remain black or the section's highest-contrast text color.
- Do not use new colors for emphasis. Use approved tokens only.
- Avoid letter spacing on long phrases. Keep uppercase emphasis short enough to read on mobile.

Good:

```jsx
<p>You copy a <strong className="problem-emphasis problem-emphasis-caps">haircut</strong> that looked great on someone else.</p>
<p>Sometimes it looks <span className="problem-emphasis problem-emphasis-caps problem-emphasis-underlined">terrible</span>.</p>
<li><span>Will this suit my face?</span></li>
```

Good:

```css
.section-editorial-copy {
  color: var(--palette-hero-black);
  font-size: var(--hero-subheadline-size);
  line-height: 1.38;
}

.section-editorial-copy strong {
  color: var(--palette-hero-black);
  font-weight: var(--weight-bold);
  text-transform: uppercase;
}
```

Bad:

```jsx
<li>
  <span>Will this suit my <strong>face</strong>?</span>
</li>
```

The bad example can create broken mobile wrapping like `face` and `?` appearing on separate lines.

Bad:

```css
.section-copy strong {
  color: #ad7c4f;
}
```

The bad example introduces a new unapproved emphasis color.

## Layout Rules

- Use full-width section bands with constrained inner shells.
- Keep page shells between `1120px` and `1240px`.
- Use `72px` to `112px` vertical rhythm on desktop.
- Use `44px` to `72px` vertical rhythm on mobile.
- Use `24px` to `36px` grid gaps on desktop.
- Use `16px` to `24px` grid gaps on mobile.
- Cards should be `8px` radius unless a current component already uses a defined radius.
- Do not put cards inside cards.
- Keep CTAs aligned with the reading path.
- Keep the first viewport focused on brand, headline, before/after proof, CTA, and trust proof.

## Text Alignment Rules

- Every section must have one clear text axis: left-aligned or centered. Do not mix both inside the same section unless the layout is a deliberate split.
- Headline, subheadline, body copy, supporting bullets, and CTA must align to the same axis within a section.
- Centered headlines and hero subheadlines must be visually balanced from both sides, using intentional line breaks plus `text-wrap: balance` where supported.
- Desktop default: use left alignment for narrative, comparison, report, process, FAQ, and offer sections where users are reading or scanning details.
- Center alignment is allowed only for intentional presentation moments: compact section headings, testimonials, recap blocks, or CTA-only bands.
- Mobile may center a section only if every text element in that section also centers consistently; otherwise keep the same left reading axis from desktop.
- Cards, FAQ rows, labels, and form controls may use local alignment rules, but their text must still feel attached to the section grid.
- Avoid isolated text that floats without sharing the section's left edge, center axis, max width, and spacing rhythm.
- Avoid `text-align: justify`; do not create stretched word spacing to fake side alignment.

Recommended spacing tokens:

```css
:root {
  --content-wide: 1180px;
  --content-medium: 920px;
  --section-y: clamp(4.5rem, 8vw, 7rem);
  --section-y-compact: clamp(3rem, 6vw, 5rem);
  --gap-grid: clamp(1.25rem, 3vw, 2.25rem);
  --card-padding: clamp(1.25rem, 2.5vw, 2rem);
}
```

## Components

### Buttons

- Primary on dark: copper background, ink text.
- Primary on light: ink or deep background, linen text.
- Secondary on dark: transparent, linen text, taupe border.
- Secondary on light: transparent, ink text, taupe border.
- Hover should deepen contrast, not introduce new colors.

### Cards

- Dark section cards should use translucent linen or deep surfaces.
- Light section cards should use linen/taupe tints with ink text.
- Icons should use copper or deep, not random colors.
- Cards need consistent padding, border, radius, and hover treatment.

### Icons

- Use the existing icon library.
- Keep icon sizes consistent within a section.
- Use copper for attention and deep/slate for structure.
- Do not create custom SVGs for common UI symbols when an icon exists.

### Forms And Checkout

- Use high contrast inputs.
- Keep focus states visible with copper or deep.
- Error text must remain readable on both dark and light surfaces.
- Payment CTAs should be visually primary.

## Production Readiness Checklist

Before shipping an Ink Luxury page:

- Approved copy is unchanged.
- The hero uses ink/deep with linen text.
- Primary CTA is copper and clearly visible.
- Section backgrounds alternate intentionally.
- All colors come from the six-color palette or `color-mix()`.
- Headings, body text, cards, and CTAs use shared tokens.
- Mobile text does not overflow buttons, cards, or hero bounds.
- Images are visible, not overly dark or cropped beyond usefulness.
- `npm test` passes.
- `npm run build` passes.
- `git diff --check` passes.
