import crypto from "node:crypto";
import { getEnv } from "../env.js";
import { getHeader } from "../http.js";
import { forwardMakeWebhookPayload } from "../make.js";
import { getPaymentErrorType, logPaymentEvent } from "../payment-logger.js";
import { buildPhonePeWebhookPayload } from "../phonepe-webhook-payload.js";

const WEBHOOK_ROUTE = "/api/phonepe/webhook";
const WEBHOOK_OPERATION = "phonepe.webhook";

export class PhonePeWebhookVerificationError extends Error {
  constructor() {
    super("Webhook verification failed.");
    this.name = "PhonePeWebhookVerificationError";
    this.statusCode = 401;
  }
}

export class PhonePeWebhookPayloadError extends Error {
  constructor() {
    super("Invalid webhook payload.");
    this.name = "PhonePeWebhookPayloadError";
    this.statusCode = 400;
  }
}

export function isPhonePeWebhookVerificationError(error) {
  return error instanceof PhonePeWebhookVerificationError;
}

export function isPhonePeWebhookPayloadError(error) {
  return error instanceof PhonePeWebhookPayloadError;
}

/**
 * Verifies a PhonePe webhook, normalizes the raw payload, and forwards it to Make.
 *
 * @param {object} input - Request, raw body, optional credentials, and injectable webhook sender.
 * @returns {Promise<object>} A receipt showing the webhook was accepted.
 * @throws {PhonePeWebhookVerificationError} When authorization verification fails.
 * @throws {PhonePeWebhookPayloadError} When the raw body is not valid JSON.
 */
export async function handlePhonePeWebhook({
  req,
  rawBody = "",
  credentials,
  forwardWebhook = forwardMakeWebhookPayload,
  logger = logPaymentEvent,
} = {}) {
  if (!verifyPhonePeWebhookRequest(req, credentials)) {
    logger("phonepe.webhook_failed", {
      level: "warn",
      operation: WEBHOOK_OPERATION,
      route: WEBHOOK_ROUTE,
      errorType: "PhonePeWebhookVerificationError",
    });
    throw new PhonePeWebhookVerificationError();
  }

  let makePayload;
  try {
    const payload = parseWebhookPayload(rawBody);
    makePayload = buildPhonePeWebhookPayload({ payload, req });
    await forwardWebhook(makePayload);
  } catch (error) {
    logger("phonepe.webhook_failed", {
      level: "error",
      operation: WEBHOOK_OPERATION,
      route: WEBHOOK_ROUTE,
      merchantOrderId: makePayload?.merchant_order_id,
      phonePeOrderId: makePayload?.phonepe_order_id,
      paymentState: makePayload?.payment_state,
      errorType: getPaymentErrorType(error),
    });
    throw error;
  }

  logger("phonepe.webhook_accepted", {
    operation: WEBHOOK_OPERATION,
    route: WEBHOOK_ROUTE,
    merchantOrderId: makePayload.merchant_order_id,
    phonePeOrderId: makePayload.phonepe_order_id,
    paymentState: makePayload.payment_state,
  });

  return { received: true };
}

/**
 * Validates PhonePe's SHA-256 authorization header against webhook credentials.
 *
 * @param {object} req - Incoming webhook request.
 * @param {object} credentials - Optional username/password override for tests.
 * @returns {boolean} Whether the request is authorized.
 */
export function verifyPhonePeWebhookRequest(req, credentials = {}) {
  const username = credentials.username ?? getEnv("PHONEPE_WEBHOOK_USERNAME");
  const password = credentials.password ?? getEnv("PHONEPE_WEBHOOK_PASSWORD");
  if (!username || !password) return false;

  const authorization = getHeader(req, "authorization").replace(/^sha256\s+/i, "").trim();
  const expected = createWebhookSignature({ username, password });

  return timingSafeEqualString(authorization, expected);
}

/**
 * Creates the expected PhonePe webhook SHA-256 signature.
 *
 * @param {object} input
 * @param {string} input.username - PhonePe webhook username.
 * @param {string} input.password - PhonePe webhook password.
 * @returns {string} Hex-encoded SHA-256 signature.
 */
export function createWebhookSignature({ username, password }) {
  return crypto.createHash("sha256").update(`${username}:${password}`).digest("hex");
}

function parseWebhookPayload(rawBody) {
  if (!rawBody) return {};

  try {
    return JSON.parse(rawBody);
  } catch {
    throw new PhonePeWebhookPayloadError();
  }
}

function timingSafeEqualString(actual, expected) {
  const actualBuffer = Buffer.from(String(actual));
  const expectedBuffer = Buffer.from(String(expected));
  return actualBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(actualBuffer, expectedBuffer);
}
