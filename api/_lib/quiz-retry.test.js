import assert from "node:assert/strict";
import test from "node:test";
import { issueQuizRetryToken, verifyQuizRetryToken } from "./quiz-retry.js";

test("quiz retry credentials are tied to one order, expire, and reject tampering", () => {
  const now = 1_800_000_000_000;
  const secret = "test-only-secret";
  const token = issueQuizRetryToken("AM_ORDER", now, secret);
  assert.equal(verifyQuizRetryToken("AM_ORDER", token, now + 1, secret), true);
  assert.equal(verifyQuizRetryToken("AM_OTHER", token, now + 1, secret), false);
  assert.equal(verifyQuizRetryToken("AM_ORDER", token, now + 86_400_001, secret), false);
  assert.equal(verifyQuizRetryToken("AM_ORDER", token, now + 1, "wrong-secret"), false);
});
