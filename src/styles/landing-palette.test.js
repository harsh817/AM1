import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const paletteHexes = new Set([
  "#d3c3b9",
  "#161616",
  "#050505",
  "#10232a",
  "#b58863",
  "#3d4d55",
  "#b9cbd0",
  "#f2ece8",
  "#0e0e0e",
  "#ffffff",
  "#202020",
  "#2a2a2a",
]);
const requiredSystemTokens = [
  "--text-eyebrow",
  "--text-body",
  "--text-lead",
  "--heading-section",
  "--heading-hero",
  "--heading-card",
  "--hero-eyebrow-size",
  "--hero-headline-size",
  "--hero-subheadline-size",
  "--weight-regular",
  "--weight-medium",
  "--weight-semibold",
  "--weight-bold",
  "--section-y",
  "--section-y-compact",
  "--content-wide",
  "--content-medium",
  "--content-narrow",
  "--gap-section",
  "--gap-grid",
  "--gap-card",
  "--card-padding",
  "--card-radius",
  "--transition-standard",
];
const css = readFileSync(new URL("./landing.css", import.meta.url), "utf8");

test("landing stylesheet uses the Ink Luxury palette", () => {
  for (const color of paletteHexes) {
    assert.ok(css.includes(color), `missing palette color ${color}`);
    assert.equal(css.match(new RegExp(color, "gi"))?.length, 1, `${color} should only be declared once`);
  }

  const hexColors = [...css.matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map(([color]) => color.toLowerCase());
  const offPaletteHexes = [...new Set(hexColors.filter((color) => !paletteHexes.has(color)))];

  assert.deepEqual(offPaletteHexes, []);
  assert.doesNotMatch(css, /\brgba?\(\s*\d/i);
  assert.doesNotMatch(css, /(^|[\s(:,])(?:white|black)(?=[\s;),}]|$)/i);
});

test("landing stylesheet exposes coherent type, spacing, and motion tokens", () => {
  for (const token of requiredSystemTokens) {
    assert.match(css, new RegExp(`${token}:`), `missing design-system token ${token}`);
  }

  assert.match(css, /\.section\s*{[^}]*padding-block: var\(--section-y\);/s);
  assert.match(css, /\.section-heading h2,[^}]*font-size: var\(--heading-section\);/s);
  assert.match(css, /\.button\s*{[^}]*min-height: var\(--button-height\);/s);
});

test("landing hero typography keeps its mobile-safe emphasis", () => {
  assert.match(css, /--hero-eyebrow-size: 1\.5rem;/);
  assert.match(css, /--hero-headline-size: 1\.75rem;/);
  assert.match(css, /--hero-subheadline-size: 1\.5rem;/);
  assert.match(
    css,
    /\.styleiq-hero \.hero-eyebrow\s*{[^}]*font-size: var\(--hero-eyebrow-size\);[^}]*font-weight: var\(--weight-bold\);/s,
  );
  assert.match(
    css,
    /\.styleiq-hero h1\s*{[^}]*font-size: var\(--hero-headline-size\);[^}]*font-weight: var\(--weight-bold\);[^}]*text-align: center;[^}]*text-wrap: balance;/s,
  );
  assert.match(
    css,
    /\.styleiq-hero \.hero-lead\s*{[^}]*font-size: var\(--hero-subheadline-size\);[^}]*text-align: center;[^}]*text-wrap: balance;/s,
  );
  assert.match(
    css,
    /\.styleiq-hero \.button\s*{[^}]*font-size: var\(--hero-subheadline-size\);[^}]*font-weight: var\(--weight-bold\);/s,
  );
  assert.match(css, /\.styleiq-hero\s*{[^}]*padding-block: 0;[^}]*background: var\(--hero-bg\);/s);
  assert.match(
    css,
    /\.hero-action-row > span\s*{[^}]*color: var\(--palette-soft-linen\);[^}]*font-size: var\(--hero-subheadline-size\);[^}]*font-weight: var\(--weight-bold\);/s,
  );
  assert.match(
    css,
    /\.trust-section\s*{[^}]*margin-bottom: -1px;[^}]*border: 0;[^}]*background: var\(--palette-clean\);[^}]*color: var\(--palette-ink\);[^}]*box-shadow: none;[^}]*outline: 0;/s,
  );
  assert.match(
    css,
    /\.trust-badges\s*{[^}]*width: min\(100%, 620px\);[^}]*background: var\(--palette-clean\);/s,
  );
  assert.match(
    css,
    /\.trust-badges span\s*{[^}]*background: color-mix\(in srgb, var\(--palette-clean\) 92%, var\(--palette-background\)\);[^}]*color: var\(--palette-ink\);/s,
  );
  assert.match(
    css,
    /\.trust-badges span\s*{[^}]*font-size: clamp\(1rem, 0\.95rem \+ 0\.2vw, 1\.125rem\);[^}]*font-weight: var\(--weight-bold\);[^}]*letter-spacing: 0\.03em;[^}]*text-align: center;[^}]*text-transform: uppercase;/s,
  );
  assert.match(
    css,
    /@media \(max-width: 720px\)\s*{[\s\S]*\.trust-badges\s*{[^}]*display: grid;[^}]*grid-template-columns: repeat\(2, minmax\(0, 160px\)\);[^}]*justify-content: center;/s,
  );
});

