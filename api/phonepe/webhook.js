import {
  BODY_TOO_LARGE_MESSAGE,
  isBodyTooLargeError,
  readBody,
  sendJson,
} from "../_lib/http.js";
import {
  handlePhonePeWebhook,
  isPhonePeWebhookPayloadError,
  isPhonePeWebhookVerificationError,
} from "../_lib/payment/webhook-service.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return sendJson(res, 405, { message: "Method not allowed." });
  }

  let rawBody = "";
  try {
    rawBody = await readBody(req);
  } catch (error) {
    if (isBodyTooLargeError(error)) {
      return sendJson(res, 413, { message: BODY_TOO_LARGE_MESSAGE });
    }

    return sendJson(res, 400, { message: "Invalid webhook payload." });
  }

  try {
    const result = await handlePhonePeWebhook({ req, rawBody });
    return sendJson(res, 200, result);
  } catch (error) {
    if (isPhonePeWebhookVerificationError(error) || isPhonePeWebhookPayloadError(error)) {
      return sendJson(res, error.statusCode, { message: error.message });
    }

    return sendJson(res, 502, { message: "Webhook could not be processed." });
  }
}
