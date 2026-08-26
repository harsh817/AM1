import {
  BODY_TOO_LARGE_MESSAGE,
  getQueryParam,
  isBodyTooLargeError,
  readJson,
  sendJson,
} from "../_lib/http.js";
import {
  checkPaymentOrderStatus,
  isInvalidMerchantOrderIdError,
} from "../_lib/payment/status-service.js";

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    return sendJson(res, 405, { message: "Method not allowed." });
  }

  let payload = {};
  try {
    payload = req.method === "POST" ? await readJson(req) : {};
  } catch (error) {
    if (isBodyTooLargeError(error)) {
      return sendJson(res, 413, { message: BODY_TOO_LARGE_MESSAGE });
    }

    return sendJson(res, 400, { message: "Invalid status payload." });
  }

  const merchantOrderId = payload.merchantOrderId || getQueryParam(req, "merchantOrderId");
  const tracking = payload.tracking || {};

  try {
    const status = await checkPaymentOrderStatus({ merchantOrderId, req, tracking });
    return sendJson(res, 200, status);
  } catch (error) {
    if (isInvalidMerchantOrderIdError(error)) {
      return sendJson(res, 400, { message: error.message });
    }

    return sendJson(res, 502, {
      message: error instanceof Error ? error.message : "Payment status could not be checked.",
    });
  }
}
