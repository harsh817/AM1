import crypto from "node:crypto";
import { getEnv } from "../env.js";
import { getHeader } from "../http.js";
import { forwardMakeWebhookPayload } from "../make.js";
import { buildPhonePeWebhookPayload } from "../phonepe-webhook-payload.js";

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

export async function handlePhonePeWebhook({
  req,
  rawBody = "",
  credentials,
  forwardWebhook = forwardMakeWebhookPayload,
} = {}) {
  if (!verifyPhonePeWebhookRequest(req, credentials)) {
    throw new PhonePeWebhookVerificationError();
  }

  const payload = parseWebhookPayload(rawBody);
  await forwardWebhook(buildPhonePeWebhookPayload({ payload, req }));

  return { received: true };
}

export function verifyPhonePeWebhookRequest(req, credentials = {}) {
  const username = credentials.username ?? getEnv("PHONEPE_WEBHOOK_USERNAME");
  const password = credentials.password ?? getEnv("PHONEPE_WEBHOOK_PASSWORD");
  if (!username || !password) return false;

  const authorization = getHeader(req, "authorization").replace(/^sha256\s+/i, "").trim();
  const expected = createWebhookSignature({ username, password });

  return timingSafeEqualString(authorization, expected);
}

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
