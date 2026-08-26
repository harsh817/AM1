import assert from "node:assert/strict";
import test from "node:test";
import {
  comparisonRows,
  faqs,
  recapItems,
  reportContentGroups,
  styleIqPillars,
  trustBadges,
} from "./landing-data.js";

test("landing data represents the StyleIQ offer from copy.md", () => {
  assert.deepEqual(trustBadges, [
    "1,119+ happy clients",
    "4.8 star rating",
    "Delivered in 48 hours",
    "Lifetime access",
  ]);
  assert.deepEqual(
    styleIqPillars.map((pillar) => pillar.title),
    [
      "Your Features",
      "Your Build & Proportions",
      "Your Coloring",
      "Your Lifestyle",
      "Your Preferences & Budget",
    ],
  );
  assert.ok(comparisonRows.some((row) => row.withStyleIq.includes("Knowing which hairstyles")));
  assert.ok(reportContentGroups.some((group) => group.title === "Your Personal Outfit System"));
  assert.ok(recapItems.includes("20 Outfit Ideas"));
  assert.ok(faqs.some(([question]) => question.includes("Why pay for this")));
});
