import test from "node:test";
import assert from "node:assert/strict";
import { buildComplexionDestination, isComplexionAdSet } from "./persona-routing.js";

test("identifies dark ad sets by the Meta utm_medium parameter", () => {
  assert.equal(isComplexionAdSet("?utm_medium=Dark%20Skin&utm_content=other"), true);
  assert.equal(isComplexionAdSet("?utm_medium=dark%20avoids%20white"), true);
  assert.equal(isComplexionAdSet("?utm_medium=Belly&utm_content=dark_outside"), false);
  assert.equal(isComplexionAdSet("?utm_medium=%7B%7Badset.name%7D%7D"), false);
  assert.equal(isComplexionAdSet("?utm_medium=darkness"), false);
});

test("builds a persona destination without discarding campaign parameters or the fragment", () => {
  assert.equal(buildComplexionDestination("https://thriveonp.com/a-m?utm_medium=Dark%20Skin&fbclid=click#inside"),
    "/style-for-your-complexion?utm_medium=Dark+Skin&fbclid=click#inside");
});
