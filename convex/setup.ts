import { action } from "./_generated/server";
import { v } from "convex/values";
import { makeFunctionReference } from "convex/server";

const signInFunction = makeFunctionReference<"action">("auth:signIn");

export const provisionAdmin = action({
  args: { setupToken: v.string(), email: v.string(), password: v.string() },
  returns: v.object({ provisioned: v.boolean() }),
  handler: async (ctx, args) => {
    const expectedToken = String(process.env.ADMIN_SETUP_TOKEN || "");
    const allowedEmail = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
    if (!expectedToken || args.setupToken !== expectedToken || args.email.trim().toLowerCase() !== allowedEmail) throw new Error("Admin provisioning is not authorized.");
    if (args.password.length < 8) throw new Error("The admin password must be at least eight characters.");
    await ctx.runAction(signInFunction, { provider: "password", params: { flow: "signUp", email: allowedEmail, password: args.password } });
    return { provisioned: true };
  },
});
