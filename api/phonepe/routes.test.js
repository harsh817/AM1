import assert from "node:assert/strict";
import crypto from "node:crypto";
import test from "node:test";
import createOrderHandler from "./create-order.js";
import statusHandler from "./status.js";
import webhookHandler from "./webhook.js";

test("PhonePe routes reject unsupported methods", async () => {
  for (const handler of [createOrderHandler, statusHandler, webhookHandler]) {
    const res = createJsonResponse();

    await handler(createRequest({ method: "PUT" }), res);

    assert.equal(res.statusCode, 405);
    assert.deepEqual(res.json(), { message: "Method not allowed." });
  }
});

test("create-order returns validation errors before provider calls", async () => {
  const res = createJsonResponse();

  await createOrderHandler(createRequest({
    method: "POST",
    body: {
      details: { name: "A", email: "bad", phone: "123" },
      selected: ["unknown"],
    },
  }), res);

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.json(), {
    message: "Invalid checkout details.",
    errors: {
      name: "Please enter your full name.",
      email: "Please enter a valid email address.",
      phone: "Please enter a valid 10-digit mobile number.",
      selected: "Please refresh and try again.",
    },
  });
});

test("status returns 400 for invalid JSON and invalid merchant order ids", async () => {
  const invalidJsonResponse = createJsonResponse();
  await statusHandler(createRequest({ method: "POST", body: "{" }), invalidJsonResponse);

  assert.equal(invalidJsonResponse.statusCode, 400);
  assert.deepEqual(invalidJsonResponse.json(), { message: "Invalid status payload." });

  const invalidIdResponse = createJsonResponse();
  await statusHandler(createRequest({
    method: "GET",
    url: "/api/phonepe/status?merchantOrderId=bad%20id",
  }), invalidIdResponse);

  assert.equal(invalidIdResponse.statusCode, 400);
  assert.deepEqual(invalidIdResponse.json(), { message: "Invalid order id." });
});

test("webhook returns 401 for invalid auth and 400 for invalid JSON", async () => {
  const invalidAuthResponse = createJsonResponse();
  await webhookHandler(createRequest({
    method: "POST",
    headers: { authorization: "bad" },
    body: "{}",
  }), invalidAuthResponse);

  assert.equal(invalidAuthResponse.statusCode, 401);
  assert.deepEqual(invalidAuthResponse.json(), { message: "Webhook verification failed." });

  const originalUsername = process.env.PHONEPE_WEBHOOK_USERNAME;
  const originalPassword = process.env.PHONEPE_WEBHOOK_PASSWORD;
  process.env.PHONEPE_WEBHOOK_USERNAME = "user";
  process.env.PHONEPE_WEBHOOK_PASSWORD = "pass";

  try {
    const invalidPayloadResponse = createJsonResponse();
    await webhookHandler(createRequest({
      method: "POST",
      headers: {
        authorization: crypto.createHash("sha256").update("user:pass").digest("hex"),
      },
      body: "{",
    }), invalidPayloadResponse);

    assert.equal(invalidPayloadResponse.statusCode, 400);
    assert.deepEqual(invalidPayloadResponse.json(), { message: "Invalid webhook payload." });
  } finally {
    restoreEnv("PHONEPE_WEBHOOK_USERNAME", originalUsername);
    restoreEnv("PHONEPE_WEBHOOK_PASSWORD", originalPassword);
  }
});

function createRequest({
  method,
  url = "/api/phonepe/test",
  headers = {},
  body = "",
} = {}) {
  return {
    method,
    url,
    headers: {
      host: "example.com",
      ...headers,
    },
    body,
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

function restoreEnv(name, value) {
  if (value === undefined) {
    delete process.env[name];
    return;
  }

  process.env[name] = value;
}