test("sticky buy bar uses the approved two-column rectangle CTA layout", () => {
  assert.match(
    css,
    /\.sticky-buy-bar\s*{[^}]*position: fixed;[^}]*bottom: 0;[^}]*border-top: 1px solid rgba\(var\(--palette-soft-linen-rgb\), 0\.16\);[^}]*background: var\(--palette-hero-black\);/s,
  );
  assert.match(
    css,
    /\.sticky-buy-inner\s*{[^}]*width: min\(calc\(100% - 48px\), var\(--shell\)\);[^}]*min-height: 86px;[^}]*display: grid;[^}]*grid-template-columns: minmax\(0, 1fr\) minmax\(180px, 260px\);[^}]*align-items: center;/s,
  );
  assert.match(
    css,
    /\.sticky-buy-details\s*{[^}]*display: grid;[^}]*grid-template-columns: minmax\(0, max-content\) max-content;[^}]*align-items: center;/s,
  );
  assert.match(
    css,
    /\.sticky-buy-button\s*{[^}]*min-width: 180px;[^}]*min-height: 58px;[^}]*position: relative;[^}]*overflow: hidden;[^}]*border-radius: 2px;[^}]*background: var\(--palette-accent\);[^}]*color: var\(--palette-ink\);[^}]*font-size: 20px;/s,
  );
  assert.match(
    css,
    /\.sticky-buy-button::before\s*{[^}]*background: linear-gradient\([^}]*rgba\(var\(--palette-soft-linen-rgb\), 0\.32\)[^}]*animation: sticky-button-shimmer 3\.2s ease-in-out infinite;/s,
  );
  assert.match(
    css,
    /@keyframes sticky-button-shimmer\s*{[\s\S]*transform: translateX\(-130%\);[\s\S]*transform: translateX\(130%\);[\s\S]*}/s,
  );
  assert.match(
    css,
    /@media \(max-width: 720px\)\s*{[\s\S]*\.sticky-buy-bar\s*{[^}]*padding: 8px 0 calc\(8px \+ env\(safe-area-inset-bottom\)\);[^}]*}[\s\S]*\.sticky-buy-inner\s*{[^}]*width: calc\(100% - 12px\);[^}]*min-height: 90px;[^}]*grid-template-columns: minmax\(0, 1fr\) minmax\(142px, 44%\);[^}]*gap: 6px;[^}]*}/s,
  );
  assert.match(
    css,
    /@media \(max-width: 720px\)\s*{[\s\S]*\.sticky-buy-details\s*{[^}]*display: block;[^}]*}[\s\S]*\.sticky-buy-countdown\s*{[^}]*display: flex;[^}]*align-items: baseline;[^}]*gap: 6px;[^}]*margin-top: 10px;[^}]*text-align: left;[^}]*}[\s\S]*\.sticky-buy-button\s*{[^}]*width: 100%;[^}]*min-width: 0;[^}]*min-height: 78px;[^}]*font-size: clamp\(16px, 4\.6vw, 18px\);[^}]*}[\s\S]*body\.has-sticky-buy\s*{[^}]*padding-bottom: calc\(108px \+ env\(safe-area-inset-bottom\)\);/s,
  );
  assert.match(
    css,
    /@media \(prefers-reduced-motion: reduce\)\s*{[\s\S]*\.sticky-buy-button::before\s*{[^}]*display: none;[^}]*}/s,
  );
});

test("post-hero editorial preview uses the selected option 5 heading backdrop", () => {
  assert.match(css, /--palette-clean: #ffffff;/);
  assert.doesNotMatch(css, /\.section-break/);
  assert.match(
    css,
    /\.section-editorial-preview\s*{[^}]*background: var\(--palette-clean\);[^}]*color: var\(--palette-ink\);/s,
  );
  assert.match(
    css,
    /\.section-editorial-preview \.section-heading\s*{[^}]*padding: 22px clamp\(18px, 5vw, 58px\);[^}]*background: linear-gradient\(90deg, var\(--palette-hero-black\) 0 64%, var\(--palette-heading-split\) 64% 100%\);[^}]*color: var\(--palette-soft-linen\);/s,
  );
  assert.doesNotMatch(css, /\.section-editorial-preview \.section-heading::before/);
  assert.doesNotMatch(css, /\.section-editorial-preview \.section-heading::after/);
  assert.match(
    css,
    /\.section-editorial-preview \.section-heading h2\s*{[^}]*color: var\(--palette-soft-linen\);[^}]*font-size: var\(--hero-headline-size\);[^}]*font-weight: var\(--weight-bold\);[^}]*line-height: 1\.08;/s,
  );
  assert.match(
    css,
    /\.section-editorial-preview \.section-heading h2 span\s*{[^}]*color: var\(--palette-ice-slate\);/s,
  );
  assert.doesNotMatch(css, /text-stroke: 1\.4px var\(--palette-accent\);/);
});

test("problem editorial section keeps left-aligned black subheadline copy", () => {
  assert.match(
    css,
    /\.problem-editorial \.problem-copy\s*{[^}]*color: var\(--palette-hero-black\);[^}]*font-size: var\(--hero-subheadline-size\);[^}]*line-height: 1\.38;[^}]*text-align: left;/s,
  );
  assert.match(
    css,
    /\.problem-editorial \.problem-copy p,[\s\S]*\.problem-editorial \.problem-copy em,[\s\S]*\.problem-editorial \.problem-copy strong,[\s\S]*\.problem-editorial \.problem-bullets span\s*{[^}]*color: var\(--palette-hero-black\);/s,
  );
  assert.match(
    css,
    /\.problem-editorial \.problem-bullets li\s*{[^}]*grid-template-columns: 9px minmax\(0, 1fr\);[^}]*gap: 12px;/s,
  );
  assert.match(
    css,
    /\.problem-editorial \.problem-bullets strong\s*{[^}]*display: inline;[^}]*margin: 0;/s,
  );
  assert.match(
    css,
    /\.problem-editorial \.problem-bullets li span\s*{[^}]*grid-column: 2;[^}]*grid-row: 1;[^}]*font-weight: var\(--weight-bold\);[^}]*text-wrap: pretty;/s,
  );
  assert.match(
    css,
    /\.problem-editorial \.problem-emphasis\s*{[^}]*color: var\(--palette-hero-black\);[^}]*font-weight: var\(--weight-bold\);/s,
  );
  assert.match(
    css,
    /\.problem-editorial \.problem-emphasis-caps\s*{[^}]*letter-spacing: 0\.04em;[^}]*text-transform: uppercase;/s,
  );
  assert.match(
    css,
    /\.problem-editorial \.problem-emphasis-underlined\s*{[^}]*font-weight: var\(--weight-bold\);[^}]*text-decoration-line: underline;[^}]*text-decoration-color: var\(--palette-accent\);/s,
  );
});

