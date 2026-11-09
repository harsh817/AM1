import { ConvexHttpClient } from "convex/browser";
import { makeFunctionReference } from "convex/server";
import { getEnv } from "./env.js";

const landingFunction = makeFunctionReference("events:recordLanding");
const checkoutFunction = makeFunctionReference("events:recordCheckoutVisit");
const orderFunction = makeFunctionReference("events:recordOrder");
const receiptFunction = makeFunctionReference("events:recordPaymentReceipt");
const configFunction = makeFunctionReference("events:config");
const quizEventFunction = makeFunctionReference("events:recordQuizEvent");

export async function getConvexQuizRetry(merchantOrderId) {
  const client = getClient();
  const token = getEnv("CONVEX_INGEST_TOKEN");
  return client && token ? client.query(makeFunctionReference("events:quizRetry"), { token, merchantOrderId }) : null;
}

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
  if (!input.quizAttribution) delete input.quizAttribution;
  return client.mutation(orderFunction, input);
}

export async function recordConvexQuizEvent(payload) {
  const client = getClient();
  const token = getEnv("CONVEX_INGEST_TOKEN");
  if (!client || !token) return { recorded: false, configured: false };
  return client.mutation(quizEventFunction, { token, ...payload });
}

export async function settleConvexQuizDelivery(payload) {
  const client = getClient();
  const token = getEnv("CONVEX_INGEST_TOKEN");
  if (!client || !token) throw new Error("Quiz delivery is not configured.");
  return client.mutation(makeFunctionReference("events:settleQuizDelivery"), { token, ...payload });
}

export async function recordConvexAssessment(payload) {
  const client = getClient();
  const token = getEnv("CONVEX_INGEST_TOKEN");
  if (!client || !token) throw new Error("Assessment intake is not configured.");
  return client.mutation(makeFunctionReference("events:recordAssessment"), { token, ...payload });
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
    experimentId: experiment.page_variant === "COMPLEXION" ? "" : clean(experiment.experiment_id),
    visitorId: clean(experiment.visitor_id),
    variant: experiment.page_variant,
    entryType: experiment.page_variant === "COMPLEXION" && experiment.entry_type !== "test" ? "direct" : experiment.entry_type || "direct",
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

export function buildConvexQuizAttribution(tracking = {}) {
  const quiz = tracking.quiz || {};
  if (quiz.source !== "style-quiz" || !quiz.version || !quiz.visitor_id) return undefined;
  const marketing = tracking.marketing || {};
  return {
    source: "style-quiz",
    version: clean(quiz.version),
    visitorId: clean(quiz.visitor_id),
    campaign: Object.fromEntries([
      ["utmSource", marketing.source], ["utmMedium", marketing.medium], ["utmCampaign", marketing.campaign],
      ["utmContent", marketing.content], ["utmTerm", marketing.term], ["utmId", marketing.id],
      ["gclid", marketing.gclid], ["gbraid", marketing.gbraid], ["wbraid", marketing.wbraid], ["fbclid", marketing.fbclid],
    ].map(([key, value]) => [key, clean(value)]).filter(([, value]) => value)),
  };
}

function clean(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, 256);
}
