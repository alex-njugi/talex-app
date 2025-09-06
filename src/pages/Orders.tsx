import Container from "@/components/layout/Container";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { Order } from "@/lib/api";

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  useEffect(() => { api.orders.list().then(setOrders); }, []);
  return (
    <Container className="py-10">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "My Orders" }]} />
      <div className="mt-4 space-y-3">
        {orders.map(o => (
          <div key={o.id} className="card-soft p-4">
            <div className="font-semibold">#{o.id} — {o.status}</div>
            <div className="text-sm text-gray-600">{o.items.length} items • {new Date(o.date).toLocaleString()}</div>
          </div>
        ))}
        {orders.length === 0 && <div className="text-gray-600">No orders yet.</div>}
      </div>
    </Container>
  );
}
