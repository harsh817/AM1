import { ConvexHttpClient } from "convex/browser";
import { makeFunctionReference } from "convex/server";
import { getEnv } from "./env.js";

const landingFunction = makeFunctionReference("events:recordLanding");
const checkoutFunction = makeFunctionReference("events:recordCheckoutVisit");
const orderFunction = makeFunctionReference("events:recordOrder");
const receiptFunction = makeFunctionReference("events:recordPaymentReceipt");
const configFunction = makeFunctionReference("events:config");

function getClient() {
  const url = getEnv("CONVEX_URL");
  return url ? new ConvexHttpClient(url) : null;
}

export async function recordConvexLanding(payload) {
  const client = getClient();
  const token = getEnv("CONVEX_INGEST_TOKEN");
  if (!client || !token) return { recorded: false, configured: false };
  return client.mutation(landingFunction, { token, ...payload });
}

export async function recordConvexOrder(payload) {
  const client = getClient();
  const token = getEnv("CONVEX_INGEST_TOKEN");
  if (!client || !token) return { recorded: false, configured: false };
  const input = { token, ...payload };
  if (!input.attribution) delete input.attribution;
  if (!input.customer) delete input.customer;
  if (!input.failure) delete input.failure;
  if (!input.providerEventId) delete input.providerEventId;
  return client.mutation(orderFunction, input);
}

export async function recordConvexCheckoutVisit(payload) {
  const client = getClient();
  const token = getEnv("CONVEX_INGEST_TOKEN");
  if (!client || !token) return { recorded: false, configured: false };
  return client.mutation(checkoutFunction, { token, ...payload });
}

export async function recordConvexPaymentReceipt(payload) {
  const client = getClient();
  const token = getEnv("CONVEX_INGEST_TOKEN");
  if (!client || !token) return { recorded: false, configured: false };
  const input = { token, ...payload };
  if (input.amountPaise === undefined) delete input.amountPaise;
  if (input.errorCode === undefined) delete input.errorCode;
  if (input.errorMessage === undefined) delete input.errorMessage;
  return client.mutation(receiptFunction, input);
}

export async function getConvexExperimentConfig() {
  const client = getClient();
  if (!client) return null;
  return client.query(configFunction, {});
}

export function buildConvexAttribution(tracking = {}) {
  const marketing = tracking.marketing || {};
  const experiment = tracking.experiment || {};
  if (!experiment.visitor_id || !experiment.page_variant) return undefined;
  return {
    experimentId: clean(experiment.experiment_id),
    visitorId: clean(experiment.visitor_id),
    variant: experiment.page_variant,
    entryType: experiment.entry_type || "direct",
    utmSource: clean(marketing.source),
    utmMedium: clean(marketing.medium),
    utmCampaign: clean(marketing.campaign),
    utmContent: clean(marketing.content),
    utmTerm: clean(marketing.term),
    utmId: clean(marketing.id),
    gclid: clean(marketing.gclid),
    gbraid: clean(marketing.gbraid),
    wbraid: clean(marketing.wbraid),
    fbclid: clean(marketing.fbclid),
  };
}

function clean(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, 256);
}
