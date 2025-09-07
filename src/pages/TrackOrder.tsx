// src/pages/TrackOrder.tsx
import Container from "@/components/layout/Container";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { useMemo, useState } from "react";
import { api, Order } from "@/lib/api";
import { toKSh } from "@/utils/currency";
import {
  Search,
  Clipboard,
  ClipboardCheck,
  Loader2,
  CheckCircle2,
  Truck,
  Package,
  X as XIcon,
} from "lucide-react";

type Step = {
  key: string;
  label: string;
  icon: React.FC<{ className?: string }>;
};

// Simple stepper config to map common order states
const STEPS: Step[] = [
  { key: "Pending", label: "Pending", icon: Package },
  { key: "Paid", label: "Paid", icon: CheckCircle2 },
  { key: "Processing", label: "Processing", icon: Package },
  { key: "Shipped", label: "Shipped", icon: Truck },
  { key: "Delivered", label: "Delivered", icon: CheckCircle2 },
];

const statusIndex = (status?: string) => {
  if (!status) return 0;
  const i = STEPS.findIndex((s) => s.key.toLowerCase() === status.toLowerCase());
  if (i >= 0) return i;
  // fallback mapping
  switch (status.toLowerCase()) {
    case "new":
    case "created":
      return 0;
    case "paid":
      return 1;
    case "processing":
      return 2;
    case "shipped":
      return 3;
    case "delivered":
      return 4;
    default:
      return 0;
  }
};

