export const EXPERIMENT_ID = "am-vs-am2-v2";
export const ORIGINAL_VARIANT = "AM";
export const AM2_VARIANT = "AM2";
export const EXPERIMENT_COOKIE = "attractivemen-ab-v1";
export const EXPERIMENT_STORAGE = "attractivemen-ab-v1";
export const LANDING_ENTRY_STORAGE = "attractivemen-ab-landing-v1";
export const EXPERIMENT_ENABLED = true;
export const ASSIGNMENT_MAX_AGE_SECONDS = 90 * 24 * 60 * 60;

export async function resolveLandingRouteAsync(windowRef = globalThis.window) {
  if (!windowRef?.location || !["/a-m", "/AM2", "/am2"].includes(normalizePath(windowRef.location.pathname))) return null;
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
    storage: windowRef?.localStorage,
    sessionStorage: windowRef?.sessionStorage,
  });
  const dedupeKey = `${context.experiment_id || "direct"}:${context.visitor_id}:${context.page_variant}`;
  const sessionStorage = windowRef?.sessionStorage;

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
    visitorId: createVisitorId(windowRef),
  };
  writeAssignment(windowRef, assignment);
  return assignment;
}

function readAssignment(context) {
  const cookieAssignment = parseAssignment(context.document?.cookie || "");
  if (cookieAssignment) return cookieAssignment;

  try {
    const storage = context.storage || context.localStorage;
    const stored = JSON.parse(storage?.getItem(EXPERIMENT_STORAGE) || "null");
    return isValidAssignment(stored) ? stored : null;
  } catch {
    return null;
  }
}

function writeAssignment(windowRef, assignment) {
  const value = encodeURIComponent(JSON.stringify(assignment));
  try {
    windowRef.document.cookie = `${EXPERIMENT_COOKIE}=${value}; Max-Age=${ASSIGNMENT_MAX_AGE_SECONDS}; Path=/; SameSite=Lax`;
  } catch {
    // Storage failures must not block the landing page.
  }
  try {
    windowRef.localStorage?.setItem(EXPERIMENT_STORAGE, JSON.stringify(assignment));
    windowRef.sessionStorage?.setItem(EXPERIMENT_STORAGE, JSON.stringify(assignment));
  } catch {
    // Storage failures are handled by the original-page fallback.
  }
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

function isValidAssignment(value) {
  return value?.experimentId === EXPERIMENT_ID && [ORIGINAL_VARIANT, AM2_VARIANT].includes(value.variant) && Boolean(value.visitorId);
}

function readOrCreateVisitorId(context) {
  const key = "attractivemen-ab-visitor-v1";
  try {
    const storage = context.storage || context.localStorage;
    const current = context.sessionStorage?.getItem(key) || storage?.getItem(key);
    if (current) return current;
    const visitorId = createVisitorId({ crypto: globalThis.crypto });
    context.sessionStorage?.setItem(key, visitorId);
    storage?.setItem(key, visitorId);
    return visitorId;
  } catch {
    return "anonymous";
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

function getBrowserContext() {
  const windowRef = globalThis.window;
  return {
    location: windowRef?.location,
    document: windowRef?.document,
    storage: windowRef?.localStorage,
    sessionStorage: windowRef?.sessionStorage,
  };
}
