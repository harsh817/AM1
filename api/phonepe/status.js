import { getQueryParam, readJson, sendJson } from "../_lib/http.js";
import { forwardMakeWebhookPayload } from "../_lib/make.js";
import { buildPaymentStatusPayload } from "../_lib/payment-status-webhook.js";
import { getPhonePeOrderStatus } from "../_lib/phonepe.js";

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    return sendJson(res, 405, { message: "Method not allowed." });
  }

  let payload = {};
  try {
    payload = req.method === "POST" ? await readJson(req) : {};
  } catch {
    return sendJson(res, 400, { message: "Invalid status payload." });
  }

  const merchantOrderId = cleanOrderId(payload.merchantOrderId || getQueryParam(req, "merchantOrderId"));
  const tracking = payload.tracking || {};
  if (!/^[A-Za-z0-9_-]{1,63}$/.test(merchantOrderId)) {
    return sendJson(res, 400, { message: "Invalid order id." });
  }

  try {
    const status = await getPhonePeOrderStatus(merchantOrderId);

    if (status.state === "COMPLETED" || status.state === "FAILED") {
      await forwardMakeWebhookPayload(buildPaymentStatusPayload({
        merchantOrderId,
        req,
        status,
        tracking,
      }));
    }

    return sendJson(res, 200, status);
  } catch (error) {
    return sendJson(res, 502, {
      message: error instanceof Error ? error.message : "Payment status could not be checked.",
    });
  }
}

function cleanOrderId(value) {
  return String(value ?? "").trim();
}
