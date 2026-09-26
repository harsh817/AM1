export function buildPaymentEventId(eventName, merchantOrderId) {
  const eventToken = toEventToken(eventName);
  const orderToken = String(merchantOrderId ?? "").trim();
  if (!eventToken || !orderToken) return "";

  return `am_${eventToken}_${hashString(`${eventToken}:${orderToken}`)}`;
}

export function createOpaqueToken(windowRef) {
  const uuid = windowRef?.crypto?.randomUUID?.();
  if (uuid) return uuid.replace(/[^a-zA-Z0-9]/g, "").slice(0, 24).toLowerCase();

  const randomValue = Math.random().toString(36).slice(2, 12);
  return `${Date.now().toString(36)}${randomValue}`;
}

export function getPixelValue(amountPaise) {
  const amount = Number(amountPaise);
  if (!Number.isFinite(amount) || amount <= 0) return null;

  return Math.round(amount) / 100;
}

export function toCurrency(value, fallback = "INR") {
  const currency = String(value || fallback).trim().toUpperCase();
  return /^[A-Z]{3}$/.test(currency) ? currency : fallback;
}

export function toSafeRoute(value) {
  const route = String(value ?? "").trim();
  return route.startsWith("/") ? route.slice(0, 80) : "";
}

export function toSafeValue(value) {
  return String(value ?? "")
    .trim()
    .replace(/[^a-zA-Z0-9_.-]/g, "_")
    .slice(0, 80);
}

export function toEventToken(value) {
  return String(value ?? "")
    .trim()
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase()
    .slice(0, 40);
}

export function removeEmptyValues(values) {
  return Object.fromEntries(
    Object.entries(values).filter(([, value]) => value !== "" && value !== null && value !== undefined),
  );
}

export function insertAsyncScript(documentRef, id, src) {
  if (documentRef.getElementById(id)) return;

  const script = documentRef.createElement("script");
  script.id = id;
  script.async = true;
  script.src = src;

  const firstScript = documentRef.getElementsByTagName("script")[0];
  if (firstScript?.parentNode) {
    firstScript.parentNode.insertBefore(script, firstScript);
    return;
  }

  documentRef.head?.appendChild(script);
}

function hashString(value) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(36);
}
