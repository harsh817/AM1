import {
  PHONEPE_FALLBACK_TOKEN_LIFETIME_SECONDS,
  PHONEPE_ORDER_EXPIRY_SECONDS,
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

export async function createPhonePePayment({
  merchantOrderId,
  amountPaise,
  redirectUrl,
  phoneNumber,
  metaInfo,
}) {
  const endpoints = getPhonePeEndpoints();
  const auth = await getPhonePeAccessToken();
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

  const response = await fetch(endpoints.pay, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `${auth.tokenType} ${auth.accessToken}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await parsePhonePeResponse(response);

  if (!response.ok || !data.redirectUrl) {
    throw new Error(data.message || "PhonePe payment could not be started.");
  }

  return data;
}

export async function getPhonePeOrderStatus(merchantOrderId) {
  const endpoints = getPhonePeEndpoints();
  const auth = await getPhonePeAccessToken();
  const statusUrl = new URL(`${endpoints.status}/${encodeURIComponent(merchantOrderId)}/status`);
  statusUrl.searchParams.set("details", "true");
  statusUrl.searchParams.set("errorContext", "true");

  const response = await fetch(statusUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `${auth.tokenType} ${auth.accessToken}`,
    },
  });
  const data = await parsePhonePeResponse(response);

  if (!response.ok) {
    throw new Error(data.message || "PhonePe order status could not be checked.");
  }

  return data;
}

async function getPhonePeAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedToken.expiresAt > now + PHONEPE_TOKEN_REFRESH_BUFFER_SECONDS) return cachedToken;

  const endpoints = getPhonePeEndpoints();
  const body = new URLSearchParams({
    client_id: requireEnv("PHONEPE_CLIENT_ID"),
    client_version: requireEnv("PHONEPE_CLIENT_VERSION"),
    client_secret: requireEnv("PHONEPE_CLIENT_SECRET"),
    grant_type: "client_credentials",
  });

  const response = await fetch(endpoints.auth, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const data = await parsePhonePeResponse(response);

  if (!response.ok || !data.access_token) {
    throw new Error(data.message || "PhonePe authorization failed.");
  }

  cachedToken = {
    accessToken: data.access_token,
    tokenType: data.token_type || "O-Bearer",
    expiresAt: Number(data.expires_at || now + PHONEPE_FALLBACK_TOKEN_LIFETIME_SECONDS),
  };

  return cachedToken;
}

function getPhonePeEndpoints() {
  const env = getEnv("PHONEPE_ENV", "sandbox").toLowerCase();
  return ENDPOINTS[env] || ENDPOINTS.sandbox;
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
