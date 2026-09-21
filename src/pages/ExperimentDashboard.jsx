import { useEffect, useMemo, useState } from "react";
import {
  ConvexAuthProvider,
  useAuthActions,
  useConvexAuth,
} from "@convex-dev/auth/react";
import {
  ConvexReactClient,
  useMutation,
  usePaginatedQuery,
  useQuery,
} from "convex/react";
import { convexFunctions } from "../lib/convex-api.js";
import "../styles/experiment-dashboard.css";

const CONVEX_URL = import.meta.env.VITE_CONVEX_URL || "";
const convex = CONVEX_URL ? new ConvexReactClient(CONVEX_URL) : null;
const sections = [
  ["overview", "Overview", "⌂"],
  ["funnel", "Funnels", "↗"],
  ["orders", "Orders & payments", "₹"],
  ["contacts", "Contacts", "◉"],
  ["campaigns", "Campaigns", "⌁"],
  ["experiments", "Experiments", "◌"],
  ["health", "Tracking health", "!"],
];

export function ExperimentDashboard({ initialSection = "overview" }) {
  if (!convex) return <DashboardState message="Dashboard setup required." />;
  if (window.location.pathname === "/experiment-dashboard")
    return <LegacyDashboardRedirect />;
  return (
    <ConvexAuthProvider client={convex}>
      <DashboardApp initialSection={initialSection} />
    </ConvexAuthProvider>
  );
}

function LegacyDashboardRedirect() {
  useEffect(() => {
    window.location.replace("/dashboard/experiments");
  }, []);
  return <DashboardState message="Opening the experiments dashboard..." />;
}

function DashboardApp({ initialSection }) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  if (isLoading) return <DashboardState message="Checking your access..." />;
  if (!isAuthenticated) return <DashboardLogin />;
  return <DashboardWorkspace initialSection={initialSection} />;
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
      await signIn(
        "password",
        resetMode
          ? { flow: "reset", email: email.trim().toLowerCase() }
          : resetCode
            ? {
                flow: "reset-verification",
                email: email.trim().toLowerCase(),
                code: resetCode,
                newPassword: password,
              }
            : { flow: "signIn", email: email.trim().toLowerCase(), password },
      );
      setStatus("");
    } catch {
      setStatus(
        resetMode
          ? "If the account exists, a reset email has been sent."
          : "The email or password is not correct.",
      );
    }
  }
  return (
    <main className="experiment-dashboard dashboard-auth-shell">
      <form className="dashboard-auth-card" onSubmit={submit}>
        <p className="dashboard-kicker">AttractiveMen reporting</p>
        <h1>Sales workspace</h1>
        <p>Private reporting for traffic, payments and campaigns.</p>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
          />
        </label>
        {!resetMode ? (
          <label>
            {resetCode ? "New password" : "Password"}
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoComplete={resetCode ? "new-password" : "current-password"}
            />
          </label>
        ) : null}
        <button className="dashboard-primary-button" type="submit">
          {resetMode
            ? "Send reset email"
            : resetCode
              ? "Set new password"
              : "Sign in"}
        </button>
        {!resetCode ? (
          <button
            className="dashboard-link-button"
            type="button"
            onClick={() => setResetMode((current) => !current)}
          >
            {resetMode ? "Back to sign in" : "Forgot password?"}
          </button>
        ) : null}
        {status ? (
          <p className="dashboard-error" role="alert">
            {status}
          </p>
        ) : null}
      </form>
    </main>
  );
}

