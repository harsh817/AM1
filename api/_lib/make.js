import { getEnv } from "./env.js";

export async function forwardMakeWebhook(event, payload, webhookUrlEnvName = "MAKE_WEBHOOK_URL") {
  return postMakeWebhook({
    event,
    occurredAt: new Date().toISOString(),
    payload,
  }, webhookUrlEnvName);
}

export async function forwardMakeWebhookPayload(payload, webhookUrlEnvName = "MAKE_WEBHOOK_URL") {
  return postMakeWebhook(payload, webhookUrlEnvName);
}

async function postMakeWebhook(payload, webhookUrlEnvName) {
  const webhookUrl = getEnv(webhookUrlEnvName);
  if (!webhookUrl) return { sent: false };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2500);

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
