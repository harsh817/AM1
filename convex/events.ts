import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

const experimentId = v.string();
const variant = v.union(v.literal("AM"), v.literal("AM2"), v.literal("COMPLEXION"));
const entryType = v.union(v.literal("randomized"), v.literal("direct"), v.literal("test"));
const attribution = v.object({
  experimentId,
  visitorId: v.string(),
  variant,
  entryType,
  utmSource: v.optional(v.string()),
  utmMedium: v.optional(v.string()),
  utmCampaign: v.optional(v.string()),
  utmContent: v.optional(v.string()),
  utmTerm: v.optional(v.string()),
  utmId: v.optional(v.string()),
  gclid: v.optional(v.string()),
  gbraid: v.optional(v.string()),
  wbraid: v.optional(v.string()),
  fbclid: v.optional(v.string()),
});

export const recordLanding = mutation({
  args: { token: v.string(), dedupeKey: v.string(), attribution, occurredAt: v.number() },
  returns: v.object({ recorded: v.boolean(), duplicate: v.boolean() }),
  handler: async (ctx, args) => {
    assertIngestToken(args.token);
    const existing = await ctx.db.query("exposures").withIndex("by_dedupe_key", (query) => query.eq("dedupeKey", args.dedupeKey)).unique();
    if (existing) return { recorded: false, duplicate: true };
    await ctx.db.insert("exposures", { ...args.attribution, dedupeKey: args.dedupeKey, occurredAt: args.occurredAt });
    if (args.attribution.entryType === "randomized" && args.attribution.experimentId) {
      await adjustDailyMetric(ctx, args.attribution, args.occurredAt, { visitors: 1 });
    }
    return { recorded: true, duplicate: false };
  },
});

export const recordCheckoutVisit = mutation({
  args: { token: v.string(), dedupeKey: v.string(), attribution, eventType: v.optional(v.union(v.literal("checkout_visit"), v.literal("checkout_submit"), v.literal("thankyou_visit"))), occurredAt: v.number() },
  returns: v.object({ recorded: v.boolean(), duplicate: v.boolean() }),
  handler: async (ctx, args) => {
    assertIngestToken(args.token);
    const existing = await ctx.db.query("checkoutVisits").withIndex("by_dedupe_key", (query) => query.eq("dedupeKey", args.dedupeKey)).unique();
    if (existing) return { recorded: false, duplicate: true };
    await ctx.db.insert("checkoutVisits", { ...args.attribution, dedupeKey: args.dedupeKey, eventType: args.eventType || "checkout_visit", occurredAt: args.occurredAt });
    return { recorded: true, duplicate: false };
  },
});

