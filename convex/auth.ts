import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { Email } from "@convex-dev/auth/providers/Email";

const resetEmail = Email({
  from: "AttractiveMen Dashboard <onboarding@resend.dev>",
  sendVerificationRequest: async ({ identifier, url }) => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error("Password reset email is not configured.");
    const resetUrl = new URL(url);
    resetUrl.searchParams.set("email", identifier);
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: "AttractiveMen Dashboard <onboarding@resend.dev>", to: identifier, subject: "Reset your experiment dashboard password", html: `<p>Reset your password using <a href="${resetUrl}">this secure link</a>.</p>` }),
    });
    if (!response.ok) throw new Error("Password reset email could not be sent.");
  },
});

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password({
    profile: (params) => {
      const email = String(params.email || "").trim().toLowerCase();
      const allowed = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
      if (!allowed || email !== allowed) throw new Error("This account is not allowed to access the dashboard.");
      return { email };
    },
    reset: resetEmail,
  })],
});
