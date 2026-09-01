import assert from "node:assert/strict";
import test from "node:test";
import { css } from "./landing-test-utils.js";

test("landing hero typography keeps its mobile-safe emphasis", () => {
  assert.match(css, /--hero-eyebrow-size: 1\.5rem;/);
  assert.match(css, /--hero-headline-size: 1\.75rem;/);
  assert.match(css, /--hero-subheadline-size: 1\.5rem;/);
  assert.match(css, /\.styleiq-hero\s*{[^}]*padding-block: 0;[^}]*background: var\(--hero-bg\);/s);
  assert.match(css, /\.styleiq-hero \.hero-eyebrow\s*{[^}]*font-size: var\(--hero-eyebrow-size\);[^}]*font-weight: var\(--weight-bold\);/s);
  assert.match(css, /\.styleiq-hero h1\s*{[^}]*font-size: var\(--hero-headline-size\);[^}]*font-weight: var\(--weight-bold\);[^}]*text-align: center;[^}]*text-wrap: balance;/s);
  assert.match(css, /\.styleiq-hero \.hero-lead\s*{[^}]*font-size: var\(--hero-subheadline-size\);[^}]*text-align: center;[^}]*text-wrap: balance;/s);
  assert.match(css, /\.hero-image\s*{[^}]*aspect-ratio: 1 \/ 1;/s);
  assert.match(css, /\.hero-image img\s*{[^}]*height: 100%;[^}]*object-fit: cover;/s);
  assert.match(css, /\.hero-action-row > span\s*{[^}]*color: var\(--palette-soft-linen\);[^}]*font-size: var\(--hero-subheadline-size\);[^}]*font-weight: var\(--weight-bold\);/s);
});

test("trust strip and sticky buy bar keep the approved conversion layout", () => {
  assert.match(css, /\.trust-section\s*{[^}]*margin-bottom: -1px;[^}]*border: 0;[^}]*background: var\(--palette-clean\);[^}]*color: var\(--palette-ink\);[^}]*box-shadow: none;[^}]*outline: 0;/s);
  assert.match(css, /\.trust-badges span\s*{[^}]*font-size: clamp\(1rem, 0\.95rem \+ 0\.2vw, 1\.125rem\);[^}]*font-weight: var\(--weight-bold\);[^}]*letter-spacing: 0\.03em;[^}]*text-align: center;[^}]*text-transform: uppercase;/s);
  assert.match(css, /\.sticky-buy-bar\s*{[^}]*position: fixed;[^}]*bottom: 0;[^}]*background: var\(--palette-hero-black\);/s);
  assert.match(css, /\.sticky-buy-inner\s*{[^}]*grid-template-columns: minmax\(0, 1fr\) minmax\(180px, 260px\);/s);
  assert.match(css, /\.sticky-buy-countdown\s*{[^}]*min-width: 8ch;[^}]*text-align: right;/s);
  assert.match(css, /\.sticky-buy-countdown time\s*{[^}]*min-width: 8ch;[^}]*font-variant-numeric: tabular-nums;/s);
  assert.match(css, /\.sticky-buy-button\s*{[^}]*min-width: 180px;[^}]*min-height: 58px;[^}]*border-radius: 2px;[^}]*background: var\(--palette-accent\);[^}]*font-size: 20px;/s);
  assert.match(css, /\.sticky-buy-button::before\s*{[^}]*animation: sticky-button-shimmer 3\.2s ease-in-out infinite;/s);
  assert.match(css, /@media \(max-width: 720px\)\s*{[\s\S]*\.trust-badges\s*{[^}]*grid-template-columns: repeat\(2, minmax\(0, 160px\)\);/s);
  assert.match(css, /@media \(max-width: 720px\)\s*{[\s\S]*\.sticky-buy-inner\s*{[^}]*grid-template-columns: minmax\(0, 1fr\) minmax\(142px, 44%\);/s);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)\s*{[\s\S]*\.sticky-buy-button::before\s*{[^}]*display: none;/s);
});

test("section heading backdrop follows the approved option 5 treatment", () => {
  assert.doesNotMatch(css, /\.section-break/);
  assert.match(css, /\.section-editorial-preview\s*{[^}]*background: var\(--palette-clean\);[^}]*color: var\(--palette-ink\);/s);
  assert.match(css, /\.section-editorial-preview \.section-heading\s*{[^}]*padding: 22px clamp\(18px, 5vw, 58px\);[^}]*background: linear-gradient\(90deg, var\(--palette-hero-black\) 0 64%, var\(--palette-heading-split\) 64% 100%\);/s);
  assert.match(css, /\.section-editorial-preview \.section-heading h2\s*{[^}]*font-size: var\(--hero-headline-size\);[^}]*font-weight: var\(--weight-bold\);[^}]*line-height: 1\.08;/s);
  assert.match(css, /\.section-editorial-preview \.section-heading h2 span\s*{[^}]*color: var\(--palette-ice-slate\);/s);
});