test("waste section uses skimmable high-contrast copy rules", () => {
  assert.match(
    css,
    /\.waste-section\s*{[^}]*color: var\(--palette-hero-black\);/s,
  );
  assert.match(
    css,
    /\.problem-editorial \+ \.waste-editorial\s*{[^}]*margin-top: -1px;/s,
  );
  assert.match(
    css,
    /\.waste-editorial\s*{[^}]*border-top: 0;[^}]*background: var\(--palette-clean\);[^}]*color: var\(--palette-hero-black\);[^}]*box-shadow: none;/s,
  );
  assert.match(
    css,
    /\.waste-editorial \.section-heading h2\s*{[^}]*color: var\(--palette-soft-linen\);[^}]*text-align: center;[^}]*text-transform: uppercase;/s,
  );
  assert.match(
    css,
    /\.waste-editorial \.section-heading h2 span\s*{[^}]*color: var\(--palette-ice-slate\);/s,
  );
  assert.match(
    css,
    /\.waste-section \.copy-stack\s*{[^}]*max-width: var\(--content-narrow\);[^}]*gap: 18px;[^}]*color: var\(--palette-hero-black\);[^}]*font-size: var\(--hero-subheadline-size\);[^}]*line-height: 1\.38;/s,
  );
  assert.match(
    css,
    /\.waste-editorial \.copy-stack\s*{[^}]*margin-inline: auto;[^}]*text-align: left;/s,
  );
  assert.match(
    css,
    /\.waste-section \.copy-stack p,[\s\S]*\.waste-section \.copy-stack strong,[\s\S]*\.waste-section \.copy-stack span\s*{[^}]*color: var\(--palette-hero-black\);/s,
  );
  assert.match(
    css,
    /\.waste-section \.copy-stack p\s*{[^}]*text-wrap: pretty;/s,
  );
  assert.match(
    css,
    /\.waste-section \.waste-emphasis\s*{[^}]*color: var\(--palette-hero-black\);[^}]*font-weight: var\(--weight-bold\);/s,
  );
  assert.match(
    css,
    /\.waste-section \.waste-emphasis-caps\s*{[^}]*letter-spacing: 0\.04em;[^}]*text-transform: uppercase;/s,
  );
  assert.match(
    css,
    /\.waste-section \.waste-emphasis-underlined\s*{[^}]*font-weight: var\(--weight-bold\);[^}]*text-decoration-line: underline;[^}]*text-decoration-color: var\(--palette-accent\);/s,
  );
});

test("you-first section uses editorial skimmable high-contrast copy rules", () => {
  assert.match(
    css,
    /\.waste-editorial \+ \.you-first-editorial\s*{[^}]*margin-top: -1px;/s,
  );
  assert.match(
    css,
    /\.you-first-editorial\s*{[^}]*border-top: 0;[^}]*background: var\(--palette-clean\);[^}]*color: var\(--palette-hero-black\);[^}]*box-shadow: none;/s,
  );
  assert.match(
    css,
    /\.you-first-editorial \.section-heading h2\s*{[^}]*color: var\(--palette-soft-linen\);[^}]*text-align: center;[^}]*text-transform: uppercase;/s,
  );
  assert.match(
    css,
    /\.you-first-editorial \.section-heading h2 span\s*{[^}]*color: var\(--palette-ice-slate\);/s,
  );
  assert.match(
    css,
    /\.you-first-section \.copy-stack\s*{[^}]*max-width: var\(--content-narrow\);[^}]*gap: 18px;[^}]*color: var\(--palette-hero-black\);[^}]*font-size: var\(--hero-subheadline-size\);[^}]*line-height: 1\.38;/s,
  );
  assert.match(
    css,
    /\.you-first-editorial \.copy-stack\s*{[^}]*margin-inline: auto;[^}]*text-align: left;/s,
  );
  assert.match(
    css,
    /\.you-first-section \.copy-stack p,[\s\S]*\.you-first-section \.copy-stack strong,[\s\S]*\.you-first-section \.copy-stack span\s*{[^}]*color: var\(--palette-hero-black\);/s,
  );
  assert.match(
    css,
    /\.you-first-section \.you-first-quote-stack,[\s\S]*\.you-first-section \.you-first-feature-stack\s*{[^}]*display: grid;[^}]*gap: 8px;[^}]*color: var\(--palette-hero-black\);/s,
  );
  assert.match(
    css,
    /\.you-first-section \.you-first-quote-stack p,[\s\S]*\.you-first-section \.you-first-feature-stack p\s*{[^}]*font-weight: var\(--weight-bold\);/s,
  );
  assert.match(
    css,
    /\.you-first-transformation-stack\s*{[^}]*display: grid;[^}]*gap: 30px;[^}]*width: 100%;[^}]*margin: 12px 0 4px;/s,
  );
  assert.match(
    css,
    /\.you-first-transformation-item\s*{[^}]*display: grid;[^}]*gap: 12px;[^}]*width: 100%;/s,
  );
  assert.match(
    css,
    /\.you-first-transformation-persona\s*{[^}]*color: var\(--palette-hero-black\);/s,
  );
  assert.match(
    css,
    /\.you-first-transformation-persona p\s*{[^}]*margin: 0;[^}]*color: var\(--palette-hero-black\);[^}]*font-size: var\(--hero-subheadline-size\);[^}]*font-weight: var\(--weight-regular\);[^}]*line-height: 1\.38;[^}]*text-wrap: pretty;/s,
  );
  assert.match(
    css,
    /\.you-first-transformation-persona strong\s*{[^}]*color: var\(--palette-hero-black\);[^}]*font-weight: var\(--weight-bold\);[^}]*text-decoration-line: underline;[^}]*text-decoration-color: var\(--palette-accent\);/s,
  );
  assert.doesNotMatch(css, /you-first-transformation-avatar|you-first-transformation-copy/);
  assert.match(
    css,
    /\.you-first-transformation-frame\s*{[^}]*position: relative;[^}]*width: 100%;[^}]*margin: 0;[^}]*overflow: hidden;[^}]*border: 1px solid rgba\(var\(--palette-ink-rgb\), 0\.12\);[^}]*background: var\(--palette-soft-linen\);/s,
  );
  assert.match(
    css,
    /\.you-first-transformation-frame img\s*{[^}]*display: block;[^}]*width: 100%;[^}]*height: auto;/s,
  );
  assert.match(
    css,
    /\.you-first-transformation-divider\s*{[^}]*position: absolute;[^}]*top: 0;[^}]*bottom: 0;[^}]*left: 50%;[^}]*width: 2px;[^}]*background: var\(--palette-clean\);/s,
  );
  assert.match(
    css,
    /\.you-first-section \.copy-stack \.you-first-transformation-label\s*{[^}]*position: absolute;[^}]*top: 12px;[^}]*background: var\(--palette-hero-black\);[^}]*color: var\(--palette-soft-linen\);[^}]*text-transform: uppercase;/s,
  );
  assert.match(
    css,
    /\.you-first-section \.copy-stack \.you-first-transformation-label-after\s*{[^}]*right: 12px;[^}]*background: var\(--palette-accent\);[^}]*color: var\(--palette-hero-black\);/s,
  );
  assert.doesNotMatch(
    css,
    /\.transformation-showcase|\.transformation-carousel|\.transformation-viewport|\.transformation-track|\.transformation-slide|\.transformation-arrow|\.transformation-dots/s,
  );
  assert.match(
    css,
    /\.you-first-section \.you-first-emphasis-caps\s*{[^}]*letter-spacing: 0\.04em;[^}]*text-transform: uppercase;/s,
  );
  assert.match(
    css,
    /\.you-first-section \.you-first-emphasis-underlined\s*{[^}]*font-weight: var\(--weight-bold\);[^}]*text-decoration-line: underline;[^}]*text-decoration-color: var\(--palette-accent\);/s,
  );
});