function DashboardWorkspace({ initialSection }) {
  const { signOut } = useAuthActions();
  const [section, setSection] = useState(
    sections.some(([id]) => id === initialSection)
      ? initialSection
      : "overview",
  );
  const [mobileNav, setMobileNav] = useState(false);
  const [filters, setFilters] = useState(defaultFilters());
  const [status, setStatus] = useState("");
  const [orderStatus, setOrderStatus] = useState("");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState("");
  const filterArgs = useMemo(
    () => ({
      startAt: filters.startAt,
      endAt: filters.endAt,
      variant: filters.variant || undefined,
      entryType: filters.entryType || undefined,
      utmSource: filters.utmSource || undefined,
      utmMedium: filters.utmMedium || undefined,
      utmCampaign: filters.utmCampaign || undefined,
    }),
    [filters],
  );
  const overview = useQuery(
    convexFunctions.overview,
    section === "overview" || section === "experiments"
      ? { filters: filterArgs }
      : "skip",
  );
  const campaigns = useQuery(
    convexFunctions.campaigns,
    section === "campaigns" ? { filters: filterArgs } : "skip",
  );
  const funnel = useQuery(
    convexFunctions.funnel,
    section === "funnel" ? { filters: filterArgs } : "skip",
  );
  const health = useQuery(
    convexFunctions.health,
    section === "health" || section === "overview" ? {} : "skip",
  );
  const experiment = useQuery(
    convexFunctions.experiment,
    section === "experiments" ? {} : "skip",
  );
  const detail = useQuery(
    convexFunctions.order,
    selectedOrder ? { merchantOrderId: selectedOrder } : "skip",
  );
  const ordersQuery = usePaginatedQuery(
    convexFunctions.ordersPage,
    section === "orders"
      ? {
          status: orderStatus || undefined,
          search: search || undefined,
          filters: filterArgs,
        }
      : "skip",
    { initialNumItems: 50 },
  );
  const contactsQuery = usePaginatedQuery(
    convexFunctions.contacts,
    section === "contacts" ? { search: search || undefined } : "skip",
    { initialNumItems: 50 },
  );
  const updateExperiment = useMutation(convexFunctions.updateExperiment);

  function navigate(next) {
    setSection(next);
    setMobileNav(false);
    setSelectedOrder("");
    window.history.pushState(
      {},
      "",
      `/dashboard/${next === "overview" ? "" : next}`,
    );
  }
  async function saveExperiment(fields) {
    try {
      await updateExperiment(fields);
      setStatus("Experiment settings saved.");
    } catch {
      setStatus("Settings could not be saved.");
    }
  }

  return (
    <main className="experiment-dashboard dashboard-shell">
      <aside className={`dashboard-sidebar ${mobileNav ? "open" : ""}`}>
        <div className="dashboard-brand">
          <span className="dashboard-brand-mark">AM</span>
          <span>
            <strong>AttractiveMen</strong>
            <small>Reporting workspace</small>
          </span>
        </div>
        <nav aria-label="Dashboard sections">
          {sections.map(([id, label, icon]) => (
            <button
              className={section === id ? "selected" : ""}
              type="button"
              key={id}
              onClick={() => navigate(id)}
            >
              <b aria-hidden="true">{icon}</b>
              {label}
            </button>
          ))}
        </nav>
        <div className="dashboard-sidebar-footer">
          <span className="dashboard-live-dot" />
          Data workspace
        </div>
      </aside>
      {mobileNav ? (
        <button
          className="dashboard-scrim"
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileNav(false)}
        />
      ) : null}
      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <button
            className="dashboard-menu-button"
            type="button"
            onClick={() => setMobileNav(true)}
            aria-label="Open navigation"
          >
            ☰
          </button>
          <div>
            <p className="dashboard-kicker">Private reporting</p>
            <h1>{sectionTitle(section)}</h1>
          </div>
          <div className="dashboard-account">
            <span className="dashboard-account-dot" />
            Admin{" "}
            <button type="button" onClick={() => signOut()}>
              Sign out
            </button>
          </div>
        </header>
        <FilterBar filters={filters} setFilters={setFilters} />
        <div className="dashboard-content">
          {section === "overview" ? (
            <Overview overview={overview} health={health} navigate={navigate} />
          ) : null}
          {section === "funnel" ? <Funnel rows={funnel} /> : null}
          {section === "orders" ? (
            <Orders
              query={ordersQuery}
              status={orderStatus}
              setStatus={setOrderStatus}
              search={search}
              setSearch={setSearch}
              selectOrder={setSelectedOrder}
            />
          ) : null}
          {section === "contacts" ? (
            <Contacts
              query={contactsQuery}
              search={search}
              setSearch={setSearch}
            />
          ) : null}
          {section === "campaigns" ? <Campaigns rows={campaigns} /> : null}
          {section === "experiments" ? (
            <Experiments
              experiment={experiment}
              overview={overview}
              update={saveExperiment}
              status={status}
            />
          ) : null}
          {section === "health" ? <Health health={health} /> : null}
        </div>
      </div>
      {selectedOrder ? (
        <OrderDrawer order={detail} close={() => setSelectedOrder("")} />
      ) : null}
    </main>
  );
}

