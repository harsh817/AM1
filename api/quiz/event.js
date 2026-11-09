import { isBodyTooLargeError, readJson, sendJson } from "../_lib/http.js";
import { recordQuizEvent } from "../_lib/quiz-event.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return sendJson(res, 405, { message: "Method not allowed." });
  try {
    return sendJson(res, 200, await recordQuizEvent({ payload: await readJson(req, { maxBytes: 8_000 }), req }));
  } catch (error) {
    if (isBodyTooLargeError(error)) return sendJson(res, 413, { message: "Request body is too large." });
    if (error instanceof SyntaxError || error.statusCode === 400) return sendJson(res, 400, { message: "Invalid quiz event." });
    if (error.statusCode === 429) return sendJson(res, 429, { message: "Quiz tracking is temporarily rate limited." });
    return sendJson(res, 502, { message: "Quiz progress could not be recorded." });
  }
}
