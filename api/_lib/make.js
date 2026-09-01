import { MAKE_WEBHOOK_TIMEOUT_MS } from "./constants.js";
import { getEnv } from "./env.js";

/**
 * Sends a named event wrapper to Make for legacy tracking consumers.
 *
 * @param {string} event - Event name sent to Make.
 * @param {object} payload - Event payload body.
 * @param {string} webhookUrlEnvName - Env var that contains the Make webhook URL.
 * @returns {Promise<object>} Delivery result without throwing on network failure.
 */
export async function forwardMakeWebhook(event, payload, webhookUrlEnvName = "MAKE_WEBHOOK_URL") {
  return postMakeWebhook({
    event,
    occurredAt: new Date().toISOString(),
    payload,
  }, webhookUrlEnvName);
}

/**
 * Sends a sheet-ready payload directly to the configured Make webhook.
 *
 * @param {object} payload - Already normalized Make payload.
 * @param {string} webhookUrlEnvName - Env var that contains the Make webhook URL.
 * @returns {Promise<object>} Delivery result without blocking checkout on failure.
 */
export async function forwardMakeWebhookPayload(payload, webhookUrlEnvName = "MAKE_WEBHOOK_URL") {
  return postMakeWebhook(payload, webhookUrlEnvName);
}

async function postMakeWebhook(payload, webhookUrlEnvName) {
  const webhookUrl = getEnv(webhookUrlEnvName);
  if (!webhookUrl) return { sent: false };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), MAKE_WEBHOOK_TIMEOUT_MS);

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    return { sent: true, status: response.status, ok: response.ok };
  } catch {
    return { sent: false };
  } finally {
    clearTimeout(timeout);
  }
}