function FilterBar({ filters, setFilters }) {
  const setRange = (value) => {
    const today = getIstDayStart();
    const day = 86400000;
    if (value === "all")
      return setFilters((current) => ({
        ...current,
        range: value,
        startAt: undefined,
        endAt: undefined,
      }));
    if (value === "yesterday")
      return setFilters((current) => ({
        ...current,
        range: value,
        startAt: today - day,
        endAt: today,
      }));
    const days = Number(value);
    setFilters((current) => ({
      ...current,
      range: value,
      startAt: today - (days - 1) * day,
      endAt: Date.now(),
    }));
  };
  return (
    <section className="dashboard-filter-bar" aria-label="Report filters">
      <label>
        Date range
        <select
          value={filters.range}
          onChange={(event) => setRange(event.target.value)}
        >
          <option value="7">Last 7 days</option>
          <option value="1">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="30">Last 30 days</option>
          <option value="all">All recorded</option>
        </select>
      </label>
      <label>
        Page
        <select
          value={filters.variant}
          onChange={(event) =>
            setFilters((current) => ({
              ...current,
              variant: event.target.value,
            }))
          }
        >
          <option value="">AM and AM2</option>
          <option value="AM">AM</option>
          <option value="AM2">AM2</option>
        </select>
      </label>
      <label>
        Traffic
        <select
          value={filters.entryType}
          onChange={(event) =>
            setFilters((current) => ({
              ...current,
              entryType: event.target.value,
            }))
          }
        >
          <option value="">All traffic</option>
          <option value="randomized">Randomized</option>
          <option value="direct">Direct</option>
          <option value="test">Test</option>
        </select>
      </label>
      <label>
        Source
        <input
          value={filters.utmSource}
          onChange={(event) =>
            setFilters((current) => ({
              ...current,
              utmSource: event.target.value,
            }))
          }
          placeholder="Any source"
        />
      </label>
      <label>
        Campaign
        <input
          value={filters.utmCampaign}
          onChange={(event) =>
            setFilters((current) => ({
              ...current,
              utmCampaign: event.target.value,
            }))
          }
          placeholder="Any campaign"
        />
      </label>
    </section>
  );
}

