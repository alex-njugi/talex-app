// src/pages/Cart.tsx
import Container from "@/components/layout/Container";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { useAppDispatch, useAppSelector } from "@/store";
import { remove, setQty, clear } from "@/store/slices/cartSlice";
import { toKSh } from "@/utils/currency";
import { Link } from "react-router-dom";
import { Trash2, Minus, Plus } from "lucide-react";

export default function Cart() {
  const { items, total_cents } = useAppSelector((s) => s.cart);
  const d = useAppDispatch();

  const dec = (id: string, cur: number) =>
    d(setQty({ id, qty: Math.max(1, cur - 1) }));
  const inc = (id: string, cur: number) => d(setQty({ id, qty: cur + 1 }));

  return (
    <Container className="py-10">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Cart" }]} />

      {items.length === 0 ? (
        <div className="mt-8 text-center">
          <div className="mx-auto h-28 w-28 rounded-2xl border bg-white/70 flex items-center justify-center">
            <Trash2 className="h-8 w-8 text-gray-400" />
          </div>
          <h1 className="mt-4 text-xl font-semibold">Your cart is empty</h1>
          <p className="mt-1 text-gray-600">Let’s find something you’ll love.</p>
          <Link
            to="/shop"
            className="mt-4 inline-flex btn-primary rounded-xl px-5 py-2.5"
          >
            Shop now
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            {/* Items */}
            <div className="lg:col-span-2">
              {/* Header (desktop) */}
              <div className="hidden md:grid grid-cols-12 px-3 pb-2 text-xs uppercase tracking-wide text-gray-500">
                <div className="col-span-7">Item</div>
                <div className="col-span-3">Quantity</div>
                <div className="col-span-2 text-right">Total</div>
              </div>

              <div className="space-y-3">
                {items.map((it) => {
                  const lineTotal = it.qty * it.price_cents;
                  return (
                    <div
                      key={it.id}
                      className="grid grid-cols-12 gap-4 border rounded-2xl p-3 bg-white/70"
                    >
                      {/* thumbnail */}
                      <div className="col-span-12 md:col-span-2">
                        <img
                          src={it.image}
                          alt={it.title}
                          className="h-24 w-full md:w-24 rounded-xl object-cover"
                        />
                      </div>

                      {/* title + unit price */}
                      <div className="col-span-12 md:col-span-5 min-w-0">
                        <div className="font-semibold truncate">{it.title}</div>
                        <div className="mt-0.5 text-sm text-gray-600">
                          {toKSh(it.price_cents)} <span className="text-gray-400">/ each</span>
                        </div>
                        {/* Mobile actions row */}
                        <div className="mt-3 flex md:hidden items-center justify-between">
                          {/* qty stepper (mobile) */}
                          <div className="inline-flex items-center rounded-xl border bg-white/60">
                            <button
                              aria-label="Decrease quantity"
                              onClick={() => dec(it.id, it.qty)}
                              className="p-2 hover:bg-gray-100 rounded-l-xl disabled:opacity-50"
                              disabled={it.qty <= 1}
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <input
                              className="w-12 text-center outline-none bg-transparent"
                              type="number"
                              min={1}
                              value={it.qty}
                              onChange={(e) =>
                                d(
                                  setQty({
                                    id: it.id,
                                    qty: Math.max(1, Number(e.target.value || 1)),
                                  })
                                )
                              }
                            />
                            <button
                              aria-label="Increase quantity"
                              onClick={() => inc(it.id, it.qty)}
                              className="p-2 hover:bg-gray-100 rounded-r-xl"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="text-right font-semibold">
                            {toKSh(lineTotal)}
                          </div>
                        </div>
                      </div>

                      {/* qty stepper (desktop) */}
                      <div className="hidden md:flex col-span-3 items-center">
                        <div className="inline-flex items-center rounded-xl border bg-white/60">
                          <button
                            aria-label="Decrease quantity"
                            onClick={() => dec(it.id, it.qty)}
                            className="p-2 hover:bg-gray-100 rounded-l-xl disabled:opacity-50"
                            disabled={it.qty <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <input
                            className="w-14 text-center outline-none bg-transparent"
                            type="number"
                            min={1}
                            value={it.qty}
                            onChange={(e) =>
                              d(
                                setQty({
                                  id: it.id,
                                  qty: Math.max(1, Number(e.target.value || 1)),
                                })
                              )
                            }
                          />
                          <button
                            aria-label="Increase quantity"
                            onClick={() => inc(it.id, it.qty)}
                            className="p-2 hover:bg-gray-100 rounded-r-xl"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* line total + remove (desktop) */}
                      <div className="hidden md:flex col-span-2 items-center justify-end gap-2">
                        <div className="text-right font-semibold flex-1">
                          {toKSh(lineTotal)}
                        </div>
                        <button
                          onClick={() => d(remove(it.id))}
                          className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                          aria-label={`Remove ${it.title} from cart`}
                          title="Remove"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>

                      {/* remove (mobile) */}
                      <div className="md:hidden col-span-12 flex justify-end">
                        <button
                          onClick={() => d(remove(it.id))}
                          className="text-red-600 hover:text-red-700 inline-flex items-center gap-1 text-sm"
                          aria-label={`Remove ${it.title} from cart`}
                        >
                          <Trash2 className="h-4 w-4" /> Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 flex items-center justify-between">
                <button
                  onClick={() => d(clear())}
                  className="text-sm text-gray-600 underline hover:text-gray-800"
                >
                  Clear cart
                </button>
                <Link to="/shop" className="text-sm text-brand underline">
                  Continue shopping
                </Link>
              </div>
            </div>

            {/* Summary */}
            <div className="card-soft p-5 h-max sticky top-20">
              <div className="text-lg font-semibold mb-2">Order Summary</div>
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span className="font-semibold">{toKSh(total_cents)}</span>
              </div>
              <div className="mt-1 text-xs text-gray-500">
                Shipping calculated at dispatch.
              </div>
              <div className="mt-4 space-y-2">
                <Link
                  to="/checkout"
                  className="btn-primary w-full rounded-xl py-3 text-center"
                >
                  Proceed to Checkout
                </Link>
                <Link
                  to="/shop"
                  className="btn-outline w-full rounded-xl py-3 text-center"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>

          {/* Mobile sticky checkout bar */}
          <div className="md:hidden fixed inset-x-0 bottom-0 z-30 border-t bg-white/90 backdrop-blur">
            <Container className="py-3 flex items-center justify-between gap-3">
              <div className="text-sm">
                Subtotal{" "}
                <span className="font-semibold">{toKSh(total_cents)}</span>
              </div>
              <Link
                to="/checkout"
                className="btn-primary rounded-xl px-4 py-2"
              >
                Checkout
              </Link>
            </Container>
          </div>
          <div className="h-16 md:hidden" />
        </>
      )}
    </Container>
  );
}
