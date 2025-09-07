// src/pages/admin/AdminDashboard.tsx
import { useEffect, useMemo, useState, useCallback, useId } from "react";
import AdminLayout from "./_AdminLayout";
import { api, Order, Product } from "@/lib/api";
import { toKSh } from "@/utils/currency";
import { AlertTriangle, ArrowUpRight, ArrowDownRight, ChevronRight, Printer } from "lucide-react";

/* =========================
   Tiny responsive SVG sparkline
   ========================= */
function Sparkline({
  data,
  width = 140,
  height = 40,
  className = "text-brand",
}: {
  data: number[];
  width?: number;
  height?: number;
  className?: string;
}) {
  const gid = useId().replace(/:/g, "_");
  if (!data.length) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const span = Math.max(1, max - min);
  const stepX = data.length > 1 ? width / (data.length - 1) : width;

  const pts = data.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / span) * height;
    return [x, y] as const;
  });

  const polyPoints = pts.map(([x, y]) => `${x},${y}`).join(" ");
  const areaPath = `M0,${height} L${pts.map(([x, y]) => `${x},${y}`).join(" L")} L${width},${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={`block h-10 w-[120px] sm:w-[140px] max-w-[40vw] ${className}`}
      role="img"
      aria-label="Revenue sparkline"
    >
      <defs>
        <linearGradient id={`grad_${gid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.25" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#grad_${gid})`} />
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={polyPoints}
      />
    </svg>
  );
}

/* =========================
   Date helpers
   ========================= */
function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}
function ymd(d: Date): string {
  return d.toISOString().slice(0, 10);
}
const orderDate = (o: Order): Date =>
  new Date(((o as unknown as { date?: string | number }).date) ?? Date.now());

/* =========================
   Page
   ========================= */
