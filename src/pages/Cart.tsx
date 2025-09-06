import Container from "@/components/layout/Container";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { useAppDispatch, useAppSelector } from "@/store";
import { remove, setQty, clear } from "@/store/slices/cartSlice";
import { toKSh } from "@/utils/currency";
import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";

export default function Cart() {
  const { items, total_cents } = useAppSelector((s) => s.cart);
  const d = useAppDispatch();

  return (
    <Container className="py-10">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Cart" }]} />

      {items.length === 0 ? (
        <div className="mt-6 text-gray-600">
          Your cart is empty. <Link to="/shop" className="text-brand underline">Shop now</Link>.
        </div>
      ) : (
        <div className="mt-6 grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {items.map((it) => (
              <div key={it.id} className="flex items-center gap-4 border rounded-2xl p-3 bg-white/70">
                <img src={it.image} className="h-20 w-20 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="font-semibold truncate">{it.title}</div>
                  <div className="text-sm text-gray-600">{toKSh(it.price_cents)}</div>
                  <div className="mt-1">
                    <input
                      type="number" min={1} value={it.qty}
                      onChange={(e) => d(setQty({ id: it.id, qty: Number(e.target.value) }))}
                      className="input w-24 py-1"
                    />
                  </div>
                </div>
                <button onClick={() => d(remove(it.id))} className="text-red-600 hover:text-red-700">
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
            <button onClick={() => d(clear())} className="text-sm text-gray-600 underline">Clear cart</button>
          </div>

          <div className="card-soft p-5 h-max">
            <div className="text-lg font-semibold mb-2">Order Summary</div>
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span className="font-semibold">{toKSh(total_cents)}</span>
            </div>
            <div className="mt-4 space-y-2">
              <Link to="/checkout" className="btn-primary w-full rounded-xl py-3 text-center">Proceed to Checkout</Link>
              <Link to="/shop" className="btn-outline w-full rounded-xl py-3 text-center">Continue Shopping</Link>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}