function Overview({ overview, health, navigate }) {
  if (!overview) return <DashboardState message="Loading overview..." inline />;
  return (
    <>
      <section className="dashboard-welcome">
        <div>
          <span className="dashboard-eyebrow">At a glance</span>
          <h2>Know what is moving and what needs attention.</h2>
          <p>
            Recorded traffic includes direct and test visits. Experiment metrics use randomized visitors only.
          </p>
        </div>
        <span className="dashboard-refresh-label">Live data</span>
      </section>
      <section className="dashboard-metrics">
        {[
          ["Recorded visitors", overview.visitors, ""],
          ["Experiment visitors", overview.experimentVisitors, ""],
          ["Checkout visitors", overview.checkoutVisitors, ""],
          ["Initiated orders", overview.initiatedOrders, ""],
          ["Pending orders", overview.pendingOrders, "pending"],
          ["Failed orders", overview.failedOrders, "failed"],
          ["Paid orders", overview.paidOrders, "success"],
          ["Confirmed revenue", money(overview.revenuePaise), "success"],
          ["Revenue / visitor", money(overview.revenuePerVisitorPaise), ""],
        ].map(([label, value, tone]) => (
          <Metric key={label} label={label} value={value} tone={tone} />
        ))}
      </section>
      <section className="dashboard-grid-two">
        <Panel title="Conversion snapshot" kicker="Funnel health">
          <div className="dashboard-snapshot">
            <div>
              <strong>{overview.conversionRate}%</strong>
              <span>Visitor to paid order</span>
            </div>
            <div>
              <strong>{overview.purchasingVisitors}</strong>
              <span>Unique purchasing visitors</span>
            </div>
            <div>
              <strong>{money(overview.averageOrderValuePaise)}</strong>
              <span>Average order value</span>
            </div>
          </div>
          <button
            className="dashboard-text-button"
            type="button"
            onClick={() => navigate("funnel")}
          >
            Open funnel →
          </button>
        </Panel>
        <Panel title="Needs attention" kicker="Operator view">
          <div className="dashboard-attention-list">
            <Attention
              label="Pending over 24 hours"
              value={health?.stalePending ?? "—"}
            />
            <Attention
              label="Unmatched payment receipts"
              value={health?.unmatchedReceipts ?? "—"}
            />
            <Attention
              label="Reporting failures"
              value={health?.reportingFailures ?? "—"}
            />
          </div>
          <button
            className="dashboard-text-button"
            type="button"
            onClick={() => navigate("health")}
          >
            Open health →
          </button>
        </Panel>
      </section>
    </>
  );
}
function Orders({ query, status, setStatus, search, setSearch, selectOrder }) {
  const tabs = [
    ["", "All"],
    ["INITIATED", "Initiated"],
    ["PENDING", "Pending"],
    ["COMPLETED", "Completed"],
    ["FAILED", "Failed"],
    ["UNKNOWN", "Unknown"],
  ];
  const rows = query.results || [];
  return (
    <Panel title="Orders & payments" kicker="Sales ledger">
      <div className="dashboard-toolbar">
        <div className="dashboard-tabs">
          {tabs.map(([value, label]) => (
            <button
              className={status === value ? "selected" : ""}
              type="button"
              key={value}
              onClick={() => setStatus(value)}
            >
              {label}
            </button>
          ))}
        </div>
        <input
          aria-label="Search orders"
          placeholder="Order ID, name, email or phone"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>
      <TableWrap>
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Status</th>
              <th>Amount</th>
              <th>Page</th>
              <th>Campaign</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((order) => (
                <tr
                  className="dashboard-clickable-row"
                  key={order._id}
                  onClick={() => selectOrder(order.merchantOrderId)}
                >
                  <td>
                    <strong>{order.merchantOrderId}</strong>
                    <small>Open details</small>
                  </td>
                  <td>
                    {order.customerName || "Not recorded"}
                    <small>{order.customerEmail || ""}</small>
                  </td>
                  <td>
                    <StatusBadge value={order.state} />
                    <small>
                      {order.failureMessage || failureLabel(order.failureType)}
                    </small>
                  </td>
                  <td>{money(order.amountPaise)}</td>
                  <td>{order.variant || "Unattributed"}</td>
                  <td>{order.attribution?.utmCampaign || "Not recorded"}</td>
                  <td>{date(order.createdAt)}</td>
                </tr>
              ))
            ) : (
              <EmptyRow span="7" text="No orders match these filters." />
            )}
          </tbody>
        </table>
      </TableWrap>
      <Pagination query={query} />
    </Panel>
  );
}
function Contacts({ query, search, setSearch }) {
  const rows = query.results || [];
  return (
    <Panel title="Contacts" kicker="Checkout submissions">
      <div className="dashboard-toolbar">
        <p className="dashboard-muted">
          Contacts are saved when a valid checkout form is submitted.
        </p>
        <input
          aria-label="Search contacts"
          placeholder="Search name"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>
      <TableWrap>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Orders</th>
              <th>Paid</th>
              <th>Last seen</th>
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((contact) => (
                <tr key={contact._id}>
                  <td>
                    <strong>{contact.name}</strong>
                  </td>
                  <td>{contact.email}</td>
                  <td>{contact.phone}</td>
                  <td>{contact.orderCount}</td>
                  <td>{contact.paidOrderCount}</td>
                  <td>{date(contact.lastSeenAt)}</td>
                </tr>
              ))
            ) : (
              <EmptyRow span="6" text="No submitted contacts recorded." />
            )}
          </tbody>
        </table>
      </TableWrap>
      <Pagination query={query} />
    </Panel>
  );
}
function Campaigns({ rows }) {
  if (!rows)
    return <DashboardState message="Loading campaign report..." inline />;
  return (
    <Panel title="Campaign performance" kicker="Attribution">
      <TableWrap>
        <table>
          <thead>
            <tr>
              <th>Source</th>
              <th>Medium</th>
              <th>Campaign</th>
              <th>Visitors</th>
              <th>Checkout</th>
              <th>Pending</th>
              <th>Failed</th>
              <th>Paid</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((row) => (
                <tr key={row.key}>
                  <td>{row.source}</td>
                  <td>{row.medium}</td>
                  <td>{row.campaign}</td>
                  <td>{row.visitors}</td>
                  <td>{row.checkoutVisitors}</td>
                  <td>{row.pending}</td>
                  <td>{row.failed}</td>
                  <td>{row.paid}</td>
                  <td>{money(row.revenuePaise)}</td>
                </tr>
              ))
            ) : (
              <EmptyRow span="9" text="No campaign activity recorded." />
            )}
          </tbody>
        </table>
      </TableWrap>
    </Panel>
  );
}
function Funnel({ rows }) {
  if (!rows) return <DashboardState message="Loading funnel..." inline />;
  return (
    <Panel title="Landing to confirmed payment" kicker="Journey">
      <div className="dashboard-funnel">
        {rows.map((row, index) => (
          <article key={row.label}>
            <div className="dashboard-funnel-step">
              <span>0{index + 1}</span>
              <div>
                <strong>{row.count}</strong>
                <small>{row.label}</small>
              </div>
            </div>
            <div className="dashboard-funnel-bar">
              <i
                style={{
                  width: `${Math.min(100, Math.max(row.conversion, row.count ? 4 : 0))}%`,
                }}
              />
            </div>
            <small>
              {index
                ? `${row.conversion}% from previous step · ${row.dropoff} dropped`
                : "Starting population"}
            </small>
          </article>
        ))}
      </div>
      <p className="dashboard-muted">
        A missing event is shown as a tracking gap. A verified payment is
        counted even when the buyer does not return to the thank-you page.
      </p>
    </Panel>
  );
}
function Experiments({ experiment, overview, update, status }) {
  if (!experiment || !overview)
    return <DashboardState message="Loading experiment..." inline />;
  const [am, setAm] = useState(experiment.amPercentage);
  useEffect(() => setAm(experiment.amPercentage), [experiment.amPercentage]);
  return (
    <>
      <section className="dashboard-metrics">
        <Metric
          label="AM randomized visitors"
          value={`${overview.byVariant.AM.visitors} (${overview.byVariant.AM.share}%)`}
        />
        <Metric
          label="AM2 randomized visitors"
          value={`${overview.byVariant.AM2.visitors} (${overview.byVariant.AM2.share}%)`}
        />
        <Metric
          label="AM conversion"
          value={`${overview.byVariant.AM.conversionRate}%`}
        />
        <Metric
          label="AM2 conversion"
          value={`${overview.byVariant.AM2.conversionRate}%`}
        />
      </section>
      <Panel title="AM vs AM2" kicker="Experiment controls">
        <div className="dashboard-experiment-header">
          <div>
            <strong>{experiment.experimentId}</strong>
            <span>
              {overview.experimentVisitors} randomized visitors. Direct and test traffic is excluded from this comparison.
            </span>
          </div>
          <StatusBadge value={experiment.enabled ? "RUNNING" : "PAUSED"} />
        </div>
        <div className="dashboard-control-row">
          <label>
            AM share
            <input
              type="number"
              min="0"
              max="100"
              value={am}
              onChange={(event) => setAm(Number(event.target.value))}
            />
          </label>
          <label>
            AM2 share
            <input type="number" min="0" max="100" value={100 - am} readOnly />
          </label>
          <button
            className="dashboard-primary-button"
            type="button"
            onClick={() =>
              update({ amPercentage: am, am2Percentage: 100 - am })
            }
          >
            Save allocation
          </button>
          <button
            className="dashboard-secondary-button"
            type="button"
            onClick={() => update({ enabled: !experiment.enabled })}
          >
            {experiment.enabled ? "Pause experiment" : "Resume experiment"}
          </button>
        </div>
        {status ? <p className="dashboard-success">{status}</p> : null}
      </Panel>
    </>
  );
}
function Health({ health }) {
  if (!health)
    return <DashboardState message="Loading tracking health..." inline />;
  return (
    <>
      <section className="dashboard-metrics">
        <Metric
          label="Pending over 24h"
          value={health.stalePending}
          tone={health.stalePending ? "pending" : "success"}
        />
        <Metric
          label="Unmatched receipts"
          value={health.unmatchedReceipts}
          tone={health.unmatchedReceipts ? "failed" : "success"}
        />
        <Metric
          label="Open reporting failures"
          value={health.reportingFailures}
          tone={health.reportingFailures ? "failed" : "success"}
        />
      </section>
      <Panel title="Reconciliation health" kicker="Data quality">
        <div className="dashboard-health-grid">
          <Attention
            label="Last payment receipt"
            value={
              health.lastReceiptAt ? date(health.lastReceiptAt) : "Not recorded"
            }
          />
          <Attention
            label="Last order update"
            value={
              health.lastOrderAt ? date(health.lastOrderAt) : "Not recorded"
            }
          />
          <Attention label="Pending policy" value="Age never changes state" />
        </div>
        {health.recentFailures?.length ? (
          <div className="dashboard-warning-list">
            {health.recentFailures.map((failure) => (
              <div key={failure._id}>
                <StatusBadge value="FAILED" />
                <span>
                  {failure.kind}: {failure.message}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="dashboard-success">
            No unresolved reporting failures are recorded.
          </p>
        )}
      </Panel>
    </>
  );
}
function OrderDrawer({ order, close }) {
  return (
    <div
      className="dashboard-drawer-backdrop"
      role="presentation"
      onClick={close}
    >
      <aside
        className="dashboard-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Order details"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="dashboard-drawer-heading">
          <div>
            <p className="dashboard-kicker">Order details</p>
            <h2>{order?.merchantOrderId || "Loading..."}</h2>
          </div>
          <button
            className="dashboard-icon-button"
            type="button"
            onClick={close}
            aria-label="Close details"
          >
            ×
          </button>
        </div>
        {order ? (
          <>
            <div className="dashboard-drawer-status">
              <StatusBadge value={order.state} />
              <strong>{money(order.amountPaise)}</strong>
            </div>
            <DetailGroup title="Customer">
              <p>{order.customerName || "Not recorded"}</p>
              <p>{order.customerEmail || "Not recorded"}</p>
              <p>{order.customerPhone || "Not recorded"}</p>
            </DetailGroup>
            <DetailGroup title="Attribution">
              <p>
                {order.variant || "Unattributed"} ·{" "}
                {order.entryType || "Not recorded"}
              </p>
              <p>
                {order.attribution?.utmSource || "Not recorded"} /{" "}
                {order.attribution?.utmCampaign || "Not recorded"}
              </p>
              <p>
                {order.attribution?.gclid ||
                  order.attribution?.fbclid ||
                  "No click identifier"}
              </p>
            </DetailGroup>
            <DetailGroup title="Order items">
              {(order.lineItems || []).map((item) => (
                <p key={item.id}>
                  {item.title} · {money(item.pricePaise)}
                </p>
              ))}
            </DetailGroup>
            <DetailGroup title="Payment timeline">
              {(order.paymentTimeline || []).map((item, index) => (
                <p key={`${item.occurredAt}-${index}`}>
                  <StatusBadge value={item.state} /> {date(item.occurredAt)}{" "}
                  {item.message || ""}
                </p>
              ))}
            </DetailGroup>
          </>
        ) : (
          <p>Loading order details...</p>
        )}
      </aside>
    </div>
  );
}
function DetailGroup({ title, children }) {
  return (
    <section className="dashboard-detail-group">
      <h3>{title}</h3>
      {children}
    </section>
  );
}
function Panel({ title, kicker, children }) {
  return (
    <section className="dashboard-panel">
      <div className="dashboard-panel-heading">
        <div>
          <p className="dashboard-kicker">{kicker}</p>
          <h2>{title}</h2>
        </div>
      </div>
      {children}
    </section>
  );
}
function TableWrap({ children }) {
  return <div className="dashboard-table-wrap">{children}</div>;
}
function Pagination({ query }) {
  return (
    <div className="dashboard-pagination">
      {query.isLoading ? <span>Loading more…</span> : null}
      {query.isDone ? (
        <span>End of results</span>
      ) : (
        <button
          className="dashboard-secondary-button"
          type="button"
          onClick={() => query.loadMore(50)}
        >
          Load more
        </button>
      )}
    </div>
  );
}
function Metric({ label, value, tone = "" }) {
  return (
    <article className={`dashboard-metric ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}
function Attention({ label, value }) {
  return (
    <div className="dashboard-attention-item">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}
function StatusBadge({ value }) {
  return (
    <span
      className={`dashboard-status status-${String(value || "unknown").toLowerCase()}`}
    >
      {String(value || "UNKNOWN").replace("_", " ")}
    </span>
  );
}
function EmptyRow({ span, text }) {
  return (
    <tr>
      <td colSpan={span} className="dashboard-empty-row">
        {text}
      </td>
    </tr>
  );
}
function sectionTitle(section) {
  return sections.find(([id]) => id === section)?.[1] || "Overview";
}
function failureLabel(type) {
  return type ? type.replaceAll("_", " ") : "";
}
function defaultFilters() {
  const today = getIstDayStart();
  return {
    range: "7",
    startAt: today - 6 * 86400000,
    endAt: Date.now(),
    variant: "",
    entryType: "",
    utmSource: "",
    utmCampaign: "",
  };
}
function getIstDayStart(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .formatToParts(date)
    .reduce((values, part) => ({ ...values, [part.type]: part.value }), {});
  return Date.parse(`${parts.year}-${parts.month}-${parts.day}T00:00:00+05:30`);
}
function money(paise = 0) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(paise || 0) / 100);
}
function date(timestamp) {
  return timestamp
    ? new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeZone: "Asia/Kolkata",
      }).format(new Date(timestamp))
    : "Not recorded";
}
function DashboardState({ message, inline = false }) {
  return (
    <div
      className={
        inline
          ? "dashboard-inline-state"
          : "experiment-dashboard dashboard-state"
      }
    >
      <p>{message}</p>
    </div>
  );
}
