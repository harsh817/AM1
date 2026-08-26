import assert from "node:assert/strict";
import { Readable } from "node:stream";
import test from "node:test";
import {
  BodyTooLargeError,
  readBody,
  readJson,
} from "./http.js";

test("reads JSON request bodies within the configured size limit", async () => {
  const payload = await readJson({
    body: JSON.stringify({ ok: true }),
  }, { maxBytes: 32 });

  assert.deepEqual(payload, { ok: true });
});

test("rejects parsed string request bodies over the configured size limit", async () => {
  await assert.rejects(
    readBody({ body: "12345" }, { maxBytes: 4 }),
    BodyTooLargeError,
  );
});

test("rejects streamed request bodies once they exceed the configured size limit", async () => {
  const req = Readable.from(["123", "45"]);

  await assert.rejects(
    readBody(req, { maxBytes: 4 }),
    BodyTooLargeError,
  );
});
