import { useEffect, useMemo, useState } from "react";
import { ConvexAuthProvider, useAuthActions, useConvexAuth } from "@convex-dev/auth/react";
import { ConvexReactClient, useMutation, useQuery } from "convex/react";
import { convexFunctions } from "../lib/convex-api.js";
import "../styles/experiment-dashboard.css";

const CONVEX_URL = import.meta.env.VITE_CONVEX_URL || "";
const convex = CONVEX_URL ? new ConvexReactClient(CONVEX_URL) : null;
const sections = [
  ["overview", "Overview"], ["orders", "Sales & payments"], ["campaigns", "Campaigns"],
  ["funnel", "Funnel"], ["experiments", "Experiments"], ["health", "Tracking health"],
];

export function ExperimentDashboard({ initialSection = "overview" }) {
  if (!convex) return <DashboardState message="Dashboard setup required." />;
  if (window.location.pathname === "/experiment-dashboard") return <LegacyDashboardRedirect />;
  return <ConvexAuthProvider client={convex}><DashboardApp initialSection={initialSection} /></ConvexAuthProvider>;
}

function LegacyDashboardRedirect() {
  useEffect(() => { window.location.replace("/dashboard/experiments"); }, []);
  return <DashboardState message="Opening the experiments dashboard..." />;
}

function DashboardApp({ initialSection }) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  if (isLoading) return <DashboardState message="Checking your access..." />;
  if (!isAuthenticated) return <DashboardLogin />;
  return <DashboardContent initialSection={initialSection} />;
}

function DashboardLogin() {
  const { signIn } = useAuthActions();
  const params = new URLSearchParams(window.location.search);
  const resetCode = params.get("code") || "";
  const [email, setEmail] = useState(params.get("email") || "");
  const [password, setPassword] = useState("");
  const [resetMode, setResetMode] = useState(false);
  const [status, setStatus] = useState("");

  async function submit(event) {
    event.preventDefault();
    setStatus(resetMode ? "Sending reset email..." : "Signing in...");
    try {
      await signIn("password", resetMode ? { flow: "reset", email: email.trim().toLowerCase() } : resetCode ? { flow: "reset-verification", email: email.trim().toLowerCase(), code: resetCode, newPassword: password } : { flow: "signIn", email: email.trim().toLowerCase(), password });
      setStatus("");
    } catch {
      setStatus(resetMode ? "If the account exists, a reset email has been sent." : "The email or password is not correct.");
    }
  }

  return <main className="experiment-dashboard dashboard-auth-shell"><form className="dashboard-auth-card" onSubmit={submit}>
    <p className="dashboard-kicker">AttractiveMen reporting</p><h1>Sales dashboard</h1><p>Sign in to view AM and AM2 performance.</p>
    <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" /></label>
    {!resetMode ? <label>{resetCode ? "New password" : "Password"}<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete={resetCode ? "new-password" : "current-password"} /></label> : null}
    <button type="submit">{resetMode ? "Send reset email" : resetCode ? "Set new password" : "Sign in"}</button>
    {!resetCode ? <button className="dashboard-link-button" type="button" onClick={() => setResetMode((current) => !current)}>{resetMode ? "Back to sign in" : "Forgot password?"}</button> : null}
    {status ? <p className="dashboard-error" role="alert">{status}</p> : null}
  </form></main>;
}

