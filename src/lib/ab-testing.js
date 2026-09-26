export const EXPERIMENT_ID = "am-vs-am2-v3";
export const ORIGINAL_VARIANT = "AM";
export const AM2_VARIANT = "AM2";
export const EXPERIMENT_COOKIE = "attractivemen-ab-v3";
export const EXPERIMENT_STORAGE = "attractivemen-ab-v3";
export const LANDING_ENTRY_STORAGE = "attractivemen-ab-landing-v3";
export const EXPERIMENT_ENABLED = false;
export const ASSIGNMENT_MAX_AGE_SECONDS = 90 * 24 * 60 * 60;

export async function resolveLandingRouteAsync(windowRef = globalThis.window) {
  if (!windowRef?.location || !["/a-m", "/AM2", "/am2"].includes(normalizePath(windowRef.location.pathname))) return null;
  if (import.meta.env?.DEV) {
    const previewVariant = new URL(windowRef.location.href).searchParams.get("previewVariant");
    if (normalizePath(windowRef.location.pathname) === "/a-m" && [ORIGINAL_VARIANT, AM2_VARIANT].includes(previewVariant)) {
      const previewUrl = new URL(windowRef.location.href);
      previewUrl.searchParams.delete("previewVariant");
      if (previewVariant === AM2_VARIANT) previewUrl.pathname = "/AM2";
      previewUrl.searchParams.set("utm_term", previewVariant);
      windowRef.history?.replaceState?.({}, "", `${previewUrl.pathname}${previewUrl.search}${previewUrl.hash}`);
      return { page: "landing", variant: previewVariant, preview: true };
    }
    return null;
  }
  let config = { enabled: false, amPercentage: 50, am2Percentage: 50 };
  try {
    const response = await fetch("/api/experiment/config", { headers: { Accept: "application/json" } });
    if (response.ok) config = await response.json();
  } catch {
    // A configuration outage fails closed to the original page.
  }
  return resolveLandingRoute(windowRef, config);
}

export function resolveLandingRoute(windowRef = globalThis.window, config = null) {
  if (!windowRef?.location) return null;
  const path = normalizePath(windowRef.location.pathname);
  if (path.toLowerCase() === "/am2" && !new URL(windowRef.location.href).searchParams.get("utm_term")) {
    replaceLandingQuery(windowRef, AM2_VARIANT);
    return null;
  }
  if (path !== "/a-m") return null;

  const experimentEnabled = config?.enabled ?? EXPERIMENT_ENABLED;
  if (!experimentEnabled) {
    replaceLandingQuery(windowRef, ORIGINAL_VARIANT);
    return { page: "landing", experiment: null };
  }

  const assignment = readAssignment(windowRef);
  const nextAssignment = assignment || assignVariant(windowRef, config);

  if (!nextAssignment) {
    replaceLandingQuery(windowRef, ORIGINAL_VARIANT);
    return { page: "landing", experiment: null };
  }

  if (nextAssignment.variant === AM2_VARIANT) {
    const destination = buildVariantUrl(windowRef.location, AM2_VARIANT);
    if (windowRef.location.replace) windowRef.location.replace(destination);
    return { page: "pending" };
  }

  replaceLandingQuery(windowRef, ORIGINAL_VARIANT);
  return { page: "landing", experiment: nextAssignment };
}

export function getExperimentContext(context = getBrowserContext()) {
  const assignment = readAssignment(context);
  const location = context.location || {};
  const pathname = normalizePath(location.pathname);
  const variant = pathname.toLowerCase() === "/am2" ? AM2_VARIANT : pathname === "/a-m" ? ORIGINAL_VARIANT : "";
  const storedVariant = assignment?.variant || "";
  const randomizedLanding = Boolean(assignment?.experimentId === EXPERIMENT_ID && storedVariant === variant);
  const effectiveVariant = variant || storedVariant;
  const visitorId = assignment?.visitorId || readOrCreateVisitorId(context);

  return {
    experiment_id: randomizedLanding || !variant ? assignment?.experimentId || "" : "",
    visitor_id: visitorId,
    page_variant: effectiveVariant,
    entry_type: randomizedLanding || !variant && assignment?.experimentId === EXPERIMENT_ID ? "randomized" : "direct",
  };
}

