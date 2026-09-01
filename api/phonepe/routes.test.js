import assert from "node:assert/strict";
import crypto from "node:crypto";
import test from "node:test";
import createOrderHandler from "./create-order.js";
import statusHandler from "./status.js";
import webhookHandler from "./webhook.js";
import { clearPhonePeAccessTokenCache } from "../_lib/phonepe.js";

const TEST_TOKEN_LIFETIME_SECONDS = 3600;

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

test("create-order returns 400 for malformed JSON", async () => {
  const res = createJsonResponse();

  await createOrderHandler(createRequest({ method: "POST", body: "{" }), res);

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.json(), { message: "Invalid checkout payload." });
});

test("create-order sanitizes unknown provider errors", async () => {
  const restore = withEnv({
    PHONEPE_ENV: "sandbox",
    PHONEPE_CLIENT_ID: "client-id",
    PHONEPE_CLIENT_VERSION: "1",
    PHONEPE_CLIENT_SECRET: "client-secret",
    BASE_URL: "https://thriveonp.com",
    MAKE_WEBHOOK_URL: "",
  });
  const originalFetch = globalThis.fetch;
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;
  let authReturned = false;
  clearPhonePeAccessTokenCache();

  globalThis.fetch = async (_url, _options) => {
    if (!authReturned) {
      authReturned = true;
      return jsonResponse({
        access_token: "access-token",
        token_type: "O-Bearer",
        expires_at: Math.floor(Date.now() / 1000) + TEST_TOKEN_LIFETIME_SECONDS,
      });
    }

    return jsonResponse({ message: "raw provider failure should stay internal" }, { status: 502 });
  };
  console.log = () => {};
  console.error = () => {};

  try {
    const res = createJsonResponse();
    await createOrderHandler(createRequest({
      method: "POST",
      body: {
        details: {
          name: "Harsh Goel",
          email: "harsh@example.com",
          phone: "9876543210",
        },
        selected: [],
      },
    }), res);

    assert.equal(res.statusCode, 502);
    assert.deepEqual(res.json(), { message: "Payment could not be started. Please try again." });
    assert.doesNotMatch(res.body, /raw provider failure|harsh@example\.com|9876543210/);
  } finally {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    globalThis.fetch = originalFetch;
    clearPhonePeAccessTokenCache();
    restore();
  }
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

test("status sanitizes unknown provider errors", async () => {
  const restore = withEnv({
    PHONEPE_ENV: "sandbox",
    PHONEPE_CLIENT_ID: "client-id",
    PHONEPE_CLIENT_VERSION: "1",
    PHONEPE_CLIENT_SECRET: "client-secret",
    MAKE_WEBHOOK_URL: "",
  });
  const originalFetch = globalThis.fetch;
  const originalConsoleError = console.error;
  let authReturned = false;
  clearPhonePeAccessTokenCache();

  globalThis.fetch = async (_url, _options) => {
    if (!authReturned) {
      authReturned = true;
      return jsonResponse({
        access_token: "access-token",
        token_type: "O-Bearer",
        expires_at: Math.floor(Date.now() / 1000) + TEST_TOKEN_LIFETIME_SECONDS,
      });
    }

    return jsonResponse({ message: "raw status failure should stay internal" }, { status: 503 });
  };
  console.error = () => {};

  try {
    const res = createJsonResponse();
    await statusHandler(createRequest({
      method: "GET",
      url: "/api/phonepe/status?merchantOrderId=AM_TEST_ORDER",
    }), res);

    assert.equal(res.statusCode, 502);
    assert.deepEqual(res.json(), {
      message: "Payment status could not be checked. Please refresh or contact support.",
    });
    assert.doesNotMatch(res.body, /raw status failure/);
  } finally {
    console.error = originalConsoleError;
    globalThis.fetch = originalFetch;
    clearPhonePeAccessTokenCache();
    restore();
  }
});

test("webhook returns 401 for invalid auth and 400 for invalid JSON", async () => {
  const originalConsoleWarn = console.warn;
  const originalConsoleError = console.error;
  console.warn = () => {};
  console.error = () => {};

  const invalidAuthResponse = createJsonResponse();
  try {
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
  } finally {
    console.warn = originalConsoleWarn;
    console.error = originalConsoleError;
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

function jsonResponse(body, { status = 200 } = {}) {
  return new Response(JSON.stringify(body), { status });
}

function withEnv(values) {
  const original = {};

  for (const [name, value] of Object.entries(values)) {
    original[name] = process.env[name];
    if (value === undefined) {
      delete process.env[name];
    } else {
      process.env[name] = value;
    }
  }

  return () => {
    for (const [name, value] of Object.entries(original)) {
      restoreEnv(name, value);
    }
  };
}

function restoreEnv(name, value) {
  if (value === undefined) {
    delete process.env[name];
    return;
  }

  process.env[name] = value;
}
