import {
  PHONEPE_FALLBACK_TOKEN_LIFETIME_SECONDS,
  PHONEPE_ORDER_EXPIRY_SECONDS,
  PHONEPE_PRODUCTION_BASE_URL,
  PHONEPE_REQUEST_TIMEOUT_MS,
  PHONEPE_TOKEN_REFRESH_BUFFER_SECONDS,
} from "./constants.js";
import { getEnv, requireEnv } from "./env.js";

const ENDPOINTS = {
  production: {
    auth: "https://api.phonepe.com/apis/identity-manager/v1/oauth/token",
    pay: "https://api.phonepe.com/apis/pg/checkout/v2/pay",
    status: "https://api.phonepe.com/apis/pg/checkout/v2/order",
  },
  sandbox: {
    auth: "https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token",
    pay: "https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/pay",
    status: "https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/order",
  },
};

let cachedToken = null;

export class PhonePeProviderError extends Error {
  constructor(message, {
    code = "PHONEPE_PROVIDER_ERROR",
    operation = "",
    responseStatus = "",
    cause,
  } = {}) {
    super(message);
    this.name = "PhonePeProviderError";
    this.code = code;
    this.operation = operation;
    this.responseStatus = responseStatus;
    if (cause) this.cause = cause;
  }
}

export class PhonePeConfigurationError extends Error {
  constructor(message, { code = "PHONEPE_CONFIGURATION_ERROR" } = {}) {
    super(message);
    this.name = "PhonePeConfigurationError";
    this.code = code;
  }
}

export async function createPhonePePayment({
  merchantOrderId,
  amountPaise,
  redirectUrl,
  phoneNumber,
  metaInfo,
}) {
  const environment = getPhonePeEnvironment();
  validateProductionBaseUrl(environment);
  validateProductionRedirectUrl(redirectUrl, environment);
  const endpoints = getPhonePeEndpoints(environment);
  const auth = await getPhonePeAccessToken({ environment });
  const payload = {
    merchantOrderId,
    amount: amountPaise,
    expireAfter: PHONEPE_ORDER_EXPIRY_SECONDS,
    paymentFlow: {
      type: "PG_CHECKOUT",
      merchantUrls: {
        redirectUrl,
      },
    },
    prefillUserLoginDetails: {
      phoneNumber: `+91${phoneNumber}`,
    },
    disablePaymentRetry: true,
    metaInfo,
  };

  const response = await fetchPhonePe(endpoints.pay, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `${auth.tokenType} ${auth.accessToken}`,
    },
    body: JSON.stringify(payload),
  }, { operation: "phonepe.payment.create" });
  const data = await parsePhonePeResponse(response);

  if (!response.ok || !data.redirectUrl) {
    throw new PhonePeProviderError(data.message || "PhonePe payment could not be started.", {
      code: "PHONEPE_PAYMENT_CREATE_FAILED",
      operation: "phonepe.payment.create",
      responseStatus: response.status,
    });
  }

  return data;
}

export async function getPhonePeOrderStatus(merchantOrderId) {
  const environment = getPhonePeEnvironment();
  const endpoints = getPhonePeEndpoints(environment);
  const auth = await getPhonePeAccessToken({ environment });
  const statusUrl = new URL(`${endpoints.status}/${encodeURIComponent(merchantOrderId)}/status`);
  statusUrl.searchParams.set("details", "true");
  statusUrl.searchParams.set("errorContext", "true");

  const response = await fetchPhonePe(statusUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `${auth.tokenType} ${auth.accessToken}`,
    },
  }, { operation: "phonepe.payment.status" });
  const data = await parsePhonePeResponse(response);

  if (!response.ok) {
    throw new PhonePeProviderError(data.message || "PhonePe order status could not be checked.", {
      code: "PHONEPE_STATUS_CHECK_FAILED",
      operation: "phonepe.payment.status",
      responseStatus: response.status,
    });
  }

  return data;
}

/**
 * Performs a PhonePe fetch with a bounded timeout.
 *
 * @param {string|URL} url - PhonePe endpoint.
 * @param {object} options - Fetch options.
 * @param {object} config - Operation label, timeout, and injectable fetch.
 * @returns {Promise<Response>} PhonePe response.
 * @throws {PhonePeProviderError} On timeout or network failure.
 */
