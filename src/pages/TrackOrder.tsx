import Container from "@/components/layout/Container";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { useState } from "react";
import { api, Order } from "@/lib/api";

export default function TrackOrder() {
  const [id, setId] = useState("");
  const [order, setOrder] = useState<Order | null | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const fetchOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const o = await api.orders.get(id.trim());
    setOrder(o ?? null);
    setLoading(false);
  };

  return (
    <Container className="py-10">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Track Order" }]} />
      <form onSubmit={fetchOrder} className="mt-4 flex gap-2">
        <input className="input" placeholder="Enter order ID" value={id} onChange={e => setId(e.target.value)} />
        <button className="btn-primary rounded-xl px-5">Track</button>
      </form>

      <div className="mt-6">
        {loading && <div className="text-gray-600">Loading…</div>}
        {order === null && <div className="text-gray-600">Order not found.</div>}
        {order && (
          <div className="card-soft p-5">
            <div className="font-semibold">Order #{order.id}</div>
            <div className="text-sm text-gray-600">Status: {order.status}</div>
            <ul className="mt-3 text-sm text-gray-700 space-y-1">
              {order.items.map((it, i) => <li key={i}>{it.title} × {it.qty}</li>)}
            </ul>
          </div>
        )}
      </div>
    </Container>
  );
}
