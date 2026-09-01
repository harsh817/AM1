import {
  BODY_TOO_LARGE_MESSAGE,
  isBodyTooLargeError,
  readJson,
  sendJson,
} from "../_lib/http.js";
import {
  createCheckoutPaymentOrder,
  isCheckoutValidationError,
} from "../_lib/payment/create-order-service.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return sendJson(res, 405, { message: "Method not allowed." });
  }

  try {
    const payload = await readJson(req);
    const result = await createCheckoutPaymentOrder({ payload, req });
    return sendJson(res, 200, result);
  } catch (error) {
    if (isBodyTooLargeError(error)) {
      return sendJson(res, 413, { message: BODY_TOO_LARGE_MESSAGE });
    }

    if (error instanceof SyntaxError) {
      return sendJson(res, 400, { message: "Invalid checkout payload." });
    }

    if (isCheckoutValidationError(error)) {
      return sendJson(res, 400, { message: error.message, errors: error.errors });
    }

    return sendJson(res, 502, { message: "Payment could not be started. Please try again." });
  }
}