export async function fetchPhonePe(url, options = {}, {
  operation = "phonepe.request",
  timeoutMs = PHONEPE_REQUEST_TIMEOUT_MS,
  fetchFn = fetch,
} = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetchFn(url, {
      ...options,
      signal: controller.signal,
    });
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new PhonePeProviderError("PhonePe request timed out.", {
        code: "PHONEPE_TIMEOUT",
        operation,
        cause: error,
      });
    }

    throw new PhonePeProviderError("PhonePe request failed.", {
      code: "PHONEPE_NETWORK_ERROR",
      operation,
      cause: error,
    });
  } finally {
    clearTimeout(timeout);
  }
}

export function getPhonePeEnvironment(value = getEnv("PHONEPE_ENV", "sandbox")) {
  const environment = String(value || "sandbox").trim().toLowerCase();
  if (environment === "sandbox" || environment === "production") return environment;

  throw new PhonePeConfigurationError("Invalid PHONEPE_ENV. Expected sandbox or production.", {
    code: "PHONEPE_INVALID_ENV",
  });
}

export function getPhonePeEndpoints(environment = getPhonePeEnvironment()) {
  return ENDPOINTS[getPhonePeEnvironment(environment)];
}

export function validateProductionBaseUrl(environment = getPhonePeEnvironment()) {
  if (getPhonePeEnvironment(environment) !== "production") return;

  if (getEnv("BASE_URL").trim() !== PHONEPE_PRODUCTION_BASE_URL) {
    throw new PhonePeConfigurationError(`PHONEPE_ENV=production requires BASE_URL ${PHONEPE_PRODUCTION_BASE_URL}.`, {
      code: "PHONEPE_INVALID_PRODUCTION_BASE_URL",
    });
  }
}

export function validateProductionRedirectUrl(redirectUrl, environment = getPhonePeEnvironment()) {
  if (getPhonePeEnvironment(environment) !== "production") return;

  let origin = "";
  try {
    origin = new URL(redirectUrl).origin;
  } catch {
    throw new PhonePeConfigurationError("Invalid PhonePe redirect URL.", {
      code: "PHONEPE_INVALID_REDIRECT_URL",
    });
  }

  if (origin !== PHONEPE_PRODUCTION_BASE_URL) {
    throw new PhonePeConfigurationError(`PHONEPE_ENV=production requires BASE_URL ${PHONEPE_PRODUCTION_BASE_URL}.`, {
      code: "PHONEPE_INVALID_PRODUCTION_BASE_URL",
    });
  }
}

export function clearPhonePeAccessTokenCache() {
  cachedToken = null;
}

async function getPhonePeAccessToken({ environment = getPhonePeEnvironment() } = {}) {
  const now = Math.floor(Date.now() / 1000);
  const clientId = requireEnv("PHONEPE_CLIENT_ID");
  const clientVersion = requireEnv("PHONEPE_CLIENT_VERSION");
  const clientSecret = requireEnv("PHONEPE_CLIENT_SECRET");

  if (
    cachedToken &&
    cachedToken.environment === environment &&
    cachedToken.clientId === clientId &&
    cachedToken.expiresAt > now + PHONEPE_TOKEN_REFRESH_BUFFER_SECONDS
  ) {
    return cachedToken;
  }

  const endpoints = getPhonePeEndpoints(environment);
  const body = new URLSearchParams({
    client_id: clientId,
    client_version: clientVersion,
    client_secret: clientSecret,
    grant_type: "client_credentials",
  });

  const response = await fetchPhonePe(endpoints.auth, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  }, { operation: "phonepe.auth.token" });
  const data = await parsePhonePeResponse(response);

  if (!response.ok || !data.access_token) {
    throw new PhonePeProviderError(data.message || "PhonePe authorization failed.", {
      code: "PHONEPE_AUTH_FAILED",
      operation: "phonepe.auth.token",
      responseStatus: response.status,
    });
  }

  cachedToken = {
    accessToken: data.access_token,
    tokenType: data.token_type || "O-Bearer",
    expiresAt: Number(data.expires_at || now + PHONEPE_FALLBACK_TOKEN_LIFETIME_SECONDS),
    environment,
    clientId,
  };

  return cachedToken;
}

async function parsePhonePeResponse(response) {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}