export const recordOrder = mutation({
  args: { token: v.string(), merchantOrderId: v.string(), amountPaise: v.number(), state: v.union(v.literal("INITIATED"), v.literal("PENDING"), v.literal("COMPLETED"), v.literal("FAILED"), v.literal("UNKNOWN")), attribution: v.optional(attribution), quizAttribution: v.optional(v.object({ source: v.literal("style-quiz"), version: v.string(), visitorId: v.string(), campaign: v.optional(v.object({ utmSource: v.optional(v.string()), utmMedium: v.optional(v.string()), utmCampaign: v.optional(v.string()), utmContent: v.optional(v.string()), utmTerm: v.optional(v.string()), utmId: v.optional(v.string()), gclid: v.optional(v.string()), gbraid: v.optional(v.string()), wbraid: v.optional(v.string()), fbclid: v.optional(v.string()) })) })), customer: v.optional(v.object({ name: v.string(), email: v.string(), phone: v.string(), assessmentFollowUp: v.optional(v.boolean()), selectedAddons: v.array(v.string()), lineItems: v.array(v.object({ id: v.string(), title: v.string(), pricePaise: v.number() })) })), failure: v.optional(v.object({ type: v.union(v.literal("payment_failed"), v.literal("checkout_error"), v.literal("provider_uncertain"), v.literal("reporting_failure")), code: v.optional(v.string()), message: v.optional(v.string()) })), providerEventId: v.optional(v.string()), occurredAt: v.number() },
  returns: v.object({ recorded: v.boolean(), duplicate: v.boolean() }),
  handler: async (ctx, args) => {
    assertIngestToken(args.token);
    const existing = await ctx.db.query("orders").withIndex("by_merchant_order_id", (query) => query.eq("merchantOrderId", args.merchantOrderId)).unique();
    const finalAttribution = existing?.attribution || args.attribution;
    const visitorForDedup = existing?.visitorId || args.attribution?.visitorId;
    const previousPaidOrder = visitorForDedup ? await ctx.db.query("orders").withIndex("by_visitor_state", (query) => query.eq("visitorId", visitorForDedup).eq("state", "COMPLETED")).take(1) : [];
    if (existing) {
      const completed = existing.state === "COMPLETED";
      const nextState = completed ? "COMPLETED" : args.state;
      const timeline = [...(existing.paymentTimeline || []), timelineEvent(args)].slice(-20);
      const orderPatch = withoutUndefined({ state: nextState, amountPaise: existing.amountPaise || args.amountPaise, attribution: finalAttribution, quizAttribution: existing.quizAttribution || args.quizAttribution, visitorId: existing.visitorId || args.attribution?.visitorId, variant: existing.variant || args.attribution?.variant, entryType: existing.entryType || args.attribution?.entryType, customerName: existing.customerName || args.customer?.name, customerEmail: existing.customerEmail || args.customer?.email, customerPhone: existing.customerPhone || args.customer?.phone, assessmentFollowUp: existing.assessmentFollowUp ?? args.customer?.assessmentFollowUp, selectedAddons: existing.selectedAddons || args.customer?.selectedAddons, lineItems: existing.lineItems || args.customer?.lineItems, lastProviderCheckAt: args.occurredAt, completedAt: nextState === "COMPLETED" ? existing.completedAt || args.occurredAt : existing.completedAt, paymentTimeline: timeline, updatedAt: args.occurredAt, ...(args.failure ? { failureType: args.failure.type, failureCode: args.failure.code, failureMessage: args.failure.message } : {}) });
      await ctx.db.patch(existing._id, orderPatch);
      if (!completed && nextState === "COMPLETED" && (existing.quizAttribution || args.quizAttribution)) await recordQuizPurchase(ctx, args.merchantOrderId, existing.quizAttribution || args.quizAttribution, args.occurredAt);
      if (!completed && nextState === "COMPLETED" && finalAttribution?.entryType === "randomized" && finalAttribution.variant) {
        const finalVisitorId = existing.visitorId || finalAttribution.visitorId;
        await adjustDailyMetric(ctx, finalAttribution, args.occurredAt, { paidOrders: 1, revenuePaise: args.amountPaise, purchasingVisitors: previousPaidOrder.length ? 0 : 1 });
      }
      return { recorded: true, duplicate: completed && args.state === "COMPLETED" };
    }
    const newOrder = withoutUndefined({ merchantOrderId: args.merchantOrderId, amountPaise: args.amountPaise, state: args.state, attribution: args.attribution, quizAttribution: args.quizAttribution, visitorId: args.attribution?.visitorId, variant: args.attribution?.variant, entryType: args.attribution?.entryType, customerName: args.customer?.name, customerEmail: args.customer?.email, customerPhone: args.customer?.phone, assessmentFollowUp: args.customer?.assessmentFollowUp, selectedAddons: args.customer?.selectedAddons, lineItems: args.customer?.lineItems, failureType: args.failure?.type, failureCode: args.failure?.code, failureMessage: args.failure?.message, lastProviderCheckAt: args.occurredAt, paymentTimeline: [timelineEvent(args)], createdAt: args.occurredAt, updatedAt: args.occurredAt, ...(args.state === "COMPLETED" ? { completedAt: args.occurredAt } : {}) }) as any;
    await ctx.db.insert("orders", newOrder);
    if (args.state === "COMPLETED" && args.quizAttribution) await recordQuizPurchase(ctx, args.merchantOrderId, args.quizAttribution, args.occurredAt);
    if (args.customer) await upsertContact(ctx, args.customer, args.merchantOrderId, args.state === "COMPLETED", args.occurredAt);
    if (args.state === "COMPLETED" && args.attribution?.entryType === "randomized" && args.attribution.variant) {
      await adjustDailyMetric(ctx, args.attribution, args.occurredAt, { paidOrders: 1, revenuePaise: args.amountPaise, purchasingVisitors: previousPaidOrder.length ? 0 : 1 });
    }
    return { recorded: true, duplicate: false };
  },
});

export const quizRetry = query({
  args: { token: v.string(), merchantOrderId: v.string() },
  handler: async (ctx, args) => {
    assertIngestToken(args.token);
    const order = await ctx.db.query("orders").withIndex("by_merchant_order_id", (query) => query.eq("merchantOrderId", args.merchantOrderId)).unique();
    if (order?.state !== "FAILED" || !order.quizAttribution) return null;
    return { name: order.customerName ?? "", email: order.customerEmail ?? "", phone: order.customerPhone ?? "", followUp: order.assessmentFollowUp ?? false };
  },
});

