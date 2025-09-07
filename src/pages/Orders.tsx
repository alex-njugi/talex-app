// src/pages/Orders.tsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Container from "@/components/layout/Container";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { api, Order } from "@/lib/api";
import { toKSh } from "@/utils/currency";
import {
  Package, Truck, CheckCircle, XCircle, Clock, ChevronRight, RefreshCw, Receipt
} from "lucide-react";

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");

  const load = async () => {
    try {
      setLoading(true);
      setErr("");
      const list = await api.orders.list();
      setOrders(list);
    } catch (e: any) {
      setErr(e?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <Container className="py-10">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "My Orders" }]} />

      {/* Header bar w/ refresh */}
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h1 className="text-2xl font-bold">Your Orders</h1>
        <button
          onClick={load}
          className="inline-flex items-center gap-2 rounded-xl border bg-white/70 px-3.5 py-2 text-sm hover:bg-white"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Error */}
      {err && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 px-4 py-2">
          {err}
        </div>
      )}

      {/* Loading skeletons */}
      {loading ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border bg-white/70 p-4 animate-pulse">
              <div className="h-4 w-40 bg-gray-200 rounded" />
              <div className="mt-2 h-3 w-56 bg-gray-200 rounded" />
              <div className="mt-4 h-16 w-full bg-gray-200 rounded-xl" />
              <div className="mt-3 h-9 w-full bg-gray-200 rounded-lg" />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyOrders />
      ) : (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {orders.map((o) => (
            <OrderCard key={o.id} o={o} />
          ))}
        </div>
      )}
    </Container>
  );
}

/* ---------- Pieces ---------- */

function OrderCard({ o }: { o: Order }) {
  const total = useMemo(
    () => o.items.reduce((s, it) => s + it.price_cents * it.qty, 0),
    [o.items]
  );

  const status = getStatus(o.status);
  const pay = o.payment?.status ? getPay(o.payment.status) : null;

  return (
    <div className="rounded-2xl border bg-white/80 p-4 shadow-[0_8px_24px_-12px_rgba(2,6,23,0.10)]">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold">Order #{o.id}</div>
          <div className="text-xs text-gray-600">{new Date(o.date).toLocaleString()}</div>
        </div>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs ${status.badge}`}>
          {status.icon}
          {status.label}
        </span>
      </div>

      {/* Items preview */}
      <div className="mt-3 flex items-center gap-2">
        <ThumbRow urls={o.items.map((i) => i.image)} />
        <div className="text-sm text-gray-600">{o.items.length} item{o.items.length > 1 ? "s" : ""}</div>
      </div>

      {/* Meta */}
      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-xl border bg-white/60 p-2.5">
          <div className="text-gray-500">Total</div>
          <div className="font-semibold">{toKSh(total)}</div>
        </div>
        <div className="rounded-xl border bg-white/60 p-2.5">
          <div className="text-gray-500">Payment</div>
          <div className="font-semibold inline-flex items-center gap-1">
            {pay ? pay.icon : <Receipt className="h-4 w-4 text-gray-400" />}
            {pay ? pay.label : "—"}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Link
          to={`/track-order?id=${o.id}`}
          className="inline-flex items-center justify-center gap-2 rounded-xl border bg-white/70 px-3.5 py-2.5 text-sm hover:bg-white"
        >
          <Truck className="h-4 w-4" />
          Track
        </Link>
        <Link
          to={`/order/success/${o.id}`}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand text-white px-3.5 py-2.5 text-sm hover:bg-brand-dark"
        >
          View details
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

function ThumbRow({ urls }: { urls: (string | undefined)[] }) {
  const shown = urls.slice(0, 3);
  const extra = urls.length - shown.length;
  return (
    <div className="flex -space-x-2">
      {shown.map((u, i) => (
        <div key={i} className="h-10 w-10 rounded-xl ring-2 ring-white overflow-hidden border bg-gray-100">
          <img
            src={u || "https://picsum.photos/seed/talex/80/80"}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      ))}
      {extra > 0 && (
        <div className="h-10 w-10 rounded-xl ring-2 ring-white border bg-gray-100 grid place-items-center text-xs text-gray-600">
          +{extra}
        </div>
      )}
    </div>
  );
}

function EmptyOrders() {
  return (
    <div className="mt-8 rounded-2xl border bg-white/80 p-8 text-center">
      <div className="mx-auto h-12 w-12 rounded-2xl bg-gradient-to-br from-brand to-brand-dark text-white grid place-items-center">
        <Package className="h-6 w-6" />
      </div>
      <h2 className="mt-3 text-xl font-semibold">No orders yet</h2>
      <p className="mt-1 text-gray-600">
        When you place an order, it will show up here with tracking and receipts.
      </p>
      <div className="mt-5 inline-flex gap-3">
        <Link to="/shop" className="btn-primary rounded-xl px-5 py-2.5">
          Start shopping
        </Link>
        <Link to="/about" className="btn-outline rounded-xl px-5 py-2.5">
          Learn more
        </Link>
      </div>
    </div>
  );
}

/* ---------- helpers ---------- */

function getStatus(s: Order["status"]) {
  switch (s) {
    case "Paid":
      return {
        label: "Paid",
        badge: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
        icon: <CheckCircle className="h-3.5 w-3.5" />,
      };
    case "Pending":
      return {
        label: "Pending",
        badge: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
        icon: <Clock className="h-3.5 w-3.5" />,
      };
    case "Shipped":
      return {
        label: "Shipped",
        badge: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
        icon: <Truck className="h-3.5 w-3.5" />,
      };
    case "Completed":
      return {
        label: "Completed",
        badge: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
        icon: <CheckCircle className="h-3.5 w-3.5" />,
      };
    case "Cancelled":
    default:
      return {
        label: "Cancelled",
        badge: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
        icon: <XCircle className="h-3.5 w-3.5" />,
      };
  }
}

function getPay(s: NonNullable<Order["payment"]>["status"]) {
  switch (s) {
    case "Confirmed":
      return { label: "Confirmed", icon: <CheckCircle className="h-4 w-4 text-emerald-600" /> };
    case "Pending":
      return { label: "Pending", icon: <Clock className="h-4 w-4 text-amber-600" /> };
    case "Failed":
    default:
      return { label: "Failed", icon: <XCircle className="h-4 w-4 text-rose-600" /> };
  }
}
