import assert from "node:assert/strict";
import test from "node:test";
import {
  PhonePeConfigurationError,
  PhonePeProviderError,
  clearPhonePeAccessTokenCache,
  createPhonePePayment,
  fetchPhonePe,
  getPhonePeEndpoints,
  getPhonePeEnvironment,
  getPhonePeOrderStatus,
  validateProductionBaseUrl,
  validateProductionRedirectUrl,
} from "./phonepe.js";
import { PHONEPE_ORDER_EXPIRY_SECONDS } from "./constants.js";

const TEST_AMOUNT_PAISE = 235882;
const TEST_TOKEN_LIFETIME_SECONDS = 3600;

test("PhonePe fetch helper passes abort signals and times out", async () => {
  let receivedSignal;

  await assert.rejects(
    fetchPhonePe("https://phonepe.example/test", {}, {
      operation: "phonepe.test",
      timeoutMs: 1,
      fetchFn: async (_url, options) => {
        receivedSignal = options.signal;

        return new Promise((_resolve, reject) => {
          options.signal.addEventListener("abort", () => {
            const error = new Error("aborted");
            error.name = "AbortError";
            reject(error);
          });
        });
      },
    }),
    (error) => {
      assert.ok(error instanceof PhonePeProviderError);
      assert.equal(error.code, "PHONEPE_TIMEOUT");
      assert.equal(error.operation, "phonepe.test");
      return true;
    },
  );

  assert.ok(receivedSignal instanceof AbortSignal);
  assert.equal(receivedSignal.aborted, true);
});

test("PhonePe auth, payment, and status requests use server credentials and abort signals", async () => {
  const restore = withEnv({
    PHONEPE_ENV: "sandbox",
    PHONEPE_CLIENT_ID: "client-id",
    PHONEPE_CLIENT_VERSION: "1",
    PHONEPE_CLIENT_SECRET: "client-secret",
    BASE_URL: "https://thriveonp.com",
  });
  const originalFetch = globalThis.fetch;
  const calls = [];
  clearPhonePeAccessTokenCache();

  globalThis.fetch = async (url, options = {}) => {
    calls.push({ url: String(url), options });
    assert.ok(options.signal instanceof AbortSignal);

    if (calls.length === 1) {
      assert.equal(options.body.get("client_id"), "client-id");
      assert.equal(options.body.get("client_version"), "1");
      assert.equal(options.body.get("client_secret"), "client-secret");
      return jsonResponse({
        access_token: "access-token",
        token_type: "O-Bearer",
        expires_at: Math.floor(Date.now() / 1000) + TEST_TOKEN_LIFETIME_SECONDS,
      });
    }

    if (calls.length === 2) {
      const paymentPayload = JSON.parse(options.body);
      assert.equal(paymentPayload.merchantOrderId, "AM_TEST_ORDER");
      assert.equal(paymentPayload.amount, TEST_AMOUNT_PAISE);
      assert.equal(paymentPayload.expireAfter, PHONEPE_ORDER_EXPIRY_SECONDS);
      return jsonResponse({
        orderId: "OMO_TEST_ORDER",
        state: "PENDING",
        redirectUrl: "https://phonepe.example/pay",
      });
    }

    return jsonResponse({
      orderId: "OMO_TEST_ORDER",
      state: "COMPLETED",
      amount: TEST_AMOUNT_PAISE,
    });
  };

  try {
    const payment = await createPhonePePayment({
      merchantOrderId: "AM_TEST_ORDER",
      amountPaise: TEST_AMOUNT_PAISE,
      redirectUrl: "https://thriveonp.com/a-m-thankyou?merchantOrderId=AM_TEST_ORDER",
      phoneNumber: "9876543210",
      metaInfo: { udf1: "Name" },
    });
    const status = await getPhonePeOrderStatus("AM_TEST_ORDER");

    assert.equal(payment.orderId, "OMO_TEST_ORDER");
    assert.equal(status.state, "COMPLETED");
    assert.equal(calls.length, 3);
    assert.match(calls[0].url, /oauth\/token/);
    assert.match(calls[1].url, /checkout\/v2\/pay/);
    assert.match(calls[2].url, /AM_TEST_ORDER\/status/);
  } finally {
    globalThis.fetch = originalFetch;
    clearPhonePeAccessTokenCache();
    restore();
  }
});

test("PhonePe environment selection fails closed for unknown values", () => {
  assert.equal(getPhonePeEnvironment("SANDBOX"), "sandbox");
  assert.equal(getPhonePeEnvironment(" production "), "production");

  assert.throws(
    () => getPhonePeEnvironment("preview"),
    (error) => {
      assert.ok(error instanceof PhonePeConfigurationError);
      assert.equal(error.code, "PHONEPE_INVALID_ENV");
      return true;
    },
  );
  assert.throws(
    () => getPhonePeEndpoints("preview"),
    (error) => {
      assert.ok(error instanceof PhonePeConfigurationError);
      assert.equal(error.code, "PHONEPE_INVALID_ENV");
      return true;
    },
  );
});

test("production PhonePe mode requires the approved production base URL", () => {
  const restoreValid = withEnv({ BASE_URL: "https://thriveonp.com" });

  try {
    assert.doesNotThrow(() => validateProductionBaseUrl("production"));
    assert.doesNotThrow(() => validateProductionRedirectUrl(
      "https://thriveonp.com/a-m-thankyou?merchantOrderId=AM_123",
      "production",
    ));
  } finally {
    restoreValid();
  }

  const restoreInvalid = withEnv({ BASE_URL: "https://preview.vercel.app" });

  try {
    assert.throws(
      () => validateProductionBaseUrl("production"),
      (error) => {
        assert.ok(error instanceof PhonePeConfigurationError);
        assert.equal(error.code, "PHONEPE_INVALID_PRODUCTION_BASE_URL");
        return true;
      },
    );
    assert.throws(
      () => validateProductionRedirectUrl("https://preview.vercel.app/a-m-thankyou", "production"),
      (error) => {
        assert.ok(error instanceof PhonePeConfigurationError);
        assert.equal(error.code, "PHONEPE_INVALID_PRODUCTION_BASE_URL");
        return true;
      },
    );
  } finally {
    restoreInvalid();
  }
});

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
      if (value === undefined) {
        delete process.env[name];
      } else {
        process.env[name] = value;
      }
    }
  };
}
