import { createHmac, timingSafeEqual } from "node:crypto";
import { getEnv } from "./env.js";

const lifetimeMs = 24 * 60 * 60 * 1000;

export function issueQuizRetryToken(orderId, now = Date.now(), secret = getEnv("CONVEX_INGEST_TOKEN")) {
  if (!secret) return "";
  const expires = now + lifetimeMs;
  return `${expires}.${sign(orderId, expires, secret)}`;
}

export function verifyQuizRetryToken(orderId, token, now = Date.now(), secret = getEnv("CONVEX_INGEST_TOKEN")) {
  if (!secret || !/^\d{13}\.[0-9a-f]{64}$/.test(token)) return false;
  const [expires, signature] = token.split(".");
  if (Number(expires) < now) return false;
  return timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(sign(orderId, expires, secret), "hex"));
}

function sign(orderId, expires, secret) {
  return createHmac("sha256", secret).update(`styleiq-retry:v1:${orderId}:${expires}`).digest("hex");
}
