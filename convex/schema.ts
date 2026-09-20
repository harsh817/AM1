import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const attributionFields = {
  experimentId: v.string(),
  visitorId: v.string(),
  variant: v.union(v.literal("AM"), v.literal("AM2")),
  entryType: v.union(v.literal("randomized"), v.literal("direct"), v.literal("test")),
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
};

export default defineSchema({
  ...authTables,
  experiments: defineTable({ experimentId: v.string(), enabled: v.boolean(), amPercentage: v.number(), am2Percentage: v.number(), createdAt: v.number(), updatedAt: v.number() }).index("by_experiment_id", ["experimentId"]),
  exposures: defineTable({ ...attributionFields, dedupeKey: v.string(), occurredAt: v.number() }).index("by_dedupe_key", ["dedupeKey"]).index("by_experiment_variant", ["experimentId", "variant", "occurredAt"]),
  checkoutVisits: defineTable({ ...attributionFields, occurredAt: v.number() }).index("by_visitor", ["visitorId", "occurredAt"]),
  orders: defineTable({ merchantOrderId: v.string(), amountPaise: v.number(), state: v.union(v.literal("INITIATED"), v.literal("PENDING"), v.literal("COMPLETED"), v.literal("FAILED"), v.literal("UNKNOWN")), visitorId: v.optional(v.string()), variant: v.optional(v.union(v.literal("AM"), v.literal("AM2"))), entryType: v.optional(v.union(v.literal("randomized"), v.literal("direct"), v.literal("test"))), attribution: v.optional(v.object(attributionFields)), createdAt: v.number(), updatedAt: v.number() }).index("by_merchant_order_id", ["merchantOrderId"]).index("by_state", ["state", "updatedAt"]).index("by_visitor_state", ["visitorId", "state"]),
  paymentReceipts: defineTable({ merchantOrderId: v.string(), providerEventId: v.string(), state: v.string(), amountPaise: v.optional(v.number()), receivedAt: v.number() }).index("by_provider_event", ["providerEventId"]).index("by_order", ["merchantOrderId", "receivedAt"]),
  dailyMetrics: defineTable({ experimentId: v.string(), day: v.string(), variant: v.union(v.literal("AM"), v.literal("AM2")), visitors: v.number(), purchasingVisitors: v.number(), paidOrders: v.number(), revenuePaise: v.number() }).index("by_experiment_day_variant", ["experimentId", "day", "variant"]),
  adminAudit: defineTable({ action: v.string(), actorUserId: v.string(), details: v.string(), occurredAt: v.number() }).index("by_occurred_at", ["occurredAt"]),
});