test("professional styling section uses editorial skimmable high-contrast copy rules", () => {
  assert.match(
    css,
    /\.you-first-editorial \+ \.professional-styling-editorial\s*{[^}]*margin-top: -1px;/s,
  );
  assert.match(
    css,
    /\.professional-styling-editorial\s*{[^}]*border-top: 0;[^}]*background: var\(--palette-clean\);[^}]*color: var\(--palette-hero-black\);[^}]*box-shadow: none;/s,
  );
  assert.match(
    css,
    /\.professional-styling-editorial \.section-heading h2\s*{[^}]*color: var\(--palette-soft-linen\);[^}]*text-align: center;[^}]*text-transform: uppercase;/s,
  );
  assert.match(
    css,
    /\.professional-styling-editorial \.section-heading h2 span\s*{[^}]*color: var\(--palette-ice-slate\);/s,
  );
  assert.match(
    css,
    /\.professional-styling-section \.copy-stack\s*{[^}]*max-width: var\(--content-narrow\);[^}]*gap: 18px;[^}]*color: var\(--palette-hero-black\);[^}]*font-size: var\(--hero-subheadline-size\);[^}]*line-height: 1\.38;/s,
  );
  assert.match(
    css,
    /\.professional-styling-editorial \.copy-stack\s*{[^}]*margin-inline: auto;[^}]*text-align: left;/s,
  );
  assert.match(
    css,
    /\.professional-styling-section \.copy-stack p,[\s\S]*\.professional-styling-section \.copy-stack strong,[\s\S]*\.professional-styling-section \.copy-stack span\s*{[^}]*color: var\(--palette-hero-black\);/s,
  );
  assert.match(
    css,
    /\.professional-styling-section \.professional-styling-reason-stack\s*{[^}]*display: grid;[^}]*gap: 8px;[^}]*color: var\(--palette-hero-black\);/s,
  );
  assert.match(
    css,
    /\.professional-styling-section \.professional-styling-reason-stack p\s*{[^}]*font-weight: var\(--weight-bold\);/s,
  );
  assert.match(
    css,
    /\.professional-styling-section \.copy-stack p\s*{[^}]*text-wrap: pretty;/s,
  );
  assert.match(
    css,
    /\.professional-styling-section \.professional-styling-emphasis\s*{[^}]*color: var\(--palette-hero-black\);[^}]*font-weight: var\(--weight-bold\);/s,
  );
  assert.match(
    css,
    /\.professional-styling-section \.professional-styling-emphasis-underlined\s*{[^}]*font-weight: var\(--weight-bold\);[^}]*text-decoration-line: underline;[^}]*text-decoration-color: var\(--palette-accent\);/s,
  );
});

