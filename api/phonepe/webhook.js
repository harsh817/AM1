import crypto from "node:crypto";
import { getEnv } from "../_lib/env.js";
import { getHeader, readBody, sendJson } from "../_lib/http.js";
import { forwardMakeWebhookPayload } from "../_lib/make.js";
import { buildPhonePeWebhookPayload } from "../_lib/phonepe-webhook-payload.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return sendJson(res, 405, { message: "Method not allowed." });
  }

  const rawBody = await readBody(req);
  const isVerified = verifyShaWebhook(req);
  if (!isVerified) {
    return sendJson(res, 401, { message: "Webhook verification failed." });
  }

  let payload = {};
  try {
    payload = rawBody ? JSON.parse(rawBody) : {};
  } catch {
    return sendJson(res, 400, { message: "Invalid webhook payload." });
  }

  await forwardMakeWebhookPayload(buildPhonePeWebhookPayload({ payload, req }));
  return sendJson(res, 200, { received: true });
}

function verifyShaWebhook(req) {
  const username = getEnv("PHONEPE_WEBHOOK_USERNAME");
  const password = getEnv("PHONEPE_WEBHOOK_PASSWORD");
  if (!username || !password) return false;

  const authorization = getHeader(req, "authorization").replace(/^sha256\s+/i, "").trim();
  const expected = crypto.createHash("sha256").update(`${username}:${password}`).digest("hex");
  return timingSafeEqual(authorization, expected);
}

function timingSafeEqual(actual, expected) {
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);
  return actualBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(actualBuffer, expectedBuffer);
}