function DashboardContent({ initialSection }) {
  const { signOut } = useAuthActions();
  const [section, setSection] = useState(sections.some(([id]) => id === initialSection) ? initialSection : "overview");
  const [filters, setFilters] = useState(defaultFilters());
  const [orderStatus, setOrderStatus] = useState("");
  const [search, setSearch] = useState("");
  const filterArgs = useMemo(() => ({
    startAt: filters.startAt,
    endAt: filters.endAt,
    variant: filters.variant || undefined,
    entryType: filters.entryType || undefined,
  }), [filters]);
  const overview = useQuery(convexFunctions.overview, { filters: filterArgs });
  const orders = useQuery(convexFunctions.orders, { limit: 200, status: orderStatus || undefined, search: search || undefined, filters: filterArgs });
  const campaigns = useQuery(convexFunctions.campaigns, { filters: filterArgs });
  const funnel = useQuery(convexFunctions.funnel, { filters: filterArgs });
  const health = useQuery(convexFunctions.health, {});
  const experiment = useQuery(convexFunctions.experiment, {});
  const updateExperiment = useMutation(convexFunctions.updateExperiment);
  const [status, setStatus] = useState("");

  function navigate(next) {
    setSection(next);
    window.history.replaceState({}, "", `/dashboard/${next === "overview" ? "" : next}`);
  }

  async function update(fields) {
    try { await updateExperiment(fields); setStatus("Experiment settings saved."); } catch { setStatus("Settings could not be saved."); }
  }

  return <main className="experiment-dashboard dashboard-app">
    <header className="dashboard-header"><div><p className="dashboard-kicker">AttractiveMen reporting</p><h1>Sales dashboard</h1><p>Understand traffic, payments, campaigns and the AM2 experiment.</p></div><button className="dashboard-secondary-button" type="button" onClick={() => signOut()}>Sign out</button></header>
    <nav className="dashboard-nav" aria-label="Dashboard sections">{sections.map(([id, label]) => <button className={section === id ? "selected" : ""} type="button" key={id} onClick={() => navigate(id)}>{label}</button>)}</nav>
    <FilterBar filters={filters} setFilters={setFilters} />
    {!overview || !orders || !campaigns || !funnel || !health || !experiment ? <DashboardState message="Loading reporting data..." /> : <>
      {section === "overview" ? <Overview overview={overview} health={health} /> : null}
      {section === "orders" ? <Orders orders={orders} status={orderStatus} setStatus={setOrderStatus} search={search} setSearch={setSearch} /> : null}
      {section === "campaigns" ? <Campaigns rows={campaigns} /> : null}
      {section === "funnel" ? <Funnel rows={funnel} /> : null}
      {section === "experiments" ? <Experiments experiment={experiment} overview={overview} update={update} status={status} /> : null}
      {section === "health" ? <Health health={health} /> : null}
    </>}
  </main>;
}

function FilterBar({ filters, setFilters }) {
  const setRange = (days) => { const end = Date.now() + 86400000; setFilters((current) => ({ ...current, startAt: end - days * 86400000, endAt: end })); };
  return <section className="dashboard-filter-bar" aria-label="Report filters"><label>Date range<select value={filters.range} onChange={(event) => { const days = Number(event.target.value); setFilters((current) => ({ ...current, range: event.target.value })); if (days) setRange(days); }}><option value="7">Last 7 days</option><option value="1">Today</option><option value="2">Yesterday</option><option value="30">Last 30 days</option><option value="0">All recorded</option></select></label><label>Page<select value={filters.variant} onChange={(event) => setFilters((current) => ({ ...current, variant: event.target.value }))}><option value="">AM and AM2</option><option value="AM">AM</option><option value="AM2">AM2</option></select></label><label>Traffic<select value={filters.entryType} onChange={(event) => setFilters((current) => ({ ...current, entryType: event.target.value }))}><option value="">All traffic</option><option value="randomized">Randomized</option><option value="direct">Direct</option><option value="test">Test</option></select></label></section>;
}

