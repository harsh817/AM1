import { isBodyTooLargeError, readJson, sendJson } from "../_lib/http.js";
import { recordExperimentCheckout } from "../_lib/experiment-checkout.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return sendJson(res, 405, { message: "Method not allowed." });
  try {
    const payload = await readJson(req);
    return sendJson(res, 200, await recordExperimentCheckout({ payload, req }));
  } catch (error) {
    if (isBodyTooLargeError(error)) return sendJson(res, 413, { message: "Request body is too large." });
    if (error instanceof SyntaxError || error.statusCode === 400) return sendJson(res, 400, { message: "Invalid checkout tracking payload." });
    return sendJson(res, 502, { message: "Checkout tracking could not be recorded." });
  }
}
