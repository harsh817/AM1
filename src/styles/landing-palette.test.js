import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import test from "node:test";
import { css } from "./landing-test-utils.js";

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

test("landing CSS is split into small ordered imports", () => {
  const entryCss = readFileSync(new URL("./landing.css", import.meta.url), "utf8");
  const chunkFiles = readdirSync(new URL("./landing/", import.meta.url)).filter((file) => file.endsWith(".css"));

  assert.match(entryCss, /^@import "\.\/landing\/part-01\.css";/);
  assert.ok(chunkFiles.length > 1);

  for (const file of chunkFiles) {
    const lineCount = readFileSync(new URL(`./landing/${file}`, import.meta.url), "utf8").split(/\r?\n/).length;
    assert.ok(lineCount <= 300, `${file} should stay near the project line-count target`);
  }
});

test("landing stylesheet uses only the approved Ink Luxury palette", () => {
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
