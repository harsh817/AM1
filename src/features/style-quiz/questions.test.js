import assert from "node:assert/strict";
import test from "node:test";
import { AGE_RANGES, PATHS, READINESS_CHECKS, SHARED, STEPS, questionForStep, selectOption } from "./questions.js";
import { buildReadiness } from "./results.js";

test("the quiz starts with age and covers all seven persona branches", () => {
  assert.equal(STEPS[0], "intro");
  assert.equal(STEPS[1], "age");
  assert.equal(questionForStep("age").prompt, AGE_RANGES.prompt);
  assert.deepEqual(Object.keys(PATHS), ["colours", "fit", "work", "change", "grooming", "social", "overall"]);
  for (const path of Object.keys(PATHS)) assert.equal(PATHS[path].questions.length, 3);
});

test("multi-select accepts three or more answers and exclusive answers clear the rest", () => {
  const question = SHARED.feeling;
  const two = selectOption([0], 1, question);
  assert.deepEqual(two, [0, 1]);
  const three = selectOption(two, 2, question);
  assert.deepEqual(three, [0, 1, 2]);
  assert.deepEqual(selectOption(three, question.exclusive, question), [question.exclusive]);
  assert.deepEqual(selectOption([question.exclusive], 0, question), [0]);
});

test("the readiness graph matches the checklist at zero and full completion", () => {
  const empty = buildReadiness("fit", { readiness: [] });
  assert.equal(empty.current, 0);
  assert.equal(empty.target, 85);
  assert.equal(empty.checks.length, READINESS_CHECKS.length);
  const complete = buildReadiness("fit", { readiness: [0, 1, 2, 3, 4] });
  assert.equal(complete.current, 100);
  assert.equal(complete.target, 100);
});