export default function TrackOrder() {
  const [id, setId] = useState("");
  const [order, setOrder] = useState<Order | null | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [err, setErr] = useState<string>("");

  const canSubmit = id.trim().length > 0 && !loading;

  const total = useMemo(() => {
    if (!order) return 0;
    return order.items?.reduce((s, it: any) => s + (it.price_cents || 0) * (it.qty || 0), 0) ?? 0;
  }, [order]);

  const fetchOrder = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!canSubmit) return;
    try {
      setLoading(true);
      setErr("");
      setOrder(undefined);
      const o = await api.orders.get(id.trim());
      setOrder(o ?? null);
      if (!o) setErr("Order not found. Check the reference and try again.");
    } catch (e: any) {
      setErr(e?.message || "Failed to fetch order.");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const pasteFromClipboard = async () => {
    try {
      const txt = await navigator.clipboard.readText();
      if (txt) setId(txt.trim());
    } catch {
      // Ignore if permissions disallow
    }
  };

  const copyId = async (val: string) => {
    try {
      await navigator.clipboard.writeText(val);
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    } catch {}
  };

  const activeIdx = statusIndex(order?.status);

  return (
    <Container className="pt-8 pb-20 md:pt-10 md:pb-14">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Track Order" }]} />

      <div className="mt-4 grid gap-6 lg:grid-cols-3">
        {/* Left: Search card */}
        <div className="lg:col-span-1">
          <div className="card-soft p-5">
            <h1 className="text-2xl font-bold">Track your order</h1>
            <p className="mt-1 text-sm text-gray-600">
              Enter your order reference to see the latest status and details.
            </p>

            <form onSubmit={fetchOrder} className="mt-4 space-y-3">
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  className="input pl-9 pr-24 h-12 text-base"
                  placeholder="e.g. ORD-4F9A1C"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  autoCapitalize="characters"
                  spellCheck="false"
                  autoCorrect="off"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  {id && (
                    <button
                      type="button"
                      onClick={() => setId("")}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
                      aria-label="Clear"
                      title="Clear"
                    >
                      <XIcon className="h-4 w-4" />
                    </button>
                  )}
                  {!!navigator.clipboard && (
                    <button
                      type="button"
                      onClick={pasteFromClipboard}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
                      aria-label="Paste from clipboard"
                      title="Paste"
                    >
                      <Clipboard className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              <button
                className={`btn-primary w-full rounded-xl py-3 inline-flex items-center justify-center gap-2 ${
                  !canSubmit ? "opacity-90 cursor-not-allowed" : ""
                }`}
                disabled={!canSubmit}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Checking…
                  </>
                ) : (
                  "Track Order"
                )}
              </button>

              {err && (
                <div
                  role="alert"
                  className="rounded-xl border border-amber-200 bg-amber-50 text-amber-800 px-3 py-2 text-sm"
                >
                  {err}
                </div>
              )}

              {!id && (
                <div className="text-xs text-gray-500">
                  Tip: If you just placed an order, use the reference shown on the success page or
                  your SMS/email receipt.
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Right: Results */}
        <div className="lg:col-span-2 space-y-4">
          {/* Loading skeleton */}
          {loading && (
            <div
              role="status"
              aria-live="polite"
              className="card-soft p-5 animate-pulse space-y-4"
            >
              <div className="h-5 w-40 rounded bg-gray-200" />
              <div className="h-3 w-72 rounded bg-gray-200" />
              <div className="h-24 rounded bg-gray-200" />
            </div>
          )}

          {/* Not found hint */}
          {order === null && !loading && (
            <div className="card-soft p-6 text-center text-gray-600">
              <div className="text-lg font-semibold mb-1">No order found</div>
              <div className="text-sm">Double-check the reference and try again.</div>
            </div>
          )}

          {/* Success */}
          {order && !loading && (
            <>
              {/* Header card */}
              <div className="card-soft p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-sm text-gray-600">Order reference</div>
                    <div className="text-lg font-semibold tracking-tight">#{order.id}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-sm ${
                        activeIdx >= 4
                          ? "bg-emerald-50 text-emerald-700"
                          : activeIdx >= 1
                          ? "bg-sky-50 text-sky-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {order.status || "Pending"}
                    </span>

                    <button
                      onClick={() => copyId(String(order.id))}
                      className="inline-flex items-center gap-1.5 rounded-xl border bg-white/70 px-2.5 py-1.5 text-sm hover:bg-white"
                      title="Copy ID"
                    >
                      {copied ? (
                        <>
                          <ClipboardCheck className="h-4 w-4" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Clipboard className="h-4 w-4" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="mt-2 text-sm text-gray-600">
                  Placed on{" "}
                  <b>
                    {order.date ? new Date(order.date).toLocaleString() : "—"}
                  </b>
                </div>
              </div>

              {/* Stepper */}
              <div className="card-soft p-5">
                <div className="text-sm font-semibold mb-3">Progress</div>
                <ol className="grid grid-cols-5 gap-2">
                  {STEPS.map((s, i) => {
                    const done = i <= activeIdx;
                    const Icon = s.icon;
                    return (
                      <li key={s.key} className="text-center">
                        <div
                          className={`mx-auto inline-flex h-9 w-9 items-center justify-center rounded-full border ${
                            done
                              ? "bg-brand text-white border-brand"
                              : "bg-white/80 text-gray-500 border-gray-200"
                          }`}
                          title={s.label}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="mt-1 text-[11px] text-gray-700">{s.label}</div>
                      </li>
                    );
                  })}
                </ol>
                {/* Progress bar */}
                <div className="mt-3 h-1.5 w-full rounded-full bg-gray-200">
                  <div
                    className="h-1.5 rounded-full bg-gradient-to-r from-brand to-brand-dark transition-all"
                    style={{
                      width: `${(Math.min(activeIdx, STEPS.length - 1) / (STEPS.length - 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Items */}
              <div className="card-soft p-5">
                <div className="text-sm font-semibold mb-3">
                  Items ({order.items?.length || 0})
                </div>
                {(!order.items || order.items.length === 0) ? (
                  <div className="text-sm text-gray-600">No items on this order.</div>
                ) : (
                  <ul className="space-y-3">
                    {order.items.map((it: any, i: number) => (
                      <li key={i} className="flex items-center gap-3">
                        {it.image ? (
                          <img
                            src={it.image}
                            alt=""
                            className="h-14 w-14 rounded-xl object-cover border"
                          />
                        ) : (
                          <div className="h-14 w-14 rounded-xl bg-gray-100 grid place-items-center">
                            <Package className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="font-medium truncate">{it.title}</div>
                          <div className="text-sm text-gray-600">
                            Qty {it.qty} • {toKSh((it.price_cents || 0) * (it.qty || 0))}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-4 flex items-center justify-between border-t pt-3">
                  <span className="text-sm text-gray-600">Subtotal</span>
                  <span className="text-lg font-semibold">{toKSh(total)}</span>
                </div>
              </div>
            </>
          )}

          {/* Empty state (first visit) */}
          {order === undefined && !loading && (
            <div className="card-soft p-6 text-center text-gray-600">
              <div className="text-lg font-semibold mb-1">Track an order</div>
              <div className="text-sm">
                Enter your order reference above to view progress and details.
              </div>
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}
