// src/components/cart/CartDrawer.tsx
import { useAppDispatch, useAppSelector } from "@/store";
import { close, remove, setQty } from "@/store/slices/cartSlice";
import { toKSh } from "@/utils/currency";
import { X, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function CartDrawer() {
  const { isOpen, items, total_cents } = useAppSelector((s)=>s.cart);
  const d = useAppDispatch();
  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? "" : "pointer-events-none"}`}>
      {/* backdrop */}
      <div onClick={()=>d(close())} className={`absolute inset-0 bg-black/40 transition ${isOpen ? "opacity-100" : "opacity-0"}`} />
      {/* panel */}
      <aside className={`absolute right-0 top-0 h-full w-[92%] sm:w-[420px] bg-white shadow-2xl transition-transform ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-center justify-between p-4 border-b">
          <div className="font-semibold">Your Cart</div>
          <button onClick={()=>d(close())}><X className="h-5 w-5" /></button>
        </div>
        <div className="p-4 space-y-3 max-h-[calc(100%-160px)] overflow-auto">
          {items.length === 0 && <div className="text-sm text-gray-500">Your cart is empty.</div>}
          {items.map(it=>(
            <div key={it.id} className="flex items-center gap-3 border rounded-xl p-2">
              <img src={it.image} alt={it.title} className="h-14 w-14 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <div className="font-medium truncate">{it.title}</div>
                <div className="text-sm text-gray-600">{toKSh(it.price_cents)}</div>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="number" min={1} value={it.qty}
                    onChange={(e)=>d(setQty({id: it.id, qty: Number(e.target.value)}))}
                    className="w-16 input py-1 px-2"
                  />
                  <button onClick={()=>d(remove(it.id))} className="text-red-600 hover:text-red-700 inline-flex items-center gap-1 text-sm">
                    <Trash2 className="h-4 w-4" /> Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t">
          <div className="flex items-center justify-between font-semibold">
            <span>Subtotal</span><span>{toKSh(total_cents)}</span>
          </div>
          <div className="mt-3 flex gap-2">
            <Link to="/cart" onClick={()=>d(close())} className="btn btn-outline flex-1">View Cart</Link>
            <Link to="/checkout" onClick={()=>d(close())} className="btn-primary flex-1">Checkout</Link>
          </div>
        </div>
      </aside>
    </div>
  );
}