export const recordQuizEvent = mutation({
  args: { token: v.string(), eventId: v.string(), eventType: v.union(v.literal("quiz_started"), v.literal("quiz_completed"), v.literal("checkout_started")), visitorId: v.string(), quizVersion: v.string(), campaign: v.optional(v.object({ utmSource: v.optional(v.string()), utmMedium: v.optional(v.string()), utmCampaign: v.optional(v.string()), utmContent: v.optional(v.string()), utmTerm: v.optional(v.string()), utmId: v.optional(v.string()), gclid: v.optional(v.string()), gbraid: v.optional(v.string()), wbraid: v.optional(v.string()), fbclid: v.optional(v.string()) })), occurredAt: v.number() },
  handler: async (ctx, args) => {
    assertIngestToken(args.token);
    const existing = await ctx.db.query("quizEvents").withIndex("by_event_id", (query) => query.eq("eventId", args.eventId)).unique();
    if (existing?.makeDelivered) return { duplicate: true, delivery: "delivered" };
    if (existing?.makeLease && args.occurredAt - existing.makeLease < 30_000) return { duplicate: true, delivery: "busy" };
    if (existing) await ctx.db.patch(existing._id, { makeLease: args.occurredAt });
    else {
      const { token: _token, ...event } = args;
      await ctx.db.insert("quizEvents", { ...event, makeLease: args.occurredAt });
    }
    return { duplicate: Boolean(existing), delivery: "claimed" };
  },
});

export const settleQuizDelivery = mutation({
  args: { token: v.string(), eventId: v.string(), lease: v.number(), delivered: v.boolean() },
  handler: async (ctx, args) => {
    assertIngestToken(args.token);
    const event = await ctx.db.query("quizEvents").withIndex("by_event_id", (query) => query.eq("eventId", args.eventId)).unique();
    if (event?.makeLease !== args.lease) return false;
    await ctx.db.patch(event._id, { makeLease: undefined, makeDelivered: args.delivered });
    return true;
  },
});

const assessmentState = v.union(v.literal("ready"), v.literal("unmatched"), v.literal("incomplete"), v.literal("duplicate"));

export const recordAssessment = mutation({
  args: {
    token: v.string(), responseId: v.string(), merchantOrderId: v.string(), name: v.string(),
    email: v.string(), phone: v.string(), receivedAt: v.number(),
    photos: v.object({ front: v.boolean(), side: v.boolean(), fullLength: v.boolean() }),
  },
  handler: async (ctx, args) => {
    assertIngestToken(args.token);
    const existing = await ctx.db.query("quizAssessments").withIndex("by_response", (query) => query.eq("responseId", args.responseId)).unique();
    if (existing?.state === "ready") return { state: "ready", duplicate: true };
    const order = await ctx.db.query("orders").withIndex("by_merchant_order_id", (query) => query.eq("merchantOrderId", args.merchantOrderId)).unique();
    const missingPhotos = Object.entries(args.photos).filter(([, present]) => !present).map(([angle]) => angle);
    const normalized = (value?: string) => (value || "").trim().toLowerCase().replace(/\s+/g, " ");
    const normalizePhone = (value?: string) => (value || "").replace(/\D/g, "").replace(/^(?:091|91|0)(?=\d{10}$)/, "");
    const quiz = order?.quizAttribution;
    const matched = Boolean(order?.state === "COMPLETED" && quiz && order.customerName && order.customerEmail && order.customerPhone &&
      normalized(order.customerName) === normalized(args.name) && normalized(order.customerEmail) === normalized(args.email) &&
      normalizePhone(order.customerPhone) === normalizePhone(args.phone));
    const eventId = `assessment_received:${args.merchantOrderId}`;
    const accepted = matched && await ctx.db.query("quizEvents").withIndex("by_event_id", (query) => query.eq("eventId", eventId)).unique();
    const state = !matched ? "unmatched" : accepted ? "duplicate" : missingPhotos.length ? "incomplete" : "ready";
    const row = {
      responseId: args.responseId, merchantOrderId: args.merchantOrderId, receivedAt: args.receivedAt, state, missingPhotos,
      ...(state === "ready" ? { fulfilmentStartsAt: args.receivedAt } : {}),
    } as const;
    if (existing) await ctx.db.patch(existing._id, row);
    else await ctx.db.insert("quizAssessments", row);
    if (state === "ready" && quiz) {
      await ctx.db.insert("quizEvents", {
        eventId, eventType: "assessment_received", merchantOrderId: args.merchantOrderId,
        visitorId: quiz.visitorId, quizVersion: quiz.version, campaign: quiz.campaign, occurredAt: args.receivedAt,
      });
    }
    return { state, duplicate: state === "duplicate" };
  },
});

export const assessmentQueue = query({
  args: { state: assessmentState },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return ctx.db.query("quizAssessments").withIndex("by_state", (query) => query.eq("state", args.state)).order("desc").take(100);
  },
});

