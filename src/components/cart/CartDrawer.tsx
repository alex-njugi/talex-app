// src/components/cart/CartDrawer.tsx
import { useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { close, remove, setQty } from "@/store/slices/cartSlice";
import { toKSh } from "@/utils/currency";
import { X, Trash2, Minus, Plus } from "lucide-react";
import { Link } from "react-router-dom";

export default function CartDrawer() {
  const { isOpen, items, total_cents: totalSh } = useAppSelector((s) => s.cart); // NOTE: treat as SHILLINGS
  const d = useAppDispatch();

  // Lock page scroll when drawer is open
  useEffect(() => {
    const original = document.body.style.overflow;
    if (isOpen) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen]);

  // ESC to close
  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") d(close());
    },
    [d]
  );
  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onKeyDown]);

  const dec = (id: string, current: number) => d(setQty({ id, qty: Math.max(1, (current || 1) - 1) }));
  const inc = (id: string, current: number) => d(setQty({ id, qty: Math.max(1, (current || 1) + 1) }));
  const setQ = (id: string, v: string) => {
    const n = Math.max(1, Math.floor(Number(v) || 1));
    d(setQty({ id, qty: n }));
  };

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? "" : "pointer-events-none"}`}>
      {/* Backdrop */}
      <button
        aria-label="Close cart"
        onClick={() => d(close())}
        className={`absolute inset-0 bg-black/40 transition ${isOpen ? "opacity-100" : "opacity-0"}`}
      />
      {/* Panel */}
      <aside
        className={`absolute right-0 top-0 h-full w-[92%] sm:w-[420px] bg-white shadow-2xl transition-transform ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <div className="font-semibold">Your Cart</div>
          <button onClick={() => d(close())} className="p-2 rounded-lg hover:bg-gray-50" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        <div className="p-4 space-y-3 max-h-[calc(100%-168px)] overflow-auto">
          {items.length === 0 && <div className="text-sm text-gray-500">Your cart is empty.</div>}
          {items.map((it) => {
            // Treat prices as SHILLINGS
            const unitSh = it.price_cents; // naming kept from store
            const lineSh = unitSh * it.qty;

            return (
              <div key={it.id} className="flex items-start gap-3 border rounded-xl p-2">
                <img
                  src={it.image}
                  alt={it.title}
                  className="h-14 w-14 rounded-lg object-cover shrink-0"
                  loading="lazy"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{it.title}</div>
                      <div className="text-xs text-gray-500 truncate">{toKSh(unitSh)} each</div>
                    </div>
                    <button
                      onClick={() => d(remove(it.id))}
                      className="text-rose-600 hover:text-rose-700 inline-flex items-center gap-1 text-sm shrink-0"
                      aria-label={`Remove ${it.title}`}
                      title="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Quantity + line total */}
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <div className="inline-flex items-center rounded-lg ring-1 ring-gray-300 overflow-hidden">
                      <button
                        className="px-2 py-1.5 hover:bg-gray-50"
                        onClick={() => dec(it.id, it.qty)}
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <input
                        type="number"
                        inputMode="numeric"
                        min={1}
                        value={it.qty}
                        onChange={(e) => setQ(it.id, e.target.value)}
                        className="w-14 text-center outline-none py-1.5"
                        aria-label="Quantity"
                      />
                      <button
                        className="px-2 py-1.5 hover:bg-gray-50"
                        onClick={() => inc(it.id, it.qty)}
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-gray-500">Line total</div>
                      <div className="font-semibold whitespace-nowrap">{toKSh(lineSh)}</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t">
          <div className="flex items-center justify-between font-semibold">
            <span>Subtotal</span>
            <span>{toKSh(totalSh)}</span>
          </div>
          <div className="mt-3 flex gap-2">
            <Link to="/cart" onClick={() => d(close())} className="btn btn-outline flex-1">
              View Cart
            </Link>
            <Link to="/checkout" onClick={() => d(close())} className="btn-primary flex-1">
              Checkout
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
}