test("styleiq system section uses editorial black subsection rules", () => {
  assert.match(
    css,
    /\.professional-styling-editorial \+ \.styleiq-editorial\s*{[^}]*margin-top: -1px;/s,
  );
  assert.match(
    css,
    /\.styleiq-editorial\s*{[^}]*border-top: 0;[^}]*background: var\(--palette-clean\);[^}]*color: var\(--palette-hero-black\);[^}]*box-shadow: none;/s,
  );
  assert.match(
    css,
    /\.styleiq-editorial \.section-heading h2\s*{[^}]*color: var\(--palette-soft-linen\);[^}]*text-align: center;[^}]*text-transform: uppercase;/s,
  );
  assert.match(
    css,
    /\.styleiq-editorial \.section-heading h2 span\s*{[^}]*color: var\(--palette-ice-slate\);/s,
  );
  assert.match(
    css,
    /\.styleiq-editorial \.styleiq-system-copy\s*{[^}]*max-width: var\(--content-narrow\);[^}]*margin-inline: auto;[^}]*gap: 18px;[^}]*color: var\(--palette-hero-black\);[^}]*font-size: var\(--hero-subheadline-size\);[^}]*line-height: 1\.38;[^}]*text-align: left;/s,
  );
  assert.match(
    css,
    /\.styleiq-editorial \.styleiq-system-copy p,[\s\S]*\.styleiq-editorial \.styleiq-judgment\s*{[^}]*color: var\(--palette-hero-black\);[^}]*text-wrap: pretty;/s,
  );
  assert.match(
    css,
    /\.styleiq-subsections\s*{[^}]*display: grid;[^}]*gap: 14px;[^}]*width: min\(100%, var\(--content-narrow\)\);[^}]*margin: var\(--gap-section\) auto;/s,
  );
  assert.match(
    css,
    /\.styleiq-subsection\s*{[^}]*background: var\(--palette-clean\);[^}]*color: var\(--palette-hero-black\);[^}]*text-align: center;/s,
  );
  assert.match(
    css,
    /\.styleiq-subsection-heading\s*{[^}]*display: flex;[^}]*flex-wrap: nowrap;[^}]*align-items: center;[^}]*justify-content: center;[^}]*background: var\(--palette-hero-black\);[^}]*color: var\(--palette-soft-linen\);[^}]*text-align: center;/s,
  );
  assert.match(
    css,
    /\.styleiq-subsection-heading small\s*{[^}]*flex: 0 0 auto;[^}]*color: var\(--palette-accent\);[^}]*font-size: clamp\(22px, 4vw, 28px\);[^}]*font-weight: var\(--weight-bold\);/s,
  );
  assert.match(
    css,
    /\.styleiq-subsection-heading h3\s*{[^}]*min-width: 0;[^}]*color: var\(--palette-ice-slate\);[^}]*font-size: clamp\(22px, 4vw, 28px\);[^}]*font-weight: var\(--weight-bold\);/s,
  );
  assert.match(
    css,
    /\.styleiq-subsection p\s*{[^}]*padding: 18px clamp\(18px, 4vw, 28px\) 22px;[^}]*color: var\(--palette-hero-black\);[^}]*font-size: var\(--hero-subheadline-size\);[^}]*line-height: 1\.38;[^}]*text-align: left;/s,
  );
  assert.match(
    css,
    /\.styleiq-editorial \.styleiq-judgment\s*{[^}]*width: min\(100%, var\(--content-narrow\)\);[^}]*margin: 0 auto;[^}]*font-size: var\(--hero-subheadline-size\);[^}]*font-weight: var\(--weight-bold\);[^}]*line-height: 1\.38;[^}]*text-align: left;/s,
  );
});

test("comparison section uses two editorial subsections instead of paired cards", () => {
  assert.match(
    css,
    /\.styleiq-editorial \+ \.comparison-editorial\s*{[^}]*margin-top: -1px;/s,
  );
  assert.match(
    css,
    /\.comparison-editorial\s*{[^}]*border-top: 0;[^}]*background: var\(--palette-clean\);[^}]*color: var\(--palette-hero-black\);[^}]*box-shadow: none;/s,
  );
  assert.match(
    css,
    /\.comparison-editorial \.section-heading h2\s*{[^}]*color: var\(--palette-soft-linen\);[^}]*text-align: center;[^}]*text-transform: uppercase;/s,
  );
  assert.match(
    css,
    /\.comparison-editorial \.section-heading h2 span\s*{[^}]*color: var\(--palette-ice-slate\);/s,
  );
  assert.match(
    css,
    /\.comparison-editorial \.comparison-copy\s*{[^}]*max-width: var\(--content-narrow\);[^}]*margin-inline: auto;[^}]*gap: 18px;[^}]*color: var\(--palette-hero-black\);[^}]*font-size: var\(--hero-subheadline-size\);[^}]*line-height: 1\.38;[^}]*text-align: left;/s,
  );
  assert.match(
    css,
    /\.comparison-subsections\s*{[^}]*display: grid;[^}]*grid-template-columns: repeat\(auto-fit, minmax\(min\(100%, 330px\), 1fr\)\);[^}]*gap: 18px;[^}]*width: min\(100%, var\(--content-wide\)\);[^}]*margin: 0 auto 0;/s,
  );
  assert.match(
    css,
    /\.comparison-subsection-heading\s*{[^}]*display: flex;[^}]*flex-wrap: nowrap;[^}]*align-items: center;[^}]*justify-content: center;[^}]*background: var\(--palette-hero-black\);[^}]*color: var\(--palette-soft-linen\);[^}]*text-align: center;/s,
  );
  assert.match(
    css,
    /\.comparison-subsection-without\s*{[^}]*background: var\(--palette-soft-linen\);/s,
  );
  assert.match(
    css,
    /\.comparison-subsection-with\s*{[^}]*background: var\(--palette-brand\);[^}]*color: var\(--palette-soft-linen\);/s,
  );
  assert.match(
    css,
    /\.comparison-subsection-heading h3\s*{[^}]*min-width: 0;[^}]*color: var\(--palette-ice-slate\);[^}]*font-size: clamp\(22px, 4vw, 28px\);[^}]*font-weight: var\(--weight-bold\);/s,
  );
  assert.match(
    css,
    /\.comparison-subsection-list\s*{[^}]*display: grid;[^}]*border: 1px solid var\(--border-soft\);[^}]*border-top: 0;[^}]*list-style: none;/s,
  );
  assert.match(
    css,
    /\.comparison-subsection-list li\s*{[^}]*grid-template-columns: 22px minmax\(0, 1fr\);[^}]*color: var\(--palette-hero-black\);[^}]*font-size: var\(--hero-subheadline-size\);[^}]*line-height: 1\.38;[^}]*text-align: left;/s,
  );
  assert.match(
    css,
    /\.comparison-subsection-list li svg\s*{[^}]*color: var\(--palette-accent\);/s,
  );
  assert.match(
    css,
    /\.comparison-subsection-with \.comparison-subsection-list li,[\s\S]*\.comparison-subsection-with \.comparison-subsection-list span\s*{[^}]*color: var\(--palette-soft-linen\);/s,
  );
});

