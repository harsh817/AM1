import { timingSafeEqual } from "node:crypto";
import { getEnv } from "../_lib/env.js";
import { getHeader, isBodyTooLargeError, readJson, sendJson } from "../_lib/http.js";
import { recordConvexAssessment } from "../_lib/convex.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return sendJson(res, 405, { message: "Method not allowed." });
  const secret = Buffer.from(getEnv("STYLEIQ_ASSESSMENT_WEBHOOK_TOKEN"));
  const provided = Buffer.from(getHeader(req, "authorization").replace(/^Bearer /i, ""));
  if (!secret.length || secret.length !== provided.length || !timingSafeEqual(secret, provided)) {
    return sendJson(res, 401, { message: "Assessment intake is not authorized." });
  }
  let body;
  try {
    body = await readJson(req, { maxBytes: 4096 });
  } catch (error) {
    return sendJson(res, isBodyTooLargeError(error) ? 413 : 400, { message: "Invalid assessment request." });
  }
  const { responseId, merchantOrderId, name, email, phone, photos } = body || {};
  if (typeof responseId !== "string" || !/^[\w-]{1,200}$/.test(responseId) ||
      ![merchantOrderId, name, email, phone].every((value) => typeof value === "string" && value.length <= 256) ||
      !photos || !["front", "side", "fullLength"].every((angle) => typeof photos[angle] === "boolean")) {
    return sendJson(res, 400, { message: "Invalid assessment fields." });
  }
  try {
    const result = await recordConvexAssessment({
      responseId, merchantOrderId: merchantOrderId.trim(), name, email, phone,
      photos: { front: photos.front, side: photos.side, fullLength: photos.fullLength },
      receivedAt: Date.now(),
    });
    return sendJson(res, 200, result);
  } catch {
    return sendJson(res, 503, { message: "Assessment intake is unavailable. Retry with the same response ID." });
  }
}
