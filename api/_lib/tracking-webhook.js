import { getHeader } from "./http.js";

export function buildTrackingFields({ req, tracking = {} } = {}) {
  const marketing = buildMarketing(tracking.marketing);

  return {
    location: buildLocation(req),
    device: buildDevice(tracking.device),
    marketing,
    utm_source: marketing.source,
    utm_medium: marketing.medium,
    utm_campaign: marketing.campaign,
    utm_content: marketing.content,
    utm_term: marketing.term,
    utm_id: marketing.id,
    referrer: marketing.referrer,
    engagement: buildEngagement(tracking.engagement),
  };
}

function buildLocation(req) {
  const countryCode = clean(
    getHeader(req, "x-vercel-ip-country") || getHeader(req, "cf-ipcountry"),
    2,
  ).toUpperCase();

  return {
    country: getCountryName(countryCode),
    country_code: countryCode,
    state: clean(decodeHeader(getHeader(req, "x-vercel-ip-country-region"))),
    city: clean(decodeHeader(getHeader(req, "x-vercel-ip-city"))),
    ip: clean(getClientIp(req), 64),
  };
}

function buildDevice(device = {}) {
  return {
    type: clean(device.type),
    os: clean(device.os),
    browser: clean(device.browser),
    screen_resolution: clean(device.screen_resolution),
    viewport: clean(device.viewport),
    is_mobile: clean(device.is_mobile, 8),
    touch_enabled: clean(device.touch_enabled, 8),
    user_agent: clean(device.user_agent, 512),
  };
}

function buildMarketing(marketing = {}) {
  const referrer = clean(marketing.referrer, 512);
  const referrerMarketing = readMarketingFromUrl(referrer);

  return {
    source: clean(marketing.source || marketing.utm_source || referrerMarketing.source),
    medium: clean(marketing.medium || marketing.utm_medium || referrerMarketing.medium),
    campaign: clean(marketing.campaign || marketing.utm_campaign || referrerMarketing.campaign),
    content: clean(marketing.content || marketing.utm_content || referrerMarketing.content),
    term: clean(marketing.term || marketing.utm_term || referrerMarketing.term),
    id: clean(marketing.id || marketing.utm_id || referrerMarketing.id),
    referrer,
  };
}

function readMarketingFromUrl(url) {
  try {
    const params = new URL(url).searchParams;
    return {
      source: params.get("utm_source") || "",
      medium: params.get("utm_medium") || "",
      campaign: params.get("utm_campaign") || "",
      content: params.get("utm_content") || "",
      term: params.get("utm_term") || "",
      id: params.get("utm_id") || "",
    };
  } catch {
    return {
      source: "",
      medium: "",
      campaign: "",
      content: "",
      term: "",
      id: "",
    };
  }
}

function buildEngagement(engagement = {}) {
  return {
    page_visits: cleanCount(engagement.page_visits),
    form_submissions: cleanCount(engagement.form_submissions),
  };
}

function getClientIp(req) {
  const forwardedFor = getHeader(req, "x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return getHeader(req, "x-real-ip") || req?.socket?.remoteAddress || "";
}

function getCountryName(countryCode) {
  if (!countryCode) return "";

  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(countryCode) || "";
  } catch {
    return "";
  }
}

function decodeHeader(value) {
  if (!value) return "";

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function cleanCount(value) {
  const count = Number.parseInt(value, 10);
  return Number.isFinite(count) && count > 0 ? String(count) : "0";
}

function clean(value, maxLength = 256) {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, maxLength);
}