test("report contents section uses dark editorial subsections with consistent soft-linen bodies", () => {
  assert.match(
    css,
    /\.comparison-editorial \+ \.report-contents-editorial\s*{[^}]*margin-top: -1px;/s,
  );
  assert.match(
    css,
    /\.report-contents-editorial\s*{[^}]*border-top: 0;[^}]*background: var\(--palette-brand\);[^}]*color: var\(--palette-soft-linen\);[^}]*box-shadow: none;/s,
  );
  assert.match(
    css,
    /\.report-contents-editorial \.section-heading h2\s*{[^}]*color: var\(--palette-soft-linen\);[^}]*text-align: center;[^}]*text-transform: uppercase;/s,
  );
  assert.match(
    css,
    /\.report-contents-editorial \.section-heading h2 span\s*{[^}]*color: var\(--palette-ice-slate\);/s,
  );
  assert.match(
    css,
    /\.report-contents-editorial \.report-contents-copy\s*{[^}]*max-width: var\(--content-narrow\);[^}]*margin-inline: auto;[^}]*gap: 18px;[^}]*color: var\(--palette-soft-linen\);[^}]*font-size: var\(--hero-subheadline-size\);[^}]*line-height: 1\.38;[^}]*text-align: left;/s,
  );
  assert.match(
    css,
    /\.report-content-subsections\s*{[^}]*display: grid;[^}]*gap: 18px;[^}]*width: min\(100%, var\(--content-wide\)\);[^}]*margin: var\(--gap-section\) auto 0;/s,
  );
  assert.match(
    css,
    /\.report-content-subsection-heading\s*{[^}]*display: flex;[^}]*flex-wrap: nowrap;[^}]*align-items: center;[^}]*justify-content: center;[^}]*background: var\(--palette-hero-black\);[^}]*color: var\(--palette-soft-linen\);[^}]*text-align: center;/s,
  );
  assert.match(
    css,
    /\.report-content-subsection-heading small\s*{[^}]*flex: 0 0 auto;[^}]*color: var\(--palette-accent\);[^}]*font-size: clamp\(22px, 4vw, 28px\);[^}]*font-weight: var\(--weight-bold\);/s,
  );
  assert.match(
    css,
    /\.report-content-subsection-heading h3\s*{[^}]*min-width: 0;[^}]*color: var\(--palette-ice-slate\);[^}]*font-size: clamp\(22px, 4vw, 28px\);[^}]*font-weight: var\(--weight-bold\);/s,
  );
  assert.match(
    css,
    /\.report-content-subsection-body\s*{[^}]*padding: 18px clamp\(18px, 4vw, 28px\) 22px;[^}]*background: var\(--palette-soft-linen\);[^}]*color: var\(--palette-hero-black\);/s,
  );
  assert.doesNotMatch(css, /\.report-content-subsection-2 \.report-content-subsection-body/s);
  assert.doesNotMatch(css, /\.report-content-subsection-3 \.report-content-subsection-body/s);
  assert.match(
    css,
    /\.report-content-subsection-body li\s*{[^}]*grid-template-columns: 22px minmax\(0, 1fr\);[^}]*color: var\(--palette-hero-black\);[^}]*font-size: var\(--hero-subheadline-size\);[^}]*line-height: 1\.38;/s,
  );
  assert.match(
    css,
    /\.report-content-subsection-body li svg\s*{[^}]*color: var\(--palette-accent\);/s,
  );
});

test("bonuses section uses white editorial subsections with soft-linen bodies", () => {
  assert.match(
    css,
    /\.report-contents-editorial \+ \.bonuses-editorial\s*{[^}]*margin-top: -1px;/s,
  );
  assert.match(
    css,
    /\.bonuses-editorial\s*{[^}]*border-top: 0;[^}]*background: var\(--palette-clean\);[^}]*color: var\(--palette-hero-black\);[^}]*box-shadow: none;/s,
  );
  assert.match(
    css,
    /\.bonuses-editorial \.section-heading h2\s*{[^}]*color: var\(--palette-soft-linen\);[^}]*text-align: center;[^}]*text-transform: uppercase;/s,
  );
  assert.match(
    css,
    /\.bonuses-editorial \.section-heading h2 span\s*{[^}]*color: var\(--palette-ice-slate\);/s,
  );
  assert.match(
    css,
    /\.bonus-subsections\s*{[^}]*display: grid;[^}]*gap: 18px;[^}]*width: min\(100%, var\(--content-narrow\)\);[^}]*margin: var\(--gap-section\) auto 0;/s,
  );
  assert.match(
    css,
    /\.bonus-subsection-heading\s*{[^}]*display: flex;[^}]*flex-wrap: nowrap;[^}]*align-items: center;[^}]*justify-content: center;[^}]*background: var\(--palette-hero-black\);[^}]*color: var\(--palette-soft-linen\);[^}]*text-align: center;/s,
  );
  assert.match(
    css,
    /\.bonus-subsection-heading small\s*{[^}]*flex: 0 0 auto;[^}]*color: var\(--palette-accent\);[^}]*font-size: clamp\(22px, 4vw, 28px\);[^}]*font-weight: var\(--weight-bold\);/s,
  );
  assert.match(
    css,
    /\.bonus-subsection-heading h3\s*{[^}]*min-width: 0;[^}]*color: var\(--palette-ice-slate\);[^}]*font-size: clamp\(22px, 4vw, 28px\);[^}]*font-weight: var\(--weight-bold\);/s,
  );
  assert.match(
    css,
    /\.bonus-subsection-body\s*{[^}]*padding: 18px clamp\(18px, 4vw, 28px\) 22px;[^}]*background: var\(--palette-soft-linen\);[^}]*color: var\(--palette-hero-black\);/s,
  );
  assert.match(
    css,
    /\.bonus-subsection-body p\s*{[^}]*color: var\(--palette-hero-black\);[^}]*font-size: var\(--hero-subheadline-size\);[^}]*font-weight: var\(--weight-bold\);[^}]*line-height: 1\.38;/s,
  );
});