export function buildCheckoutTarget(path = "/a-m-checkout", windowRef = globalThis.window) {
  if (!windowRef?.location) return path;

  const url = new URL(windowRef.location.href);
  url.pathname = path;
  url.hash = "";
  return `${url.pathname}${url.search}`;
}

export function sendExperimentLanding(windowRef = globalThis.window) {
  const context = getExperimentContext({
    location: windowRef?.location,
    document: windowRef?.document,
    storage: getWindowStorage(windowRef, "localStorage"),
    sessionStorage: getWindowStorage(windowRef, "sessionStorage"),
  });
  const dedupeKey = `${context.experiment_id || "direct"}:${context.visitor_id}:${context.page_variant}`;
  const sessionStorage = getWindowStorage(windowRef, "sessionStorage");

  if (!context.page_variant || readLandingMarker(sessionStorage) === dedupeKey) return false;
  writeLandingMarker(sessionStorage, dedupeKey);

  void fetch("/api/experiment/landing", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...context,
      marketing: readMarketing(windowRef.location?.search),
      landing_path: windowRef.location?.pathname || "",
    }),
    keepalive: true,
  }).catch(() => undefined);

  return true;
}

export function getExperimentTracking(context = getBrowserContext()) {
  return getExperimentContext(context);
}

function assignVariant(windowRef, config = null) {
  const amPercentage = Number(config?.amPercentage);
  const normalizedAmPercentage = Number.isFinite(amPercentage) ? Math.min(100, Math.max(0, amPercentage)) : 50;
  const variant = Math.random() * 100 < normalizedAmPercentage ? ORIGINAL_VARIANT : AM2_VARIANT;
  const assignment = {
    experimentId: EXPERIMENT_ID,
    variant,
    visitorId: readPreviousVisitorId(windowRef) || createVisitorId(windowRef),
  };
  return writeAssignment(windowRef, assignment) ? assignment : null;
}

function readAssignment(context) {
  const cookieAssignment = parseAssignment(context.document?.cookie || "");
  if (cookieAssignment) return cookieAssignment;

  const localAssignment = readStoredAssignment(getContextStorage(context, "storage", "localStorage"));
  if (localAssignment) return localAssignment;
  return readStoredAssignment(getContextStorage(context, "sessionStorage"));
}

function readStoredAssignment(storage) {
  try {
    const stored = JSON.parse(storage?.getItem(EXPERIMENT_STORAGE) || "null");
    return isValidAssignment(stored) ? stored : null;
  } catch {
    return null;
  }
}

function writeAssignment(windowRef, assignment) {
  const value = encodeURIComponent(JSON.stringify(assignment));
  let persisted = false;
  try {
    windowRef.document.cookie = `${EXPERIMENT_COOKIE}=${value}; Max-Age=${ASSIGNMENT_MAX_AGE_SECONDS}; Path=/; SameSite=Lax`;
    persisted = parseAssignment(windowRef.document.cookie || "")?.visitorId === assignment.visitorId;
  } catch {
    // Storage failures must not block the landing page.
  }
  try {
    windowRef.localStorage?.setItem(EXPERIMENT_STORAGE, JSON.stringify(assignment));
    persisted = true;
  } catch {
    // Try session storage independently when persistent storage is unavailable.
  }
  try {
    windowRef.sessionStorage?.setItem(EXPERIMENT_STORAGE, JSON.stringify(assignment));
    persisted = true;
  } catch {
    // The caller falls back to the control page if every storage option fails.
  }
  return persisted;
}

