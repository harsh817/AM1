import { isBodyTooLargeError, readJson, sendJson } from "../_lib/http.js";
import { recordExperimentLanding } from "../_lib/experiment-landing.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return sendJson(res, 405, { message: "Method not allowed." });

  try {
    const payload = await readJson(req);
    const result = await recordExperimentLanding({ payload, req });
    return sendJson(res, 200, result);
  } catch (error) {
    if (isBodyTooLargeError(error)) return sendJson(res, 413, { message: "Request body is too large." });
    if (error instanceof SyntaxError || error.statusCode === 400) {
      return sendJson(res, 400, { message: "Invalid experiment landing payload." });
    }
    if (error.statusCode === 429) return sendJson(res, 429, { message: "Experiment tracking is temporarily rate limited." });
    return sendJson(res, 502, { message: "Experiment tracking could not be recorded." });
  }
}
