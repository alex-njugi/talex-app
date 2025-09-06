import { useEffect, useMemo, useState } from "react";
import AdminLayout from "./_AdminLayout";
import { api, Order, Product } from "@/lib/api";
import { toKSh } from "@/utils/currency";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        await api.seedIfEmpty();
        const [ps, os] = await Promise.all([api.products.list(), api.orders.list()]);
        setProducts(ps);
        setOrders(os);
      } catch (e: any) {
        setErr(e?.message || "Failed to load admin data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const stats = useMemo(() => {
    const revenue = orders
      .filter((o) => o.payment?.status === "Confirmed")
      .reduce((sum, o) => sum + o.items.reduce((s, it) => s + it.qty * it.price_cents, 0), 0);

    const lowStock = products.filter((p) => p.stock <= 5).length;
    const active = products.filter((p) => p.is_active).length;

    return {
      revenue,
      orders: orders.length,
      lowStock,
      active,
    };
  }, [products, orders]);

  return (
    <AdminLayout
      title="Dashboard"
      subtitle="At-a-glance metrics and recent activity"
    >
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat title="Revenue (Paid)" value={toKSh(stats.revenue)} />
        <Stat title="Orders" value={String(stats.orders)} />
        <Stat title="Active Products" value={String(stats.active)} />
        <Stat title="Low Stock (≤5)" value={String(stats.lowStock)} />
      </div>

      {/* Recent orders & products */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Recent Orders">
          {loading ? (
            <Skeleton lines={5} />
          ) : err ? (
            <ErrorText text={err} />
          ) : orders.length === 0 ? (
            <Empty text="No orders yet." />
          ) : (
            <ul className="divide-y">
              {orders.slice(0, 6).map((o) => (
                <li key={o.id} className="py-3 flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="font-medium truncate">#{o.id}</div>
                    <div className="text-xs text-gray-600">
                      {o.name} • {o.phone}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {toKSh(o.items.reduce((s, it) => s + it.qty * it.price_cents, 0))}
                    </div>
                    <span
                      className={`badge ${
                        o.payment?.status === "Confirmed"
                          ? "bg-green-50 text-green-700"
                          : o.status === "Cancelled"
                          ? "bg-red-50 text-red-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {o.payment?.status === "Confirmed" ? "Paid" : o.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Low Stock">
          {loading ? (
            <Skeleton lines={5} />
          ) : (
            <ul className="divide-y">
              {products
                .filter((p) => p.stock <= 5)
                .slice(0, 6)
                .map((p) => (
                  <li key={p.id} className="py-3 flex items-center justify-between">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{p.title}</div>
                      <div className="text-xs text-gray-600">{p.brand}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">Stock: {p.stock}</div>
                      <span className="badge bg-amber-50 text-amber-700">Restock</span>
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}

function Stat({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-white/70 backdrop-blur p-5 shadow-soft">
      <div className="text-xs uppercase tracking-wider text-gray-600">{title}</div>
      <div className="mt-1 text-2xl font-extrabold">{value}</div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-white/70 backdrop-blur p-5 shadow-soft">
      <div className="font-semibold mb-3">{title}</div>
      {children}
    </div>
  );
}

function Skeleton({ lines = 4 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-10 rounded-xl bg-gray-100 animate-pulse" />
      ))}
    </div>
  );
}
function ErrorText({ text }: { text: string }) {
  return <div className="text-sm text-red-600">{text}</div>;
}
function Empty({ text }: { text: string }) {
  return <div className="text-sm text-gray-600">{text}</div>;
}