test("process section uses number-title image-description editorial flow", () => {
  assert.match(
    css,
    /\.bonuses-editorial \+ \.process-editorial\s*{[^}]*margin-top: -1px;/s,
  );
  assert.match(
    css,
    /\.process-editorial\s*{[^}]*border-top: 0;[^}]*background: var\(--palette-clean\);[^}]*color: var\(--palette-hero-black\);[^}]*box-shadow: none;/s,
  );
  assert.match(
    css,
    /\.process-editorial \.section-heading h2\s*{[^}]*color: var\(--palette-soft-linen\);[^}]*text-align: center;[^}]*text-transform: uppercase;/s,
  );
  assert.match(
    css,
    /\.process-editorial \.section-heading h2 span\s*{[^}]*color: var\(--palette-ice-slate\);/s,
  );
  assert.match(
    css,
    /\.process-editorial \.process-copy\s*{[^}]*max-width: var\(--content-narrow\);[^}]*margin-inline: auto;[^}]*color: var\(--palette-hero-black\);[^}]*font-size: var\(--hero-subheadline-size\);[^}]*line-height: 1\.38;[^}]*text-align: center;/s,
  );
  assert.match(
    css,
    /\.process-flow\s*{[^}]*display: grid;[^}]*gap: clamp\(30px, 5vw, 54px\);[^}]*width: min\(100%, var\(--content-medium\)\);[^}]*margin: var\(--gap-section\) auto 0;/s,
  );
  assert.match(
    css,
    /\.process-editorial \.process-step\s*{[^}]*display: grid;[^}]*gap: 18px;[^}]*justify-items: stretch;[^}]*border-bottom: 1px solid rgba\(var\(--palette-ink-rgb\), 0\.1\);[^}]*text-align: left;/s,
  );
  assert.match(
    css,
    /\.process-step-heading\s*{[^}]*display: grid;[^}]*grid-template-columns: auto minmax\(0, 1fr\);[^}]*gap: 14px;[^}]*align-items: start;/s,
  );
  assert.match(
    css,
    /\.process-step-heading span\s*{[^}]*color: var\(--palette-accent\);[^}]*font-size: clamp\(26px, 5vw, 38px\);[^}]*font-weight: var\(--weight-bold\);[^}]*line-height: 1\.12;/s,
  );
  assert.match(
    css,
    /\.process-editorial \.process-step h3\s*{[^}]*color: var\(--palette-hero-black\);[^}]*font-size: clamp\(26px, 5vw, 38px\);[^}]*font-weight: var\(--weight-bold\);/s,
  );
  assert.match(
    css,
    /\.process-editorial \.process-description\s*{[^}]*color: var\(--palette-hero-black\);[^}]*font-size: var\(--hero-subheadline-size\);[^}]*font-weight: var\(--weight-regular\);[^}]*line-height: 1\.38;/s,
  );
  assert.match(
    css,
    /\.process-editorial \.process-step figure\s*{[^}]*background: var\(--palette-soft-linen\);/s,
  );
  assert.match(
    css,
    /\.process-editorial \.button\s*{[^}]*font-size: var\(--hero-subheadline-size\);/s,
  );
  assert.match(
    css,
    /\.process-editorial \.process-note\s*{[^}]*font-size: 25px;[^}]*font-weight: var\(--weight-regular\);/s,
  );
  assert.match(
    css,
    /@media \(max-width: 720px\)\s*{[\s\S]*\.process-step-heading span,[\s\S]*\.process-editorial \.process-step h3\s*{[^}]*font-size: 24px;/s,
  );
  assert.doesNotMatch(css, /\.process-timeline::before/s);
  assert.doesNotMatch(css, /\.process-rail-node/s);
  assert.doesNotMatch(css, /\.process-step-content/s);
});

test("reviews section uses a soft-linen client-led testimonial ledger", () => {
  assert.match(
    css,
    /\.process-editorial \+ \.proof-editorial\s*{[^}]*margin-top: -1px;/s,
  );
  assert.match(
    css,
    /\.proof-editorial\s*{[^}]*border-top: 0;[^}]*background: var\(--palette-soft-linen\);[^}]*color: var\(--palette-hero-black\);[^}]*box-shadow: none;/s,
  );
  assert.match(
    css,
    /\.proof-editorial \.section-heading h2\s*{[^}]*color: var\(--palette-soft-linen\);[^}]*text-align: center;[^}]*text-transform: uppercase;/s,
  );
  assert.match(
    css,
    /\.proof-editorial \.section-heading h2 span\s*{[^}]*color: var\(--palette-ice-slate\);/s,
  );
  assert.match(
    css,
    /\.testimonial-ledger\s*{[^}]*display: grid;[^}]*width: min\(100%, var\(--content-medium\)\);[^}]*border-top: 1px solid rgba\(var\(--palette-ink-rgb\), 0\.14\);/s,
  );
  assert.match(
    css,
    /\.testimonial-entry\s*{[^}]*display: grid;[^}]*border-bottom: 1px solid rgba\(var\(--palette-ink-rgb\), 0\.14\);/s,
  );
  assert.match(
    css,
    /\.testimonial-client\s*{[^}]*display: flex;[^}]*align-items: center;[^}]*gap: 12px;[^}]*color: var\(--palette-hero-black\);/s,
  );
  assert.match(
    css,
    /\.testimonial-photo\s*{[^}]*width: 52px;[^}]*height: 52px;[^}]*border-radius: 50%;[^}]*object-fit: cover;/s,
  );
  assert.match(
    css,
    /\.testimonial-client-copy strong\s*{[^}]*font-weight: var\(--weight-bold\);/s,
  );
  assert.match(
    css,
    /\.proof-editorial \.testimonial-rating svg\s*{[^}]*color: var\(--palette-accent\);/s,
  );
  assert.match(
    css,
    /\.proof-editorial blockquote\s*{[^}]*font-size: var\(--hero-subheadline-size\);[^}]*font-style: italic;[^}]*font-weight: var\(--weight-regular\);/s,
  );
  assert.doesNotMatch(css, /\.testimonial-number/s);
  assert.doesNotMatch(css, /\.proof-editorial footer/s);
  assert.doesNotMatch(css, /\.proof-editorial \.testimonial-card/s);
  assert.doesNotMatch(css, /\.proof-copy/s);
});

