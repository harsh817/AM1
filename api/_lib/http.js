export const DEFAULT_MAX_BODY_BYTES = 64 * 1024;
export const BODY_TOO_LARGE_MESSAGE = "Request payload is too large.";

export class BodyTooLargeError extends Error {
  constructor(maxBytes) {
    super(`Request body exceeds ${maxBytes} bytes.`);
    this.name = "BodyTooLargeError";
    this.statusCode = 413;
  }
}

export function isBodyTooLargeError(error) {
  return error instanceof BodyTooLargeError;
}

export async function readJson(req, options = {}) {
  const body = await readBody(req, options);
  if (!body) return {};
  return JSON.parse(body);
}

export async function readBody(req, options = {}) {
  const maxBytes = getMaxBodyBytes(options);
  assertContentLengthWithinLimit(req, maxBytes);

  if (typeof req.body === "string") {
    assertBodySize(Buffer.byteLength(req.body, "utf8"), maxBytes);
    return req.body;
  }

  if (Buffer.isBuffer(req.body)) {
    assertBodySize(req.body.length, maxBytes);
    return req.body.toString("utf8");
  }

  if (req.body && typeof req.body === "object") {
    const body = JSON.stringify(req.body);
    assertBodySize(Buffer.byteLength(body, "utf8"), maxBytes);
    return body;
  }

  const chunks = [];
  let totalBytes = 0;

  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    totalBytes += buffer.length;
    assertBodySize(totalBytes, maxBytes);
    chunks.push(buffer);
  }

  return Buffer.concat(chunks, totalBytes).toString("utf8");
}

export function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

export function getQueryParam(req, name) {
  if (req.query?.[name]) return Array.isArray(req.query[name]) ? req.query[name][0] : req.query[name];
  const url = new URL(req.url, `https://${req.headers.host || "localhost"}`);
  return url.searchParams.get(name) || "";
}

export function getHeader(req, name) {
  const value = req?.headers?.[name.toLowerCase()];
  return Array.isArray(value) ? value[0] : value || "";
}

function getMaxBodyBytes({ maxBytes = DEFAULT_MAX_BODY_BYTES } = {}) {
  const parsed = Number(maxBytes);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_MAX_BODY_BYTES;
}

function assertContentLengthWithinLimit(req, maxBytes) {
  const contentLength = Number.parseInt(getHeader(req, "content-length"), 10);
  if (Number.isFinite(contentLength)) assertBodySize(contentLength, maxBytes);
}

function assertBodySize(byteLength, maxBytes) {
  if (byteLength > maxBytes) throw new BodyTooLargeError(maxBytes);
}
