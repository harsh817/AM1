import assert from "node:assert/strict";
import { Readable } from "node:stream";
import test from "node:test";
import {
  BodyTooLargeError,
  readBody,
  readJson,
  sendJson,
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

test("sends API JSON responses with no-store cache headers", () => {
  const res = createJsonResponse();

  sendJson(res, 200, { ok: true });

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.json(), { ok: true });
  assert.equal(res.headers["Content-Type"], "application/json");
  assert.equal(res.headers["Cache-Control"], "no-store, max-age=0");
  assert.equal(res.headers.Pragma, "no-cache");
  assert.equal(res.headers.Expires, "0");
});

function createJsonResponse() {
  return {
    statusCode: 0,
    headers: {},
    body: "",
    setHeader(name, value) {
      this.headers[name] = value;
    },
    end(body) {
      this.body = body;
    },
    json() {
      return JSON.parse(this.body);
    },
  };
}