test("final offer uses the standard editorial headline and one clean offer flow", () => {
  assert.doesNotMatch(css, /--final-offer-heading-size:/);
  assert.doesNotMatch(css, /--final-offer-item-size:/);
  assert.doesNotMatch(css, /--final-offer-proof-size:/);
  assert.doesNotMatch(css, /\.section-heading h2,[\s\S]*?\.final-offer h2\s*{/s);
  assert.match(
    css,
    /\.final-offer-section\s*{[^}]*background: var\(--palette-clean\);[^}]*color: var\(--palette-hero-black\);/s,
  );
  assert.match(
    css,
    /\.final-offer-section \.section-heading h2\s*{[^}]*color: var\(--palette-soft-linen\);[^}]*text-align: center;[^}]*text-transform: uppercase;/s,
  );
  assert.match(
    css,
    /\.final-offer-section \.styleiq-final-offer\s*{[^}]*width: min\(100%, var\(--content-medium\)\);[^}]*padding: 0;[^}]*justify-items: center;[^}]*background: transparent;[^}]*color: var\(--palette-hero-black\);[^}]*text-align: center;[^}]*box-shadow: none;/s,
  );
  assert.doesNotMatch(css, /\.final-offer-section \.styleiq-final-offer h2/s);
  assert.match(
    css,
    /\.final-offer-section \.styleiq-final-offer > p:not\(\.delivery-proof\)\s*{[^}]*color: var\(--palette-hero-black\);[^}]*font-size: var\(--hero-subheadline-size\);[^}]*line-height: 1\.38;[^}]*text-align: center;/s,
  );
  assert.match(
    css,
    /\.final-offer-section \.recap-grid\s*{[^}]*width: min\(100%, var\(--content-narrow\)\);[^}]*display: grid;[^}]*grid-template-columns: 1fr;[^}]*text-align: left;/s,
  );
  assert.match(
    css,
    /\.final-offer-section \.recap-grid span\s*{[^}]*display: grid;[^}]*grid-template-columns: 18px minmax\(0, 1fr\);[^}]*color: var\(--palette-hero-black\);[^}]*font-size: var\(--hero-subheadline-size\);[^}]*line-height: 1\.3;/s,
  );
  assert.match(
    css,
    /\.final-offer-section \.price-line\s*{[^}]*display: grid;[^}]*gap: 8px;[^}]*justify-items: center;[^}]*text-align: center;/s,
  );
  assert.match(
    css,
    /\.final-offer-section \.price-line span\s*{[^}]*color: var\(--palette-accent\);[^}]*font-size: var\(--hero-subheadline-size\);[^}]*font-weight: var\(--weight-bold\);[^}]*letter-spacing: 0;/s,
  );
  assert.doesNotMatch(css, /\.final-offer-section \.price-line span\s*{[^}]*text-transform:/s);
  assert.match(
    css,
    /\.final-offer-section \.price-line strong\s*{[^}]*color: var\(--palette-hero-black\);[^}]*font-size: var\(--heading-section\);[^}]*font-weight: var\(--weight-bold\);/s,
  );
  assert.match(
    css,
    /\.final-offer-section \.final-offer-button\s*{[^}]*width: min\(100%, 520px\);[^}]*min-height: clamp\(72px, 7vw, 86px\);[^}]*padding-block: 22px;[^}]*background: var\(--palette-accent\);[^}]*color: var\(--palette-ink\);[^}]*font-size: var\(--hero-subheadline-size\);/s,
  );
  assert.match(
    css,
    /\.final-offer-section \.delivery-proof\s*{[^}]*align-items: center;[^}]*justify-content: center;[^}]*flex-wrap: wrap;[^}]*color: var\(--palette-hero-black\);[^}]*font-size: var\(--hero-subheadline-size\);[^}]*text-align: center;/s,
  );
  assert.match(
    css,
    /\.final-offer-section \.delivery-proof span\s*{[^}]*display: inline-flex;[^}]*align-items: center;[^}]*gap: 9px;/s,
  );
  assert.match(
    css,
    /@media \(max-width: 720px\)\s*{[\s\S]*\.final-offer-section \.styleiq-final-offer\s*{[^}]*width: min\(100%, var\(--content-medium\)\);[^}]*padding: 0;[\s\S]*\.final-offer-section \.styleiq-final-offer > p:not\(\.delivery-proof\)\s*{[^}]*font-size: var\(--hero-subheadline-size\);[\s\S]*\.final-offer-section \.recap-grid\s*{[^}]*grid-template-columns: 1fr;[\s\S]*\.final-offer-section \.final-offer-button\s*{[^}]*font-size: var\(--hero-subheadline-size\);/s,
  );
  assert.doesNotMatch(css, /\.final-offer-copy/s);
  assert.doesNotMatch(css, /\.final-offer-action/s);
});

test("faq uses dark editorial accordion with white answer surfaces", () => {
  assert.match(
    css,
    /\.section-editorial-preview\.faq-editorial\s*{[^}]*background: var\(--palette-faq-ink\);[^}]*color: var\(--palette-soft-linen\);[^}]*box-shadow: none;/s,
  );
  assert.match(
    css,
    /\.faq-editorial \.faq-shell\s*{[^}]*width: min\(calc\(100% - 48px\), var\(--content-medium\)\);[^}]*display: grid;[^}]*grid-template-columns: 1fr;[^}]*gap: 0;/s,
  );
  assert.match(
    css,
    /\.faq-editorial \.section-heading h2\s*{[^}]*color: var\(--palette-soft-linen\);[^}]*text-align: center;[^}]*text-transform: uppercase;/s,
  );
  assert.match(
    css,
    /\.faq-editorial \.faq-list button span\s*{[^}]*color: var\(--palette-soft-linen\);[^}]*font-size: var\(--hero-subheadline-size\);[^}]*font-weight: var\(--weight-bold\);/s,
  );
  assert.match(
    css,
    /\.faq-editorial \.faq-list article\.open button span,[\s\S]*\.faq-editorial \.faq-list article\.open button svg\s*{[^}]*color: var\(--palette-accent\);/s,
  );
  assert.match(
    css,
    /\.faq-editorial \.faq-answer p\s*{[^}]*background: var\(--palette-clean\);[^}]*color: var\(--palette-hero-black\);[^}]*font-size: var\(--hero-subheadline-size\);[^}]*font-weight: var\(--weight-regular\);/s,
  );
  assert.match(
    css,
    /@media \(max-width: 720px\)\s*{[\s\S]*\.faq-editorial \.faq-list button span,[\s\S]*\.faq-editorial \.faq-answer p\s*{[^}]*font-size: var\(--hero-subheadline-size\);/s,
  );
  assert.doesNotMatch(css, /\.faq-intro/);
});