function parseAssignment(cookieHeader) {
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${EXPERIMENT_COOKIE}=([^;]+)`));
  if (!match) return null;

  try {
    const assignment = JSON.parse(decodeURIComponent(match[1]));
    return isValidAssignment(assignment) ? assignment : null;
  } catch {
    return null;
  }
}

function readPreviousVisitorId(context) {
  const priorCookie = context.document?.cookie?.match(/(?:^|;\s*)attractivemen-ab-v1=([^;]+)/)?.[1];
  const priorStorage = (() => {
    try {
      return getContextStorage(context, "storage", "localStorage")?.getItem("attractivemen-ab-v1") || "";
    } catch {
      return "";
    }
  })();

  for (const value of [priorCookie, priorStorage]) {
    if (!value) continue;
    try {
      const assignment = JSON.parse(decodeURIComponent(value));
      if (typeof assignment?.visitorId === "string" && assignment.visitorId) return assignment.visitorId;
    } catch {
      continue;
    }
  }

  return "";
}

function isValidAssignment(value) {
  return value?.experimentId === EXPERIMENT_ID && [ORIGINAL_VARIANT, AM2_VARIANT].includes(value.variant) && Boolean(value.visitorId);
}

function readOrCreateVisitorId(context) {
  const key = "attractivemen-ab-visitor-v1";
  const sessionStorage = getContextStorage(context, "sessionStorage");
  const storage = getContextStorage(context, "storage", "localStorage");
  let current = readStorageValue(sessionStorage, key);
  if (!current) current = readStorageValue(storage, key);
  if (current) return current;

  const visitorId = createVisitorId({ crypto: globalThis.crypto });
  const savedInSession = writeStorageValue(sessionStorage, key, visitorId);
  const savedPersistently = writeStorageValue(storage, key, visitorId);
  return savedInSession || savedPersistently ? visitorId : "anonymous";
}

function readStorageValue(storage, key) {
  try {
    return storage?.getItem(key) || "";
  } catch {
    return "";
  }
}

function writeStorageValue(storage, key, value) {
  try {
    storage?.setItem(key, value);
    return Boolean(storage);
  } catch {
    return false;
  }
}

function createVisitorId(windowRef) {
  const uuid = windowRef?.crypto?.randomUUID?.();
  if (uuid) return uuid.replace(/-/g, "");
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
}

function replaceLandingQuery(windowRef, variant) {
  const url = new URL(windowRef.location.href);
  url.searchParams.set("utm_term", variant);
  windowRef.history?.replaceState?.({}, "", `${url.pathname}${url.search}${url.hash}`);
}

function buildVariantUrl(location, variant) {
  const url = new URL(location.href);
  url.pathname = "/AM2";
  url.searchParams.set("utm_term", variant);
  return `${url.pathname}${url.search}${url.hash}`;
}

function readMarketing(search = "") {
  const params = new URLSearchParams(search);
  return {
    ...Object.fromEntries(["source", "medium", "campaign", "content", "term", "id"].map((key) => [key, params.get(key === "source" ? "utm_source" : `utm_${key}`) || ""])),
    gclid: params.get("gclid") || "",
    gbraid: params.get("gbraid") || "",
    wbraid: params.get("wbraid") || "",
    fbclid: params.get("fbclid") || "",
  };
}

function readLandingMarker(storage) {
  try { return storage?.getItem(LANDING_ENTRY_STORAGE) || ""; } catch { return ""; }
}

function writeLandingMarker(storage, value) {
  try { storage?.setItem(LANDING_ENTRY_STORAGE, value); } catch { /* best effort */ }
}

function normalizePath(pathname) {
  const path = String(pathname || "/").replace(/\/+$/, "");
  return path || "/";
}

function getContextStorage(context, ...keys) {
  try {
    for (const key of keys) {
      const storage = context?.[key];
      if (storage) return storage;
    }
  } catch {
    return undefined;
  }
  return undefined;
}

function getWindowStorage(windowRef, key) {
  try {
    return windowRef?.[key];
  } catch {
    return undefined;
  }
}

function getBrowserContext() {
  const windowRef = globalThis.window;
  return {
    location: windowRef?.location,
    document: windowRef?.document,
    storage: getWindowStorage(windowRef, "localStorage"),
    sessionStorage: getWindowStorage(windowRef, "sessionStorage"),
  };
}