async function recordQuizPurchase(ctx: any, merchantOrderId: string, quiz: any, occurredAt: number) {
  const eventId = `${quiz.version}:${quiz.visitorId}:verified_purchase:${merchantOrderId}`;
  const existing = await ctx.db.query("quizEvents").withIndex("by_event_id", (query: any) => query.eq("eventId", eventId)).unique();
  if (existing) return;
  await ctx.db.insert("quizEvents", { eventId, eventType: "verified_purchase", visitorId: quiz.visitorId, quizVersion: quiz.version, campaign: quiz.campaign, merchantOrderId, occurredAt });
}

export const recordPaymentReceipt = mutation({
  args: { token: v.string(), merchantOrderId: v.string(), providerEventId: v.string(), state: v.string(), amountPaise: v.optional(v.number()), errorCode: v.optional(v.string()), errorMessage: v.optional(v.string()), receivedAt: v.number() },
  returns: v.object({ recorded: v.boolean(), duplicate: v.boolean() }),
  handler: async (ctx, args) => {
    assertIngestToken(args.token);
    const existing = await ctx.db.query("paymentReceipts").withIndex("by_provider_event", (query) => query.eq("providerEventId", args.providerEventId)).unique();
    if (existing) return { recorded: false, duplicate: true };
    const { token: _token, ...receipt } = args;
    await ctx.db.insert("paymentReceipts", receipt);
    return { recorded: true, duplicate: false };
  },
});

export const config = query({
  args: {},
  returns: v.object({ experimentId: v.string(), enabled: v.boolean(), amPercentage: v.number(), am2Percentage: v.number() }),
  handler: async (ctx) => {
    const experimentId = "am-vs-am2-v3";
    const current = await ctx.db.query("experiments").withIndex("by_experiment_id", (query) => query.eq("experimentId", experimentId)).unique();
    return current ? { experimentId: current.experimentId, enabled: current.enabled, amPercentage: current.amPercentage, am2Percentage: current.am2Percentage } : { experimentId, enabled: false, amPercentage: 50, am2Percentage: 50 };
  },
});

function assertIngestToken(token: string) {
  if (!process.env.CONVEX_INGEST_TOKEN || token !== process.env.CONVEX_INGEST_TOKEN) throw new Error("Invalid ingest token");
}

function timelineEvent(args: { state: string; occurredAt: number; providerEventId?: string; failure?: { message?: string } }) {
  const event: { state: string; occurredAt: number; providerEventId?: string; message?: string } = { state: args.state, occurredAt: args.occurredAt };
  if (args.providerEventId) event.providerEventId = args.providerEventId;
  if (args.failure?.message) event.message = args.failure.message;
  return event;
}

function withoutUndefined<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined));
}

async function upsertContact(ctx: any, customer: { name: string; email: string; phone: string }, merchantOrderId: string, paid: boolean, occurredAt: number) {
  const normalizedEmail = customer.email.trim().toLowerCase();
  const existing = await ctx.db.query("contacts").withIndex("by_email", (query: any) => query.eq("normalizedEmail", normalizedEmail)).unique();
  if (existing) {
    await ctx.db.patch(existing._id, { name: customer.name.trim(), email: customer.email.trim(), phone: customer.phone.trim(), lastSeenAt: occurredAt, latestOrderId: merchantOrderId, orderCount: existing.orderCount + 1, paidOrderCount: existing.paidOrderCount + (paid ? 1 : 0) });
    return;
  }
  await ctx.db.insert("contacts", { email: customer.email.trim(), normalizedEmail, name: customer.name.trim(), phone: customer.phone.trim(), firstSeenAt: occurredAt, lastSeenAt: occurredAt, latestOrderId: merchantOrderId, orderCount: 1, paidOrderCount: paid ? 1 : 0 });
}

async function adjustDailyMetric(ctx: any, attribution: any, timestamp: number, changes: { visitors?: number; purchasingVisitors?: number; paidOrders?: number; revenuePaise?: number }) {
  const date = new Date(timestamp).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  const existing = await ctx.db.query("dailyMetrics").withIndex("by_experiment_day_variant", (query: any) => query.eq("experimentId", attribution.experimentId).eq("day", date).eq("variant", attribution.variant)).unique();
  const next = {
    experimentId: attribution.experimentId,
    day: date,
    variant: attribution.variant,
    visitors: (existing?.visitors || 0) + (changes.visitors || 0),
    purchasingVisitors: (existing?.purchasingVisitors || 0) + (changes.purchasingVisitors || 0),
    paidOrders: (existing?.paidOrders || 0) + (changes.paidOrders || 0),
    revenuePaise: (existing?.revenuePaise || 0) + (changes.revenuePaise || 0),
  };
  if (existing) await ctx.db.patch(existing._id, next);
  else await ctx.db.insert("dailyMetrics", next);
}

async function requireAdmin(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Unauthenticated");
  const user = await ctx.db.get(userId);
  const allowed = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  if (!user?.email || !allowed || user.email.toLowerCase() !== allowed) throw new Error("Forbidden");
  return userId;
}