function Overview({ overview, health }) { return <><section className="dashboard-metrics" aria-label="Sales summary"><Metric label="Visitors" value={overview.visitors} /><Metric label="Checkout visitors" value={overview.checkoutVisitors} /><Metric label="Initiated orders" value={overview.initiatedOrders} /><Metric label="Pending orders" value={overview.pendingOrders} tone="pending" /><Metric label="Failed orders" value={overview.failedOrders} tone="failed" /><Metric label="Paid orders" value={overview.paidOrders} tone="success" /><Metric label="Confirmed revenue" value={money(overview.revenuePaise)} tone="success" /><Metric label="Average order value" value={money(overview.averageOrderValuePaise)} /></section><section className="dashboard-panel"><div className="dashboard-panel-heading"><div><p className="dashboard-kicker">Operator view</p><h2>What needs attention</h2></div></div><div className="dashboard-health-grid"><Status label="Stale pending payments" value={health.stalePending} /><Status label="Unmatched receipts" value={health.unmatchedReceipts} /><Status label="Reporting failures" value={health.reportingFailures} /></div></section></>; }
function Orders({ orders, status, setStatus, search, setSearch }) { const tabs = ["", "INITIATED", "PENDING", "COMPLETED", "FAILED", "UNKNOWN"]; return <section className="dashboard-panel"><div className="dashboard-panel-heading"><div><p className="dashboard-kicker">Payments</p><h2>Sales and payment records</h2></div></div><div className="dashboard-order-tools"><div className="dashboard-tabs">{tabs.map((tab) => <button className={status === tab ? "selected" : ""} type="button" key={tab} onClick={() => setStatus(tab)}>{tab || "All"}</button>)}</div><input aria-label="Search orders" placeholder="Search order, name, email or phone" value={search} onChange={(event) => setSearch(event.target.value)} /></div><div className="dashboard-table-wrap"><table><thead><tr><th>Order</th><th>Customer</th><th>Status</th><th>Amount</th><th>Page</th><th>Campaign</th><th>Created</th></tr></thead><tbody>{orders.length ? orders.map((order) => <tr key={order._id}><td>{order.merchantOrderId}</td><td>{order.customerName || "Not recorded"}<small>{order.customerEmail || ""}</small></td><td><span className={`dashboard-status status-${order.state.toLowerCase()}`}>{order.state}</span>{order.failureMessage ? <small>{order.failureMessage}</small> : null}</td><td>{money(order.amountPaise)}</td><td>{order.variant || "Unattributed"}</td><td>{order.attribution?.utmCampaign || "Not recorded"}</td><td>{date(order.createdAt)}</td></tr>) : <tr><td colSpan="7">No orders match these filters.</td></tr>}</tbody></table></div></section>; }
function Campaigns({ rows }) { return <section className="dashboard-panel"><div className="dashboard-panel-heading"><div><p className="dashboard-kicker">Attribution</p><h2>Campaign performance</h2></div></div><div className="dashboard-table-wrap"><table><thead><tr><th>Source</th><th>Medium</th><th>Campaign</th><th>Visitors</th><th>Checkout</th><th>Pending</th><th>Failed</th><th>Paid</th><th>Revenue</th></tr></thead><tbody>{rows.length ? rows.map((row) => <tr key={row.key}><td>{row.source}</td><td>{row.medium}</td><td>{row.campaign}</td><td>{row.visitors}</td><td>{row.checkoutVisitors}</td><td>{row.pending}</td><td>{row.failed}</td><td>{row.paid}</td><td>{money(row.revenuePaise)}</td></tr>) : <tr><td colSpan="9">No campaign activity recorded.</td></tr>}</tbody></table></div></section>; }
function Funnel({ rows }) { return <section className="dashboard-panel"><div className="dashboard-panel-heading"><div><p className="dashboard-kicker">Journey</p><h2>Landing to confirmed payment</h2></div></div><div className="dashboard-funnel">{rows.map((row) => <article key={row.label}><strong>{row.count}</strong><span>{row.label}</span><small>{row.conversion}% from previous step · {row.dropoff} dropped</small></article>)}</div></section>; }
function Experiments({ experiment, overview, update, status }) { return <><section className="dashboard-metrics"><Metric label="AM visitors" value={overview.byVariant.AM.visitors} /><Metric label="AM2 visitors" value={overview.byVariant.AM2.visitors} /><Metric label="AM conversion" value={`${overview.byVariant.AM.conversionRate}%`} /><Metric label="AM2 conversion" value={`${overview.byVariant.AM2.conversionRate}%`} /></section><section className="dashboard-panel"><div className="dashboard-panel-heading"><div><p className="dashboard-kicker">Experiment controls</p><h2>AM vs AM2</h2></div><span className={`dashboard-status ${experiment.enabled ? "active" : ""}`}>{experiment.enabled ? "Running" : "Paused"}</span></div><div className="dashboard-control-row"><label>AM share<input type="number" min="0" max="100" value={experiment.amPercentage} onChange={(event) => update({ amPercentage: Number(event.target.value), am2Percentage: 100 - Number(event.target.value) })} /></label><label>AM2 share<input type="number" min="0" max="100" value={experiment.am2Percentage} onChange={(event) => update({ am2Percentage: Number(event.target.value), amPercentage: 100 - Number(event.target.value) })} /></label><button type="button" onClick={() => update({ enabled: !experiment.enabled })}>{experiment.enabled ? "Pause experiment" : "Resume experiment"}</button></div>{status ? <p className="dashboard-success">{status}</p> : null}</section></>; }
function Health({ health }) { return <section className="dashboard-panel"><div className="dashboard-panel-heading"><div><p className="dashboard-kicker">Reconciliation</p><h2>Tracking health</h2></div></div><div className="dashboard-health-grid"><Status label="Pending over 24 hours" value={health.stalePending} /><Status label="Unmatched receipts" value={health.unmatchedReceipts} /><Status label="Open reporting failures" value={health.reportingFailures} /></div><p className="dashboard-muted">Payment confirmations remain authoritative. A pending order is never marked failed just because it is old.</p></section>; }
function Metric({ label, value, tone = "" }) { return <article className={`dashboard-metric ${tone}`}><span>{label}</span><strong>{value}</strong></article>; }
function Status({ label, value }) { return <div className={`dashboard-health-item ${value ? "attention" : "clear"}`}><strong>{value}</strong><span>{label}</span></div>; }
function defaultFilters() { const endAt = Date.now() + 86400000; return { range: "7", startAt: endAt - 7 * 86400000, endAt, variant: "", entryType: "" }; }
function money(paise = 0) { return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(paise || 0) / 100); }
function date(timestamp) { return timestamp ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeZone: "Asia/Kolkata" }).format(new Date(timestamp)) : "Not recorded"; }
function DashboardState({ message }) { return <main className="experiment-dashboard dashboard-state"><p>{message}</p></main>; }