type RangeDays = 7 | 30;
type StatusFilter = "all" | "paid" | "pending" | "cancelled";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [refreshedAt, setRefreshedAt] = useState<Date | null>(null);

  const [range, setRange] = useState<RangeDays>(7);
  const [status, setStatus] = useState<StatusFilter>("all");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        await api.seedIfEmpty();
        const [ps, os] = await Promise.all([api.products.list(), api.orders.list()]);
        setProducts(ps);
        setOrders(os);
        setRefreshedAt(new Date());
      } catch (e: any) {
        setErr(e?.message || "Failed to load admin data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Filtered orders (by status)
  const ordersFiltered = useMemo(() => {
    if (status === "all") return orders;
    if (status === "paid") return orders.filter((o) => o.payment?.status === "Confirmed");
    if (status === "cancelled") return orders.filter((o) => o.status === "Cancelled");
    return orders.filter((o) => (o.payment?.status ?? "Pending") !== "Confirmed" && o.status !== "Cancelled");
  }, [orders, status]);

  // Print current (filtered) orders
  const onPrint = useCallback(() => {
    const list = ordersFiltered;
    const now = new Date().toLocaleString();
    const rows = list
      .map((o) => {
        const totalCents = o.items.reduce((s, it) => s + it.qty * it.price_cents, 0);
        const total = toKSh(totalCents);
        const when = orderDate(o).toLocaleString();
        const pay = o.payment?.status ?? "—";
        return `
        <tr>
          <td>#${o.id}</td>
          <td>${o.name ?? "—"}</td>
          <td>${o.phone ?? "—"}</td>
          <td>${when}</td>
          <td>${pay}</td>
          <td>${o.status}</td>
          <td style="text-align:right">${total}</td>
        </tr>`;
      })
      .join("");

    const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8"/>
<title>Orders Report</title>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>
  :root { --ink:#0f172a; --muted:#64748b; --line:#e2e8f0; }
  *{ box-sizing:border-box; }
  body{ font:14px/1.5 ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial; color:var(--ink); margin:24px; }
  h1{ font-size:18px; margin:0 0 4px; }
  .meta{ color:var(--muted); margin-bottom:16px; }
  table{ width:100%; border-collapse:collapse; }
  th,td{ padding:10px 12px; border-bottom:1px solid var(--line); vertical-align:top; }
  th{ text-align:left; font-weight:600; color:var(--muted); }
  @media print { body{ margin:8mm; } .no-print{ display:none; } a{ color:inherit; text-decoration:none; } }
</style>
</head>
<body>
  <div class="no-print" style="text-align:right;margin-bottom:12px;">
    <button onclick="window.print()" style="padding:8px 12px;border:1px solid var(--line);border-radius:8px;background:#fff;cursor:pointer;">Print</button>
  </div>
  <h1>Talex — Orders Report</h1>
  <div class="meta">Generated ${now} • ${list.length} ${list.length === 1 ? "order" : "orders"} • Filter: ${status}</div>
  <div style="overflow:auto">
    <table>
      <thead>
        <tr>
          <th>Order</th><th>Customer</th><th>Phone</th><th>Date</th><th>Payment</th><th>Status</th><th style="text-align:right">Total</th>
        </tr>
      </thead>
      <tbody>${rows || `<tr><td colspan="7" style="text-align:center;color:var(--muted)">No orders</td></tr>`}</tbody>
    </table>
  </div>
  <script>window.onload = () => { window.print(); }</script>
</body>
</html>`;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.open();
    w.document.write(html);
    w.document.close();
  }, [ordersFiltered, status]);

  // Computed metrics (mobile-safe + TS-safe)
  const {
    revenuePaid,
    activeCount,
    lowStockCount,
    revCurr,
    revPrev,
    ordCurr,
    ordPrev,
    revSeries,
    topProducts,
  } = useMemo(() => {
    const days = range;
    const paidOrders = orders.filter((o) => o.payment?.status === "Confirmed");

    const revenuePaid: number = paidOrders.reduce<number>(
      (sum, o) => sum + o.items.reduce<number>((s, it) => s + it.qty * it.price_cents, 0),
      0
    );

    const activeCount: number = products.filter((p) => p.is_active).length;
    const lowStockCount: number = products.filter((p) => p.stock <= 5).length;

    // build revenue map for last 2 windows
    const windowDays = days * 2;
    const mapRevenueByDay: Map<string, number> = new Map<string, number>();
    for (let i = 0; i < windowDays; i++) {
      mapRevenueByDay.set(ymd(startOfDay(daysAgo(i))), 0);
    }

    paidOrders.forEach((o) => {
      const key = ymd(startOfDay(orderDate(o)));
      const total = o.items.reduce<number>((s, it) => s + it.qty * it.price_cents, 0);
      if (mapRevenueByDay.has(key)) {
        mapRevenueByDay.set(key, (mapRevenueByDay.get(key) ?? 0) + total);
      }
    });

    // Current window series (typed)
    const revSeries: number[] = Array.from({ length: days }, (_, idx) => {
      const key = ymd(startOfDay(daysAgo(days - 1 - idx)));
      return mapRevenueByDay.get(key) ?? 0;
    });

    // Typed reducers
    const revCurr: number = revSeries.reduce<number>((a, b) => a + b, 0);

    // Previous window sum — avoid Array.from(...).reduce(...) inference pitfalls
    let revPrev: number = 0;
    for (let i = days; i < days * 2; i++) {
      const key = ymd(startOfDay(daysAgo(i)));
      revPrev += mapRevenueByDay.get(key) ?? 0;
    }

    // Orders counts for current/prev windows
    const inRange = (o: Order, from: Date, to: Date): boolean => {
      const t = orderDate(o).getTime();
      return t >= from.getTime() && t < to.getTime();
    };
    const todayStart = startOfDay(new Date());
    const startCurr = startOfDay(daysAgo(days - 1));
    const startPrev = startOfDay(daysAgo(days * 2 - 1));

    const ordCurr: number = orders.filter((o) =>
      inRange(o, startCurr, new Date(todayStart.getTime() + 86400000))
    ).length;

    const ordPrev: number = orders.filter((o) => inRange(o, startPrev, startCurr)).length;

    // Top products by paid qty
    const qtyByTitle = new Map<string, { qty: number; revenue: number }>();
    paidOrders.forEach((o) =>
      o.items.forEach((it) => {
        const prev = qtyByTitle.get(it.title) ?? { qty: 0, revenue: 0 };
        qtyByTitle.set(it.title, {
          qty: prev.qty + it.qty,
          revenue: prev.revenue + it.qty * it.price_cents,
        });
      })
    );
    const topProducts = Array.from(qtyByTitle.entries())
      .sort((a, b) => b[1].qty - a[1].qty)
      .slice(0, 6)
      .map(([title, v]) => ({ title, qty: v.qty, revenue: v.revenue }));

    return { revenuePaid, activeCount, lowStockCount, revCurr, revPrev, ordCurr, ordPrev, revSeries, topProducts };
  }, [products, orders, range]);

  const revDelta = pctDelta(revPrev, revCurr);
  const ordDelta = pctDelta(ordPrev, ordCurr);

  return (
    <AdminLayout
      title="Dashboard"
      subtitle="Metrics, recent activity, and quick actions"
      actions={
        // Keep header actions desktop-only to avoid squeezing on mobile
        <div className="hidden sm:flex flex-wrap gap-2">
          <a href="/admin/products/create" className="btn-primary rounded-xl px-3 py-2 text-sm">New Product</a>
          <button
            onClick={onPrint}
            className="btn-outline rounded-xl px-3 py-2 text-sm inline-flex items-center gap-2"
            aria-label="Print current orders list"
          >
            <Printer className="h-4 w-4" /> <span className="hidden md:inline">Print Orders</span>
            <span className="md:hidden">Print</span>
          </button>
          <a href="/admin/orders" className="btn-outline rounded-xl px-3 py-2 text-sm">View Orders</a>
        </div>
      }
    >
      {/* PAGE WRAPPER: block any sideways scroll */}
      <div className="pb-4 sm:pb-0 overflow-x-hidden max-w-full">
        {/* Error banner */}
        {err && (
          <div
            className="rounded-2xl border border-amber-200 bg-amber-50 text-amber-800 p-4 flex items-center gap-2"
            role="alert"
            aria-live="assertive"
          >
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">{err}</span>
          </div>
        )}

        {/* HERO / OVERVIEW */}
        <div className="rounded-3xl border bg-white shadow-soft overflow-hidden">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 min-w-0">
              <div className="min-w-0">
                <div className="text-xs sm:text-sm text-gray-600">Overview</div>
                <div className="text-xl sm:text-2xl font-extrabold mt-0.5 truncate">
                  {loading ? "…" : toKSh(revenuePaid)} total paid revenue
                </div>
                {refreshedAt && (
                  <div className="text-[11px] sm:text-xs text-gray-500 mt-1">
                    Last updated: {refreshedAt.toLocaleString()}
                  </div>
                )}
              </div>

              {/* Controls: mobile selects, desktop segmented/chips */}
              <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-end w-full sm:w-auto">
                {/* Mobile controls */}
                <div className="sm:hidden grid grid-cols-2 gap-2">
                  <select
                    value={range}
                    onChange={(e) => setRange(Number(e.target.value) as RangeDays)}
                    className="rounded-xl border px-2 py-2 text-sm"
                    aria-label="Select range"
                  >
                    <option value={7}>Last 7 days</option>
                    <option value={30}>Last 30 days</option>
                  </select>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as StatusFilter)}
                    className="rounded-xl border px-2 py-2 text-sm capitalize"
                    aria-label="Filter status"
                  >
                    <option value="all">All</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Desktop controls */}
                <div className="hidden sm:flex items-center gap-2">
                  <div className="inline-flex rounded-xl border bg-white overflow-hidden">
                    {([7, 30] as const).map((v) => (
                      <button
                        key={v}
                        onClick={() => setRange(v)}
                        className={`px-3 py-2 text-sm ${
                          range === v ? "bg-brand text-white" : "text-gray-700 hover:bg-gray-100"
                        }`}
                        aria-pressed={range === v}
                      >
                        Last {v} days
                      </button>
                    ))}
                  </div>
                  <div className="inline-flex rounded-full border bg-white overflow-hidden flex-wrap">
                    {(["all", "paid", "pending", "cancelled"] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => setStatus(s)}
                        className={`px-3 py-1.5 text-sm capitalize ${
                          status === s ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-50"
                        }`}
                        aria-pressed={status === s}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile quick actions */}
          <div className="sm:hidden border-t px-4 py-3">
            <div className="grid grid-cols-3 gap-2">
              <a href="/admin/products/create" className="rounded-xl border bg-gray-900 text-white text-sm py-2 text-center">
                New
              </a>
              <button
                onClick={onPrint}
                className="rounded-xl border bg-white text-gray-900 text-sm py-2 text-center inline-flex items-center justify-center gap-2"
                aria-label="Print orders"
              >
                <Printer className="h-4 w-4" /> Print
              </button>
              <a href="/admin/orders" className="rounded-xl border bg-white text-gray-900 text-sm py-2 text-center">
                Orders
              </a>
            </div>
          </div>
        </div>

        {/* ======= Stats (mobile stack; desktop grid) ======= */}
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Revenue (paid)"
            value={loading ? "…" : toKSh(revCurr)}
            subtitle={`Last ${range} days`}
            trendDelta={loading ? undefined : revDelta}
            trendLabel={`vs prev ${range}d`}
            rightEl={loading ? <div className="h-10 w-[120px] bg-gray-100 rounded animate-pulse" /> : <Sparkline data={revSeries} />}
          />
          <StatCard
            title="Orders"
            value={loading ? "…" : String(ordCurr)}
            subtitle={`Last ${range} days`}
            trendDelta={loading ? undefined : ordDelta}
            trendLabel={`vs prev ${range}d`}
          />
          <StatCard title="Active Products" value={loading ? "…" : String(activeCount)} subtitle="Listed & visible" />
          <StatCard title="Low Stock (≤5)" value={loading ? "…" : String(lowStockCount)} subtitle="Needs attention" />
        </div>

        {/* ======= Lists ======= */}
        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          <Card title="Recent Orders" action={<ListAction status={status} setStatus={setStatus} /> } loading={loading}>
            {ordersFiltered.length === 0 ? (
              <Empty text="No matching orders." />
            ) : (
              <ul className="divide-y">
                {ordersFiltered.slice(0, 8).map((o) => {
                  const total = o.items.reduce<number>((s, it) => s + it.qty * it.price_cents, 0);
                  const paid = o.payment?.status === "Confirmed";
                  const when = orderDate(o);
                  return (
                    <li
                      key={o.id}
                      className="py-3 flex items-center justify-between gap-3 md:hover:bg-gray-50/60 md:rounded-xl md:px-2 transition"
                    >
                      <div className="min-w-0 max-w-[70%]">
                        <div className="font-medium truncate">#{o.id}</div>
                        <div className="text-xs text-gray-600 truncate">
                          {o.name} • {o.phone} • {when.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-semibold">{toKSh(total)}</div>
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs border ${
                            paid
                              ? "bg-green-50 text-green-700 border-green-100"
                              : o.status === "Cancelled"
                              ? "bg-red-50 text-red-700 border-red-100"
                              : "bg-gray-100 text-gray-700 border-gray-200"
                          }`}
                        >
                          {paid ? "Paid" : o.status}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          <Card
            title="Top Products"
            action={
              <a href="/admin/products" className="text-sm inline-flex items-center gap-1 text-brand hover:text-brand-dark">
                Manage products <ChevronRight className="h-4 w-4" />
              </a>
            }
            loading={loading}
          >
            {topProducts.length === 0 ? (
              <Empty text="No paid items yet." />
            ) : (
              <ul className="divide-y">
                {topProducts.map((p) => (
                  <li
                    key={p.title}
                    className="py-3 flex items-center justify-between md:hover:bg-gray-50/60 md:rounded-xl md:px-2 transition"
                  >
                    <div className="min-w-0 max-w-[70%]">
                      <div className="font-medium truncate">{p.title}</div>
                      <div className="text-xs text-gray-600">Qty: {p.qty}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">{toKSh(p.revenue)}</div>
                      <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs border bg-brand/10 text-brand border-transparent">
                        Top
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        {/* ======= Low Stock ======= */}
        <div className="mt-4">
          <Card
            title="Low Stock"
            action={
              <a href="/admin/products" className="text-sm inline-flex items-center gap-1 text-brand hover:text-brand-dark">
                View inventory <ChevronRight className="h-4 w-4" />
              </a>
            }
            loading={loading}
          >
            <ul className="divide-y">
              {products
                .filter((p) => p.stock <= 5)
                .slice(0, 10)
                .map((p) => (
                  <li
                    key={p.id}
                    className="py-3 flex items-center justify-between md:hover:bg-gray-50/60 md:rounded-xl md:px-2 transition"
                  >
                    <div className="min-w-0 max-w-[70%]">
                      <div className="font-medium truncate">{p.title}</div>
                      <div className="text-xs text-gray-600">{p.brand}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">Stock: {p.stock}</div>
                      <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs border bg-amber-50 text-amber-700 border-amber-100">
                        Restock
                      </span>
                    </div>
                  </li>
                ))}
              {!loading && products.filter((p) => p.stock <= 5).length === 0 && <Empty text="All good — no low stock." />}
            </ul>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

/* =========================
   Small helpers/components
   ========================= */
function pctDelta(prev: number, curr: number): number {
  if (prev <= 0 && curr <= 0) return 0;
  if (prev <= 0) return 100;
  return Math.round(((curr - prev) / prev) * 100);
}

function StatCard({
  title,
  value,
  subtitle,
  trendDelta,
  trendLabel,
  rightEl,
}: {
  title: string;
  value: string;
  subtitle?: string;
  trendDelta?: number;
  trendLabel?: string;
  rightEl?: React.ReactNode;
}) {
  const up = (trendDelta ?? 0) >= 0;
  return (
    <div className="rounded-2xl border bg-white p-4 sm:p-5 shadow-soft max-w-full">
      <div className="flex items-start justify-between gap-3 min-w-0">
        <div className="min-w-0">
          <div className="text-[11px] sm:text-xs uppercase tracking-wider text-gray-600">{title}</div>
          <div className="mt-1 text-xl sm:text-2xl font-extrabold truncate">{value}</div>
          {subtitle && <div className="text-[11px] sm:text-xs text-gray-500 mt-0.5">{subtitle}</div>}
          {typeof trendDelta === "number" && trendLabel && (
            <div
              className={`mt-2 inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs ${
                up ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
              }`}
              aria-label={`${Math.abs(trendDelta)} percent ${up ? "up" : "down"} ${trendLabel}`}
            >
              {up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
              {Math.abs(trendDelta)}% <span className="text-gray-500">• {trendLabel}</span>
            </div>
          )}
        </div>
        <div className="shrink-0">{rightEl}</div>
      </div>
    </div>
  );
}

function Card({
  title,
  children,
  loading,
  action,
}: {
  title: string;
  children: React.ReactNode;
  loading?: boolean;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border bg-white p-0 shadow-soft overflow-hidden max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 sm:px-5 py-3 sm:py-4 border-b bg-gradient-to-b from-white/80 to-white/50">
        <div className="font-semibold text-sm sm:text-base">{title}</div>
        <div className="min-w-0">{action}</div>
      </div>
      <div className="p-4 sm:p-5">{loading ? <Skeleton lines={5} /> : children}</div>
    </div>
  );
}

function ListAction({
  status,
  setStatus,
}: {
  status: StatusFilter;
  setStatus: (s: StatusFilter) => void;
}) {
  return (
    <div className="hidden sm:flex items-center gap-2 flex-wrap">
      {(["all", "paid", "pending", "cancelled"] as const).map((s) => (
        <button
          key={s}
          onClick={() => setStatus(s)}
          className={`px-3 py-1.5 rounded-full text-sm capitalize border ${
            status === s ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-700 hover:bg-gray-50"
          }`}
          aria-pressed={status === s}
        >
          {s}
        </button>
      ))}
      <a href="/admin/orders" className="text-sm inline-flex items-center gap-1 text-brand hover:text-brand-dark">
        View all <ChevronRight className="h-4 w-4" />
      </a>
    </div>
  );
}

function Skeleton({ lines = 4 }: { lines?: number }) {
  return (
    <div className="space-y-2" aria-live="polite">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-9 rounded-xl bg-gray-100 animate-pulse" />
      ))}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="text-sm text-gray-600 text-center py-8">{text}</div>;
}
