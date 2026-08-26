import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const paletteHexes = new Set(["#f8f9f7", "#1d2426", "#5f7277", "#d7c4bd"]);
const requiredSystemTokens = [
  "--text-eyebrow",
  "--text-body",
  "--text-lead",
  "--heading-section",
  "--heading-hero",
  "--heading-card",
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

test("landing stylesheet uses the four-color palette", () => {
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
