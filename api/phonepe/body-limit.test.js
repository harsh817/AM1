import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_MAX_BODY_BYTES } from "../_lib/http.js";
import createOrderHandler from "./create-order.js";
import statusHandler from "./status.js";
import webhookHandler from "./webhook.js";

test("create-order returns 413 for oversized request bodies", async () => {
  const res = createJsonResponse();

  await createOrderHandler(createRequest("POST"), res);

  assert.equal(res.statusCode, 413);
  assert.deepEqual(res.json(), { message: "Request payload is too large." });
});

test("status returns 413 for oversized POST request bodies", async () => {
  const res = createJsonResponse();

  await statusHandler(createRequest("POST"), res);

  assert.equal(res.statusCode, 413);
  assert.deepEqual(res.json(), { message: "Request payload is too large." });
});

test("webhook returns 413 for oversized request bodies", async () => {
  const res = createJsonResponse();

  await webhookHandler(createRequest("POST"), res);

  assert.equal(res.statusCode, 413);
  assert.deepEqual(res.json(), { message: "Request payload is too large." });
});

function createRequest(method) {
  return {
    method,
    url: "/api/phonepe/test",
    headers: { host: "example.com" },
    body: "x".repeat(DEFAULT_MAX_BODY_BYTES + 1),
  };
}

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
