import assert from "node:assert/strict";
import test from "node:test";
import { css } from "./landing-test-utils.js";

test("StyleIQ and comparison sections use editorial subsection rules", () => {
  assert.match(css, /\.styleiq-editorial \.styleiq-system-copy\s*{[^}]*font-size: var\(--hero-subheadline-size\);[^}]*line-height: 1\.38;[^}]*text-align: left;/s);
  assert.match(css, /\.styleiq-subsection-heading\s*{[^}]*justify-content: center;[^}]*background: var\(--palette-hero-black\);/s);
  assert.match(css, /\.styleiq-subsection-heading small\s*{[^}]*color: var\(--palette-accent\);[^}]*font-size: clamp\(22px, 4vw, 28px\);/s);
  assert.match(css, /\.styleiq-subsection p\s*{[^}]*font-size: var\(--hero-subheadline-size\);[^}]*text-align: left;/s);
  assert.match(css, /\.comparison-subsections\s*{[^}]*grid-template-columns: repeat\(auto-fit, minmax\(min\(100%, 330px\), 1fr\)\);/s);
  assert.match(css, /\.comparison-subsection-without\s*{[^}]*background: var\(--palette-soft-linen\);/s);
  assert.match(css, /\.comparison-subsection-with\s*{[^}]*background: var\(--palette-brand\);[^}]*color: var\(--palette-soft-linen\);/s);
  assert.match(css, /\.comparison-subsection-list li\s*{[^}]*font-size: var\(--hero-subheadline-size\);[^}]*text-align: left;/s);
});

test("report contents and bonuses use consistent subsection bodies", () => {
  assert.match(css, /\.report-contents-editorial\s*{[^}]*background: var\(--palette-brand\);[^}]*color: var\(--palette-soft-linen\);/s);
  assert.match(css, /\.report-content-subsections\s*{[^}]*display: grid;[^}]*gap: 18px;/s);
  assert.match(css, /\.report-content-subsection-body\s*{[^}]*background: var\(--palette-soft-linen\);[^}]*color: var\(--palette-hero-black\);/s);
  assert.match(css, /\.report-content-subsection-body li\s*{[^}]*font-size: var\(--hero-subheadline-size\);[^}]*line-height: 1\.38;/s);
  assert.match(css, /\.bonuses-editorial\s*{[^}]*background: var\(--palette-clean\);[^}]*color: var\(--palette-hero-black\);/s);
  assert.match(css, /\.bonus-subsection-body\s*{[^}]*background: var\(--palette-soft-linen\);[^}]*color: var\(--palette-hero-black\);/s);
  assert.match(css, /\.bonus-subsection-body p\s*{[^}]*font-size: var\(--hero-subheadline-size\);[^}]*font-weight: var\(--weight-bold\);/s);
});

test("process section uses number-title image-description editorial flow", () => {
  assert.match(css, /\.process-flow\s*{[^}]*display: grid;[^}]*gap: clamp\(30px, 5vw, 54px\);/s);
  assert.match(css, /\.process-step-heading\s*{[^}]*grid-template-columns: auto minmax\(0, 1fr\);/s);
  assert.match(css, /\.process-step-heading span\s*{[^}]*color: var\(--palette-accent\);[^}]*font-size: clamp\(26px, 5vw, 38px\);/s);
  assert.match(css, /\.process-editorial \.process-step h3\s*{[^}]*font-size: clamp\(26px, 5vw, 38px\);[^}]*font-weight: var\(--weight-bold\);/s);
  assert.match(css, /\.process-editorial \.process-description\s*{[^}]*font-size: var\(--hero-subheadline-size\);[^}]*font-weight: var\(--weight-regular\);/s);
  assert.match(css, /\.process-editorial \.button\s*{[^}]*font-size: var\(--hero-subheadline-size\);/s);
  assert.match(css, /@media \(max-width: 720px\)\s*{[\s\S]*\.process-step-heading span,[\s\S]*\.process-editorial \.process-step h3\s*{[^}]*font-size: 24px;/s);
  assert.doesNotMatch(css, /\.process-timeline::before|\.process-rail-node|\.process-step-content/s);
});
