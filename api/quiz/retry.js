import { readJson, sendJson } from "../_lib/http.js";
import { verifyQuizRetryToken } from "../_lib/quiz-retry.js";
import { getConvexQuizRetry } from "../_lib/convex.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return sendJson(res, 405, { message: "Method not allowed." });
  let payload;
  try {
    payload = await readJson(req, { maxBytes: 1024 });
  } catch {
    return sendJson(res, 400, { message: "Invalid retry request." });
  }
  const { orderId, token } = payload || {};
  if (typeof orderId !== "string" || !/^[A-Za-z0-9_-]{1,64}$/.test(orderId) || typeof token !== "string" || !verifyQuizRetryToken(orderId, token)) {
    return sendJson(res, 403, { message: "This retry link is unavailable." });
  }
  try {
    const details = await getConvexQuizRetry(orderId);
    if (!details) return sendJson(res, 404, { message: "No failed quiz order was found." });
    return sendJson(res, 200, { details });
  } catch {
    return sendJson(res, 503, { message: "Order details could not be restored." });
  }
}
