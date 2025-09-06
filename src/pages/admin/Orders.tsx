import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "./_AdminLayout";
import { api, Order } from "@/lib/api";
import { toKSh } from "@/utils/currency";

export default function AdminOrdersPage() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | Order["status"]>("all");

  const load = async () => {
    setLoading(true);
    await api.seedIfEmpty();
    const list = await api.orders.list();
    setOrders(list);
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);

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

  return (
    <AdminLayout title="Orders" subtitle="Track, update and fulfill orders">
      <div className="rounded-2xl border bg-white/70 backdrop-blur p-4 shadow-soft">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <input
            className="input sm:w-64"
            placeholder="Search order #, name, phone"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <div className="flex gap-3">
            <select className="input w-40" value={status} onChange={(e) => setStatus(e.target.value as any)}>
              <option value="all">All status</option>
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
              <option value="Shipped">Shipped</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border bg-white/70 backdrop-blur shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <Th>Order</Th>
                <Th>Customer</Th>
                <Th>Date</Th>
                <Th>Payment</Th>
                <Th className="text-right">Total</Th>
                <Th className="text-right pr-4">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <Td colSpan={6}>
                      <div className="h-8 rounded-xl bg-gray-100" />
                    </Td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <Td colSpan={6} className="text-center text-gray-600 py-8">
                    No orders found.
                  </Td>
                </tr>
              ) : (
                filtered.map((o) => {
                  const total = o.items.reduce((s, it) => s + it.qty * it.price_cents, 0);
                  const isPaid = o.payment?.status === "Confirmed";
                  return (
                    <tr key={o.id} className="border-t hover:bg-gray-50/60">
                      <Td>
                        <div className="font-medium">#{o.id}</div>
                        <div className="text-xs text-gray-500">{o.status}</div>
                      </Td>
                      <Td>
                        <div className="font-medium">{o.name}</div>
                        <div className="text-xs text-gray-500">{o.phone}</div>
                      </Td>
                      <Td>{o.date}</Td>
                      <Td>
                        <span className={`badge ${isPaid ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                          {isPaid ? "Paid" : "Unpaid"}
                        </span>
                      </Td>
                      <Td className="text-right font-semibold">{toKSh(total)}</Td>
                      <Td className="text-right pr-3">
                        <Link to={`/admin/orders/${o.id}`} className="btn-outline rounded-xl px-3 py-1.5">
                          View
                        </Link>
                      </Td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

const Th = ({ children, className = "" }: any) => (
  <th className={`text-left px-4 py-3 font-semibold ${className}`}>{children}</th>
);
const Td = ({ children, className = "", colSpan }: any) => (
  <td className={`px-4 py-3 align-middle ${className}`} colSpan={colSpan}>
    {children}
  </td>
);
