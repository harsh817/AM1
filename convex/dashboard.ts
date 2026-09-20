import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

const ACTIVE_EXPERIMENT = "am-vs-am2-v2";

export const getExperiment = query({
  args: {},
  returns: v.object({ experimentId: v.string(), enabled: v.boolean(), amPercentage: v.number(), am2Percentage: v.number() }),
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const experiment = await ctx.db.query("experiments").withIndex("by_experiment_id", (query) => query.eq("experimentId", ACTIVE_EXPERIMENT)).unique();
    return experiment ? { experimentId: experiment.experimentId, enabled: experiment.enabled, amPercentage: experiment.amPercentage, am2Percentage: experiment.am2Percentage } : { experimentId: ACTIVE_EXPERIMENT, enabled: false, amPercentage: 50, am2Percentage: 50 };
  },
});

export const getSummary = query({
  args: {},
  returns: v.object({ visitors: v.number(), purchasingVisitors: v.number(), paidOrders: v.number(), conversionRate: v.number(), revenuePaise: v.number(), revenuePerVisitorPaise: v.number(), byVariant: v.any() }),
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const rows = await ctx.db.query("dailyMetrics").withIndex("by_experiment_day_variant", (query) => query.eq("experimentId", ACTIVE_EXPERIMENT)).take(732);
    const byVariant = { AM: emptyVariant(), AM2: emptyVariant() };
    for (const row of rows) {
      const target = byVariant[row.variant];
      target.visitors += row.visitors;
      target.purchasingVisitors += row.purchasingVisitors;
      target.paidOrders += row.paidOrders;
      target.revenuePaise += row.revenuePaise;
    }
    const totals = Object.values(byVariant).reduce((accumulator, row) => addVariant(accumulator, row), emptyVariant());
    return { ...totals, conversionRate: percentage(totals.purchasingVisitors, totals.visitors), revenuePerVisitorPaise: totals.visitors ? Math.round(totals.revenuePaise / totals.visitors) : 0, byVariant: { AM: { ...byVariant.AM, conversionRate: percentage(byVariant.AM.purchasingVisitors, byVariant.AM.visitors) }, AM2: { ...byVariant.AM2, conversionRate: percentage(byVariant.AM2.purchasingVisitors, byVariant.AM2.visitors) } } };
  },
});

export const listOrders = query({
  args: { limit: v.optional(v.number()) },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return ctx.db.query("orders").withIndex("by_state", (query) => query.eq("state", "COMPLETED")).order("desc").take(Math.min(args.limit || 50, 100));
  },
});

export const updateExperiment = mutation({
  args: { enabled: v.optional(v.boolean()), amPercentage: v.optional(v.number()), am2Percentage: v.optional(v.number()) },
  returns: v.object({ updated: v.boolean() }),
  handler: async (ctx, args) => {
    const actorUserId = await requireAdmin(ctx);
    const amPercentage = args.amPercentage ?? 50;
    const am2Percentage = args.am2Percentage ?? 100 - amPercentage;
    if (amPercentage < 0 || amPercentage > 100 || am2Percentage < 0 || am2Percentage > 100 || amPercentage + am2Percentage !== 100) throw new Error("Allocation must total 100%.");
    const existing = await ctx.db.query("experiments").withIndex("by_experiment_id", (query) => query.eq("experimentId", ACTIVE_EXPERIMENT)).unique();
    const now = Date.now();
    if (existing) await ctx.db.patch(existing._id, { enabled: args.enabled ?? existing.enabled, amPercentage, am2Percentage, updatedAt: now });
    else await ctx.db.insert("experiments", { experimentId: ACTIVE_EXPERIMENT, enabled: args.enabled ?? false, amPercentage, am2Percentage, createdAt: now, updatedAt: now });
    await ctx.db.insert("adminAudit", { action: "experiment.update", actorUserId, details: JSON.stringify({ enabled: args.enabled, amPercentage, am2Percentage }), occurredAt: now });
    return { updated: true };
  },
});

function emptyVariant() { return { visitors: 0, purchasingVisitors: 0, paidOrders: 0, revenuePaise: 0 }; }
function addVariant(target: VariantSummary, row: VariantSummary) { target.visitors += row.visitors; target.purchasingVisitors += row.purchasingVisitors; target.paidOrders += row.paidOrders; target.revenuePaise += row.revenuePaise; return target; }
function percentage(numerator: number, denominator: number) { return denominator ? Number(((numerator / denominator) * 100).toFixed(2)) : 0; }

async function requireAdmin(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Unauthenticated");
  const user = await ctx.db.get(userId);
  const allowed = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  if (!user?.email || !allowed || user.email.toLowerCase() !== allowed) throw new Error("Forbidden");
  return userId;
}

type VariantSummary = { visitors: number; purchasingVisitors: number; paidOrders: number; revenuePaise: number };
