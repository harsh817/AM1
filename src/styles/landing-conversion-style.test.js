import assert from "node:assert/strict";
import test from "node:test";
import { css } from "./landing-test-utils.js";

test("reviews section uses a soft-linen client-led testimonial ledger", () => {
  assert.match(css, /\.proof-editorial\s*{[^}]*background: var\(--palette-soft-linen\);[^}]*color: var\(--palette-hero-black\);/s);
  assert.match(css, /\.testimonial-ledger\s*{[^}]*display: grid;[^}]*width: min\(100%, var\(--content-medium\)\);/s);
  assert.match(css, /\.testimonial-client\s*{[^}]*display: flex;[^}]*align-items: center;[^}]*gap: 12px;/s);
  assert.match(css, /\.testimonial-photo\s*{[^}]*width: 52px;[^}]*height: 52px;[^}]*border-radius: 50%;[^}]*object-fit: cover;/s);
  assert.match(css, /\.proof-editorial \.testimonial-rating svg\s*{[^}]*color: var\(--palette-accent\);/s);
  assert.match(css, /\.proof-editorial blockquote\s*{[^}]*font-size: var\(--hero-subheadline-size\);[^}]*font-style: italic;[^}]*font-weight: var\(--weight-regular\);/s);
  assert.doesNotMatch(css, /\.testimonial-number|\.proof-editorial footer|\.proof-copy/s);
});

test("final offer uses the standard editorial headline and one clean offer flow", () => {
  assert.doesNotMatch(css, /--final-offer-heading-size:|--final-offer-item-size:|--final-offer-proof-size:/);
  assert.match(css, /\.final-offer-section\s*{[^}]*background: var\(--palette-clean\);[^}]*color: var\(--palette-hero-black\);/s);
  assert.match(css, /\.final-offer-section \.styleiq-final-offer\s*{[^}]*width: min\(100%, var\(--content-medium\)\);[^}]*padding: 0;[^}]*background: transparent;[^}]*box-shadow: none;/s);
  assert.match(css, /\.final-offer-section \.styleiq-final-offer > p:not\(\.delivery-proof\)\s*{[^}]*font-size: var\(--hero-subheadline-size\);[^}]*text-align: center;/s);
  assert.match(css, /\.final-offer-section \.recap-grid span\s*{[^}]*font-size: var\(--hero-subheadline-size\);[^}]*line-height: 1\.3;/s);
  assert.match(css, /\.final-offer-section \.price-line strong\s*{[^}]*font-size: var\(--heading-section\);[^}]*font-weight: var\(--weight-bold\);/s);
  assert.match(css, /\.final-offer-section \.final-offer-button\s*{[^}]*min-height: clamp\(72px, 7vw, 86px\);[^}]*font-size: var\(--hero-subheadline-size\);/s);
  assert.match(css, /\.final-offer-section \.delivery-proof\s*{[^}]*font-size: var\(--hero-subheadline-size\);[^}]*text-align: center;/s);
});

test("FAQ uses dark accordion questions with white answer surfaces", () => {
  assert.match(css, /\.section-editorial-preview\.faq-editorial\s*{[^}]*background: var\(--palette-faq-ink\);[^}]*color: var\(--palette-soft-linen\);/s);
  assert.match(css, /\.faq-editorial \.faq-shell\s*{[^}]*grid-template-columns: 1fr;[^}]*gap: 0;/s);
  assert.match(css, /\.faq-editorial \.faq-list button span\s*{[^}]*color: var\(--palette-soft-linen\);[^}]*font-size: var\(--hero-subheadline-size\);[^}]*font-weight: var\(--weight-bold\);/s);
  assert.match(css, /\.faq-editorial \.faq-list article\.open button span,[\s\S]*\.faq-editorial \.faq-list article\.open button svg\s*{[^}]*color: var\(--palette-accent\);/s);
  assert.match(css, /\.faq-editorial \.faq-answer p\s*{[^}]*background: var\(--palette-clean\);[^}]*color: var\(--palette-hero-black\);[^}]*font-size: var\(--hero-subheadline-size\);/s);
  assert.doesNotMatch(css, /\.faq-intro/);
});
