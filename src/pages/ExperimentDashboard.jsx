import { useState } from "react";
import { ConvexAuthProvider, useAuthActions, useConvexAuth } from "@convex-dev/auth/react";
import { ConvexReactClient, useMutation, useQuery } from "convex/react";
import { convexFunctions } from "../lib/convex-api.js";
import "../styles/experiment-dashboard.css";

const CONVEX_URL = import.meta.env.VITE_CONVEX_URL || "";
const convex = CONVEX_URL ? new ConvexReactClient(CONVEX_URL) : null;

export function ExperimentDashboard() {
  if (!convex) return <DashboardSetupNotice />;
  return (
    <ConvexAuthProvider client={convex}>
      <DashboardApp />
    </ConvexAuthProvider>
  );
}

function DashboardApp() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  if (isLoading) return <DashboardState message="Checking your access..." />;
  if (!isAuthenticated) return <DashboardLogin />;
  return <DashboardContent />;
}

function DashboardLogin() {
  const { signIn } = useAuthActions();
  const resetCode = new URLSearchParams(window.location.search).get("code") || "";
  const [email, setEmail] = useState(new URLSearchParams(window.location.search).get("email") || "");
  const [password, setPassword] = useState("");
  const [resetMode, setResetMode] = useState(false);
  const [status, setStatus] = useState("");

  async function submit(event) {
    event.preventDefault();
    setStatus(resetMode ? "Sending reset email..." : "Signing in...");
    try {
      await signIn("password", resetMode ? { flow: "reset", email } : resetCode ? { flow: "reset-verification", email, code: resetCode, newPassword: password } : { flow: "signIn", email, password });
      setStatus("");
    } catch {
      setStatus(resetMode ? "If the account exists, a reset email has been sent." : "The email or password is not correct.");
    }
  }

  return (
    <main className="experiment-dashboard dashboard-auth-shell">
      <form className="dashboard-auth-card" onSubmit={submit}>
        <p className="dashboard-kicker">AttractiveMen reporting</p>
        <h1>Experiment dashboard</h1>
        <p>Sign in to view AM and AM2 performance.</p>
        <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" /></label>
        {!resetMode ? <label>{resetCode ? "New password" : "Password"}<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete={resetCode ? "new-password" : "current-password"} /></label> : null}
        <button type="submit">{resetMode ? "Send reset email" : resetCode ? "Set new password" : "Sign in"}</button>
        {!resetCode ? <button className="dashboard-link-button" type="button" onClick={() => setResetMode((current) => !current)}>{resetMode ? "Back to sign in" : "Forgot password?"}</button> : null}
        {status ? <p className="dashboard-error" role="alert">{status}</p> : null}
      </form>
    </main>
  );
}

function DashboardContent() {
  const { signOut } = useAuthActions();
  const summary = useQuery(convexFunctions.summary, {});
  const experiment = useQuery(convexFunctions.experiment, {});
  const updateExperiment = useMutation(convexFunctions.updateExperiment);
  const [status, setStatus] = useState("");

  if (!summary || !experiment) return <DashboardState message="Loading experiment data..." />;

  async function update(fields) {
    try {
      await updateExperiment(fields);
      setStatus("Experiment settings saved.");
    } catch {
      setStatus("Settings could not be saved.");
    }
  }

  return (
    <main className="experiment-dashboard">
      <header className="dashboard-header">
        <div><p className="dashboard-kicker">AttractiveMen reporting</p><h1>AM vs AM2</h1><p>Confirmed performance for the current experiment.</p></div>
        <button className="dashboard-secondary-button" type="button" onClick={() => signOut()}>Sign out</button>
      </header>
      <section className="dashboard-metrics" aria-label="Experiment summary">
        <Metric label="Unique visitors" value={summary.visitors} />
        <Metric label="Purchasing visitors" value={summary.purchasingVisitors} />
        <Metric label="Paid orders" value={summary.paidOrders} />
        <Metric label="Conversion rate" value={`${summary.conversionRate}%`} />
        <Metric label="Confirmed revenue" value={formatMoney(summary.revenuePaise)} />
        <Metric label="Revenue per visitor" value={formatMoney(summary.revenuePerVisitorPaise)} />
      </section>
      <section className="dashboard-panel" aria-labelledby="variant-title">
        <div className="dashboard-panel-heading"><div><p className="dashboard-kicker">Live allocation</p><h2 id="variant-title">Experiment controls</h2></div><span className={experiment.enabled ? "dashboard-status active" : "dashboard-status"}>{experiment.enabled ? "Running" : "Paused"}</span></div>
        <div className="dashboard-control-row">
          <label>AM share<input type="number" min="0" max="100" value={experiment.amPercentage} onChange={(event) => update({ amPercentage: Number(event.target.value), am2Percentage: 100 - Number(event.target.value) })} /></label>
          <label>AM2 share<input type="number" min="0" max="100" value={experiment.am2Percentage} onChange={(event) => update({ am2Percentage: Number(event.target.value), amPercentage: 100 - Number(event.target.value) })} /></label>
          <button type="button" onClick={() => update({ enabled: !experiment.enabled })}>{experiment.enabled ? "Pause experiment" : "Resume experiment"}</button>
        </div>
        {status ? <p className="dashboard-success" role="status">{status}</p> : null}
      </section>
      <section className="dashboard-panel" aria-labelledby="comparison-title">
        <div className="dashboard-panel-heading"><div><p className="dashboard-kicker">Randomized traffic only</p><h2 id="comparison-title">Variant comparison</h2></div></div>
        <div className="dashboard-table-wrap"><table><thead><tr><th>Metric</th><th>AM</th><th>AM2</th></tr></thead><tbody>{["visitors", "purchasingVisitors", "paidOrders", "conversionRate", "revenuePaise"].map((metric) => <tr key={metric}><th scope="row">{formatMetricName(metric)}</th><td>{formatMetric(metric, summary.byVariant.AM[metric])}</td><td>{formatMetric(metric, summary.byVariant.AM2[metric])}</td></tr>)}</tbody></table></div>
      </section>
    </main>
  );
}

function Metric({ label, value }) { return <article className="dashboard-metric"><span>{label}</span><strong>{value}</strong></article>; }
function formatMoney(paise = 0) { return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(paise || 0) / 100); }
function formatMetricName(metric) { return { visitors: "Unique visitors", purchasingVisitors: "Purchasing visitors", paidOrders: "Confirmed paid orders", conversionRate: "Purchase conversion rate", revenuePaise: "Confirmed revenue" }[metric] || metric; }
function formatMetric(metric, value) { return metric === "conversionRate" ? `${value}%` : metric === "revenuePaise" ? formatMoney(value) : value; }
function DashboardState({ message }) { return <main className="experiment-dashboard dashboard-state"><p>{message}</p></main>; }
function DashboardSetupNotice() { return <main className="experiment-dashboard dashboard-state"><h1>Dashboard setup required</h1><p>Connect the production Convex deployment to load experiment reporting.</p></main>; }
