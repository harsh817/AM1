import assert from "node:assert/strict";
import test from "node:test";
import { css } from "./landing-test-utils.js";

test("problem section keeps left-aligned black subheadline copy", () => {
  assert.match(css, /\.problem-editorial \.problem-copy\s*{[^}]*color: var\(--palette-hero-black\);[^}]*font-size: var\(--hero-subheadline-size\);[^}]*line-height: 1\.38;[^}]*text-align: left;/s);
  assert.match(css, /\.problem-editorial \.problem-bullets li\s*{[^}]*grid-template-columns: 9px minmax\(0, 1fr\);[^}]*gap: 12px;/s);
  assert.match(css, /\.problem-editorial \.problem-visual\s*{[^}]*aspect-ratio: 750 \/ 680;/s);
  assert.match(css, /\.problem-editorial \.problem-visual-expanded\s*{[^}]*aspect-ratio: 1000 \/ 563;/s);
  assert.match(css, /\.problem-header-image\s*{[^}]*aspect-ratio: 760 \/ 1404;/s);
  assert.match(css, /\.problem-editorial \.problem-emphasis-caps\s*{[^}]*letter-spacing: 0\.04em;[^}]*text-transform: uppercase;/s);
  assert.match(css, /\.problem-editorial \.problem-emphasis-underlined\s*{[^}]*text-decoration-color: var\(--palette-accent\);/s);
});

test("waste, you-first, and professional sections use shared editorial text rules", () => {
  for (const section of ["waste", "you-first", "professional-styling"]) {
    assert.match(css, new RegExp(`\\.${section}-editorial\\s*{[^}]*background: var\\(--palette-clean\\);[^}]*color: var\\(--palette-hero-black\\);`, "s"));
    assert.match(css, new RegExp(`\\.${section}-editorial \\.section-heading h2\\s*{[^}]*text-align: center;[^}]*text-transform: uppercase;`, "s"));
  }

  assert.match(css, /\.waste-section \.copy-stack\s*{[^}]*font-size: var\(--hero-subheadline-size\);[^}]*line-height: 1\.38;/s);
  assert.match(css, /\.waste-section \.waste-visual\s*{[^}]*aspect-ratio: 760 \/ 1013;/s);
  assert.match(css, /\.you-first-section \.copy-stack\s*{[^}]*font-size: var\(--hero-subheadline-size\);[^}]*line-height: 1\.38;/s);
  assert.match(css, /\.professional-styling-section \.copy-stack\s*{[^}]*font-size: var\(--hero-subheadline-size\);[^}]*line-height: 1\.38;/s);
  assert.match(css, /\.professional-styling-section \.professional-styling-visual\s*{[^}]*aspect-ratio: 760 \/ 1350;/s);
  assert.match(css, /\.waste-section \.waste-emphasis-underlined\s*{[^}]*text-decoration-color: var\(--palette-accent\);/s);
  assert.match(css, /\.you-first-section \.you-first-emphasis-underlined\s*{[^}]*text-decoration-color: var\(--palette-accent\);/s);
  assert.match(css, /\.professional-styling-section \.professional-styling-emphasis-underlined\s*{[^}]*text-decoration-color: var\(--palette-accent\);/s);
});

test("you-first transformation images keep before-after labels without avatar styles", () => {
  assert.match(css, /\.you-first-transformation-stack\s*{[^}]*display: grid;[^}]*gap: 30px;/s);
  assert.match(css, /\.you-first-transformation-persona p\s*{[^}]*font-size: var\(--hero-subheadline-size\);[^}]*font-weight: var\(--weight-regular\);/s);
  assert.match(css, /\.you-first-transformation-frame\s*{[^}]*position: relative;[^}]*aspect-ratio: 1 \/ 1;[^}]*overflow: hidden;[^}]*background: var\(--palette-soft-linen\);/s);
  assert.match(css, /\.you-first-transformation-frame img\s*{[^}]*height: 100%;[^}]*object-fit: cover;/s);
  assert.match(css, /\.you-first-section \.copy-stack \.you-first-transformation-label\s*{[^}]*position: absolute;[^}]*background: var\(--palette-hero-black\);[^}]*text-transform: uppercase;/s);
  assert.match(css, /\.you-first-section \.copy-stack \.you-first-transformation-label-after\s*{[^}]*background: var\(--palette-accent\);[^}]*color: var\(--palette-hero-black\);/s);
  assert.doesNotMatch(css, /you-first-transformation-avatar|you-first-transformation-copy/);
});
