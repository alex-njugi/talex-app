import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "./_AdminLayout";
import { api, Order } from "@/lib/api";
import { toKSh } from "@/utils/currency";
import toast from "react-hot-toast";

function toSafeDateString(d?: string | number) {
  const dt = d ? new Date(d) : new Date();
  return isNaN(dt.getTime()) ? String(d ?? "") : dt.toLocaleString();
}

export default function AdminOrderDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const o = id ? await api.orders.get(id) : null;
    setOrder(o);
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, [id]);

  const total = useMemo(
    () => order?.items.reduce<number>((s, it) => s + it.qty * it.price_cents, 0) ?? 0,
    [order]
  );

  const update = async (patch: Partial<Order>) => {
    if (!order) return;
    const next = await api.orders.update(order.id, patch);
    setOrder(next);
    toast.success("Order updated");
  };

  if (loading) {
    return (
      <AdminLayout title="Order" subtitle="Loading...">
        <div className="h-40 rounded-2xl bg-gray-100 animate-pulse" />
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout title="Order">
        <div className="text-gray-600">Order not found.</div>
      </AdminLayout>
    );
  }

  const isPaid = order.payment?.status === "Confirmed";

  return (
    <AdminLayout title={`Order #${order.id}`} subtitle={`${order.name ?? "—"} • ${order.phone ?? "—"}`}>
      {/* Guardrail to prevent horizontal scroll on small screens */}
      <div className="max-w-full overflow-x-hidden">
        <div className="grid gap-5 lg:grid-cols-3">
          {/* LEFT: Items + Payment */}
          <div className="lg:col-span-2 space-y-5">
            {/* Items */}
            <div className="card-soft p-5">
              <div className="font-semibold mb-3">Items</div>
              <ul className="divide-y">
                {order.items.map((it, i) => (
                  <li key={i} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={it.image || "https://picsum.photos/seed/placeholder/80/80"}
                        alt={it.title}
                        className="h-12 w-12 rounded-xl object-cover border shrink-0"
                        loading="lazy"
                      />
                      <div className="min-w-0">
                        <div className="font-medium truncate">{it.title}</div>
                        <div className="text-xs text-gray-600">Qty {it.qty}</div>
                      </div>
                    </div>
                    <div className="font-semibold shrink-0 text-right">{toKSh(it.qty * it.price_cents)}</div>
                  </li>
                ))}
              </ul>

              <div className="mt-3 flex items-center justify-end gap-6 text-sm">
                <div className="text-gray-600">Subtotal</div>
                <div className="font-semibold">{toKSh(total)}</div>
              </div>
            </div>

            {/* Payment */}
            <div className="card-soft p-5">
              <div className="font-semibold mb-2">Payment</div>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`badge ${isPaid ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-700"}`}
                >
                  {isPaid ? "Paid" : "Unpaid"}
                </span>
                {order.payment?.receipt && (
                  <span className="badge bg-gray-100 text-gray-700 break-words">
                    Ref: {order.payment.receipt}
                  </span>
                )}
                {order.payment?.phone && (
                  <span className="badge bg-gray-100 text-gray-700">{order.payment.phone}</span>
                )}
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 sm:flex sm:gap-2">
                <button
                  className="btn-primary rounded-xl px-4 py-2 w-full sm:w-auto"
                  onClick={() => update({ payment: { ...(order.payment || {}), status: "Confirmed" } })}
                >
                  Mark Paid
                </button>
                <button
                  className="btn-outline rounded-xl px-4 py-2 w-full sm:w-auto"
                  onClick={() => update({ payment: { ...(order.payment || {}), status: "Failed" } })}
                >
                  Mark Failed
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: Customer / Status / Totals */}
          <div className="space-y-5">
            {/* Customer */}
            <div className="card-soft p-5 space-y-2">
              <div className="font-semibold">Customer</div>
              <div className="text-sm break-words">{order.name ?? "—"}</div>
              <div className="text-sm break-words">{order.phone ?? "—"}</div>
              <div className="text-sm text-gray-700 break-words">{order.address ?? "—"}</div>
              <div className="text-xs text-gray-500">Date: {toSafeDateString((order as any).date)}</div>
            </div>

            {/* Status */}
            <div className="card-soft p-5 space-y-3">
              <div className="font-semibold">Status</div>
              <select
                className="input w-full"
                value={order.status}
                onChange={(e) => update({ status: e.target.value as Order["status"] })}
              >
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Shipped">Shipped</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <button onClick={() => nav(-1)} className="btn-outline rounded-xl py-2 w-full sm:w-auto">
                Back
              </button>
            </div>

            {/* Totals */}
            <div className="card-soft p-5">
              <div className="font-semibold mb-1">Totals</div>
              <div className="flex items-center justify-between">
                <span>Items</span>
                <span className="font-semibold">{toKSh(total)}</span>
              </div>
              <div className="text-xs text-gray-500 mt-2">Shipping charged at dispatch.</div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
