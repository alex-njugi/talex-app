import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminLayout from "./_AdminLayout";
import { api, Order } from "@/lib/api";
import { toKSh } from "@/utils/currency";

/** Helpers */
const computeTotal = (o: Order) => o.items.reduce((s, it) => s + it.qty * it.price_cents, 0);
const isPaid = (o: Order) => o.payment?.status === "Confirmed";
type SortKey = "id" | "name" | "date" | "status" | "payment" | "total";
type SortDir = "asc" | "desc";

const STATUS_BAR: Record<Order["status"], string> = {
  Pending: "bg-amber-500",
  Paid: "bg-emerald-600",
  Shipped: "bg-sky-600",
  Completed: "bg-gray-900",
  Cancelled: "bg-rose-600",
};

const STATUS_STYLES: Record<Order["status"], string> = {
  Pending: "bg-amber-50 text-amber-700 ring-amber-200",
  Paid: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Shipped: "bg-sky-50 text-sky-700 ring-sky-200",
  Completed: "bg-gray-900 text-white ring-gray-900/10",
  Cancelled: "bg-rose-50 text-rose-700 ring-rose-200",
};

export default function AdminOrdersPage() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | Order["status"]>("all");
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: "date", dir: "desc" });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const nav = useNavigate();

  useEffect(() => {
    (async () => {
      setLoading(true);
      await api.seedIfEmpty();
      const list = await api.orders.list();
      setOrders(list);
      setLoading(false);
    })();
  }, []);

  // filter
  const filtered = useMemo(() => {
    let arr = [...orders];
    if (q) {
      const t = q.toLowerCase();
      arr = arr.filter(
        (o) =>
          o.id.toLowerCase().includes(t) ||
          o.name.toLowerCase().includes(t) ||
          o.phone.toLowerCase().includes(t)
      );
    }
    if (status !== "all") arr = arr.filter((o) => o.status === status);
    return arr;
  }, [orders, q, status]);

  // sort
  const sorted = useMemo(() => {
    const dir = sort.dir === "asc" ? 1 : -1;
    const statusOrder: Record<Order["status"], number> = {
      Pending: 1, Paid: 2, Shipped: 3, Completed: 4, Cancelled: 5,
    };
    return [...filtered].sort((a, b) => {
      switch (sort.key) {
        case "id":     return dir * a.id.localeCompare(b.id);
        case "name":   return dir * a.name.localeCompare(b.name);
        case "status": return dir * (statusOrder[a.status] - statusOrder[b.status]);
        case "payment":{
          const ap = isPaid(a) ? 1 : 0, bp = isPaid(b) ? 1 : 0;
          return dir * (ap - bp);
        }
        case "total":  return dir * (computeTotal(a) - computeTotal(b));
        case "date": {
          const at = Date.parse(a.date); const bt = Date.parse(b.date);
          return dir * ((Number.isNaN(at) ? 0 : at) - (Number.isNaN(bt) ? 0 : bt));
        }
        default: return 0;
      }
    });
  }, [filtered, sort]);

  // pagination (screen only)
  useEffect(() => { setPage(1); }, [q, status, sort, pageSize]);
  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageStart = (page - 1) * pageSize;
  const pageData = sorted.slice(pageStart, pageStart + pageSize);

  // summary (screen + print use same filtered)
  const summary = useMemo(() => {
    const count = filtered.length;
    const paidTotal = filtered.reduce((s, o) => s + (isPaid(o) ? computeTotal(o) : 0), 0);
    const unpaidTotal = filtered.reduce((s, o) => s + (!isPaid(o) ? computeTotal(o) : 0), 0);
    return { count, paidTotal, unpaidTotal };
  }, [filtered]);

  const toggleSort = (key: SortKey) => {
    setSort(prev => prev.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" });
  };

  const handlePrint = () => window.print();

  const rowPad = "px-5 py-4";

  return (
    <AdminLayout title="Orders" subtitle="Track, update and fulfill orders">
      <section className="mx-auto w-full max-w-screen-2xl px-6 2xl:px-8 overflow-x-hidden">
        {/* Toolbar (enhanced for mobile) */}
        <div className="rounded-3xl border bg-white/80 backdrop-blur p-5 shadow-soft print:hidden">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative min-w-[260px] flex-1 basis-[340px]">
              <label htmlFor="order-search" className="sr-only">Search</label>
              <input
                id="order-search"
                className="input w-full pl-10"
                placeholder="Search order #, name, phone"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>

            {/* Desktop select */}
            <div className="min-w-[200px] basis-[200px] hidden lg:block">
              <label htmlFor="order-status" className="sr-only">Status</label>
              <select
                id="order-status"
                className="input w-full"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
              >
                <option value="all">All status</option>
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Shipped">Shipped</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="ms-auto">
              {/* Hide print button on the tiniest screens to avoid crowding */}
              <button onClick={handlePrint} className="hidden sm:inline-flex btn-outline rounded-xl px-3 py-2 text-sm" title="Print">
                <PrintIcon className="h-4 w-4 mr-1" /> Print
              </button>
            </div>
          </div>

          {/* Mobile: wrap-safe status pills (sync with `status`) */}
          <div className="mt-3 lg:hidden">
            <StatusFilterPills status={status} onChange={setStatus} />
          </div>

          {/* Summary chips */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-gray-700">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-1 ring-1 ring-emerald-200">
              <Dot className="bg-emerald-500" /> Paid {toKSh(summary.paidTotal)}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 text-gray-700 px-2.5 py-1 ring-1 ring-gray-200">
              <Dot className="bg-gray-400" /> Unpaid {toKSh(summary.unpaidTotal)}
            </span>
            <span className="text-gray-500">({summary.count} orders)</span>
          </div>
        </div>

        {/* MOBILE (<= lg): polished cards */}
        <div className="lg:hidden mt-4 w-full max-w-full overflow-x-hidden space-y-3 print:hidden">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
            : sorted.length === 0
            ? <EmptyState onReset={() => { setQ(""); setStatus("all"); }} />
            : sorted.map((o) => <OrderCard key={o.id} order={o} />)}
        </div>

        {/* DESKTOP (lg+): Screen table (hidden while printing) */}
        <div className="hidden lg:block mt-5 print:hidden">
          <div className="rounded-3xl border bg-white/90 backdrop-blur shadow-soft overflow-visible">
            <table className="table-auto w-full text-sm leading-6 divide-y divide-gray-100">
              <thead className="bg-gray-50 text-gray-800 sticky top-0 z-10">
                <tr>
                  <SortableTh label="Order"   active={sort.key==="id"}     dir={sort.dir} onClick={() => toggleSort("id")}     className={rowPad} />
                  <SortableTh label="Customer" active={sort.key==="name"}   dir={sort.dir} onClick={() => toggleSort("name")}   className={rowPad} />
                  <SortableTh label="Date"     active={sort.key==="date"}   dir={sort.dir} onClick={() => toggleSort("date")}   className={rowPad} />
                  <SortableTh label="Payment"  active={sort.key==="payment"}dir={sort.dir} onClick={() => toggleSort("payment")}className={rowPad} />
                  <SortableTh label="Total"    active={sort.key==="total"}  dir={sort.dir} onClick={() => toggleSort("total")}  className={`${rowPad} text-right`} />
                  <th className={`${rowPad} text-right font-semibold`}>Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className={`${rowPad}`}>
                        <div className="h-9 rounded-xl bg-gray-100" />
                      </td>
                    </tr>
                  ))
                ) : pageData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className={`${rowPad} text-center text-gray-600 py-12`}>
                      No orders found.
                    </td>
                  </tr>
                ) : (
                  pageData.map((o) => {
                    const total = computeTotal(o);
                    return (
                      <tr
                        key={o.id}
                        className="odd:bg-white even:bg-gray-50/60 hover:bg-gray-50 transition-colors"
                        onClick={() => nav(`/admin/orders/${o.id}`)}
                      >
                        <td className={`${rowPad} align-top`}>
                          <div className="font-medium wrap-anywhere break-words">#{o.id}</div>
                          <div className="text-xs text-gray-500">{o.status}</div>
                        </td>
                        <td className={`${rowPad} align-top`}>
                          <div className="font-medium wrap-anywhere break-words">{o.name}</div>
                          <div className="text-xs text-gray-500 wrap-anywhere break-words">{o.phone}</div>
                        </td>
                        <td className={`${rowPad} align-top whitespace-nowrap`}>{o.date}</td>
                        <td className={`${rowPad} align-top`}>
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ring-1 ${isPaid(o) ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-gray-100 text-gray-700 ring-gray-200"}`}>
                            <Dot className={isPaid(o) ? "bg-emerald-500" : "bg-gray-400"} />
                            {isPaid(o) ? "Paid" : "Unpaid"}
                          </span>
                        </td>
                        <td className={`${rowPad} align-top text-right font-semibold`}>
                          {toKSh(total)}
                        </td>
                        <td className={`${rowPad} align-top text-right`}>
                          <Link
                            to={`/admin/orders/${o.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="btn-outline rounded-xl px-3 py-1.5"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* Pagination (screen only) */}
            {!loading && sorted.length > 0 && (
              <div className="flex flex-wrap items-center gap-3 justify-between p-4 border-t bg-white/80">
                <div className="text-sm text-gray-600">
                  Page <span className="font-medium">{page}</span> / <span className="font-medium">{pageCount}</span>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    className="input w-28"
                    value={pageSize}
                    onChange={(e) => setPageSize(parseInt(e.target.value, 10))}
                  >
                    {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n} / page</option>)}
                  </select>
                  <div className="flex items-center gap-1">
                    <button
                      className="btn-outline rounded-xl px-3 py-1.5 disabled:opacity-50"
                      disabled={page <= 1}
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                    >
                      ← Prev
                    </button>
                    <button
                      className="btn-outline rounded-xl px-3 py-1.5 disabled:opacity-50"
                      disabled={page >= pageCount}
                      onClick={() => setPage(p => Math.min(pageCount, p + 1))}
                    >
                      Next →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* PRINT-ONLY: full list of filtered+sorted orders (no pagination) */}
        <div className="hidden print:block mt-5">
          <table className="w-full text-sm leading-6 border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Order</th>
                <th className="px-4 py-2 text-left">Customer</th>
                <th className="px-4 py-2 text-left">Phone</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Payment</th>
                <th className="px-4 py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-700">
                    No orders found.
                  </td>
                </tr>
              ) : (
                sorted.map((o) => {
                  const total = computeTotal(o);
                  const paid = isPaid(o);
                  return (
                    <tr key={o.id} style={{ breakInside: "avoid" }}>
                      <td className="px-4 py-2 align-top">
                        #{o.id}
                        <div className="text-xs text-gray-600">{o.status}</div>
                      </td>
                      <td className="px-4 py-2 align-top break-words">{o.name}</td>
                      <td className="px-4 py-2 align-top break-words">{o.phone}</td>
                      <td className="px-4 py-2 align-top whitespace-nowrap">{o.date}</td>
                      <td className="px-4 py-2 align-top">{paid ? "Paid" : "Unpaid"}</td>
                      <td className="px-4 py-2 align-top text-right font-semibold">{toKSh(total)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </AdminLayout>
  );
}

/* ================== Mobile Status Pills ================== */
function StatusFilterPills({
  status,
  onChange,
}: {
  status: "all" | Order["status"];
  onChange: (s: "all" | Order["status"]) => void;
}) {
  const options: Array<"all" | Order["status"]> = ["all", "Pending", "Paid", "Shipped", "Completed", "Cancelled"];
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = status === opt;
        const base =
          "select-none rounded-full px-3 py-1 text-sm ring-1 transition focus:outline-none focus-visible:ring-2";
        const cls = active
          ? "bg-gray-900 text-white ring-gray-900"
          : "bg-white text-gray-700 ring-gray-300 hover:bg-gray-50";
        return (
          <button
            key={opt}
            type="button"
            className={`${base} ${cls}`}
            onClick={() => onChange(opt)}
            aria-pressed={active}
          >
            {opt === "all" ? "All" : opt}
          </button>
        );
      })}
    </div>
  );
}

/* ================== Mobile Card (polished) ================== */
function OrderCard({ order }: { order: Order }) {
  const total = computeTotal(order);
  const statusColor = STATUS_BAR[order.status] ?? "bg-gray-300";

  return (
    <Link
      to={`/admin/orders/${order.id}`}
      aria-label={`View order ${order.id}`}
      className="group relative block w-full max-w-full overflow-hidden rounded-2xl border bg-white/90 backdrop-blur p-4 shadow-soft transition active:scale-[.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900"
    >
      {/* status color bar */}
      <span aria-hidden className={`absolute inset-y-0 left-0 w-1.5 ${statusColor}`} />
      <div className="pl-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <div className="font-semibold tracking-tight truncate wrap-anywhere">#{order.id}</div>
              <StatusPill status={order.status} />
            </div>
            <div className="mt-1 text-[15px] text-gray-700 truncate wrap-anywhere">
              {order.name} • {order.phone}
            </div>
            <div className="mt-0.5 text-xs text-gray-500">{order.date}</div>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-xs text-gray-500">Total</div>
            <div className="font-semibold">{toKSh(total)}</div>
          </div>
        </div>

        <div className="mt-3 h-px bg-gray-200" />

        <div className="mt-3 flex items-center justify-between text-sm">
          <div className="text-gray-600">
            {order.items.length} item{order.items.length !== 1 ? "s" : ""}
          </div>
          <span className="inline-flex items-center gap-1 text-xs text-gray-500">
            Tap to view
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ================== Shared bits ================== */
function SortableTh({
  label,
  active,
  dir,
  onClick,
  className = "",
}: {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
  className?: string;
}) {
  return (
    <th
      scope="col"
      aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : "none"}
      className={`text-left font-semibold ${className}`}
    >
      <button
        type="button"
        onClick={onClick}
        className="group inline-flex items-center gap-1 text-gray-800 hover:text-gray-900 print:pointer-events-none"
      >
        <span>{label}</span>
        <SortIcon active={active} dir={dir} />
      </button>
    </th>
  );
}

function StatusPill({ status }: { status: Order["status"] }) {
  const cls = STATUS_STYLES[status] ?? "bg-gray-100 text-gray-700 ring-gray-200";
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ring-1 ${cls}`}>
      {status}
    </span>
  );
}

/* ================== Icons ================== */
function SearchIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path d="M15.5 15.5 20 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="10.5" cy="10.5" r="6" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  );
}
function ChevronRight({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}
function PrintIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M7 8V4h10v4M6 17H4a2 2 0 01-2-2v-3a2 2 0 012-2h16a2 2 0 012 2v3a2 2 0 01-2 2h-2M7 17h10v3H7v-3z" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </svg>
  );
}
function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <svg viewBox="0 0 24 24" className={`h-4 w-4 transition ${active ? "opacity-100" : "opacity-40 group-hover:opacity-70"} print:opacity-0`}>
      <path d="M8 15l4 4 4-4M16 9l-4-4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"
        style={{ transform: dir === "asc" ? "rotate(180deg)" : "none", transformOrigin: "12px 12px" }} />
    </svg>
  );
}
function Dot({ className = "" }: { className?: string }) {
  return <span className={`inline-block h-2 w-2 rounded-full ${className}`} />;
}

/* ================== Skeleton / Empty ================== */
function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border bg-white/70 p-4 w-full max-w-full overflow-hidden">
      <div className="h-4 w-36 rounded bg-gray-200" />
      <div className="mt-2 h-3 w-48 rounded bg-gray-200" />
      <div className="mt-1 h-3 w-28 rounded bg-gray-200" />
      <div className="mt-3 h-8 rounded-xl bg-gray-200" />
    </div>
  );
}
function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="rounded-2xl border bg-white/70 p-10 text-center w-full max-w-full overflow-hidden">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
        <SearchIcon className="h-6 w-6 text-gray-400" />
      </div>
      <div className="font-semibold">No orders found</div>
      <p className="mt-1 text-sm text-gray-600">Try another search or clear your filters.</p>
      <button onClick={onReset} className="mt-4 btn-outline rounded-xl px-4 py-2">Reset filters</button>
    </div>
  );
}
