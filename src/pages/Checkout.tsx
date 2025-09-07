// src/pages/Checkout.tsx
import Container from "@/components/layout/Container";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { useAppDispatch, useAppSelector } from "@/store";
import { toKSh } from "@/utils/currency";
import { useNavigate, Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { Smartphone } from "lucide-react";
import { api } from "@/lib/api";
import { clear } from "@/store/slices/cartSlice";
import toast from "react-hot-toast";

const FORM_ID = "checkout-form";

export default function Checkout() {
  const { items, total_cents } = useAppSelector((s) => s.cart);
  const d = useAppDispatch();
  const nav = useNavigate();

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    usePhoneForSTK: true,
    notes: "",
  });

  const disabled = useMemo(
    () =>
      saving ||
      items.length === 0 ||
      !form.name.trim() ||
      !form.email.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ||
      !validPhone(form.phone) ||
      !form.address.trim(),
    [saving, items.length, form]
  );

  function validPhone(p: string) {
    const digits = p.replace(/[^\d]/g, "");
    // allow 07xxxxxxxx, 01xxxxxxxx, 2547xxxxxxxx
    return (
      /^07\d{8}$/.test(digits) ||
      /^01\d{8}$/.test(digits) ||
      /^2547\d{8}$/.test(digits) ||
      /^2541\d{8}$/.test(digits)
    );
  }

  function normalizePhone(p: string) {
    const d = p.replace(/[^\d]/g, "");
    if (d.startsWith("254") && d.length === 12) return d;
    if ((d.startsWith("07") || d.startsWith("01")) && d.length === 10) {
      return "254" + d.slice(1);
    }
    return d; // fallback
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled) return;

    try {
      setSaving(true);
      const phone = normalizePhone(form.phone);

      const created = await api.orders.create({
        name: form.name.trim(),
        phone,
        address: form.address.trim(),
        items: items.map((it) => ({
          title: it.title,
          qty: it.qty,
          price_cents: it.price_cents,
          image: it.image,
        })),
        payment: {
          status: "Pending",
          phone: form.usePhoneForSTK ? phone : undefined,
        },
      });

      d(clear());
      toast.success("Order placed. Check your phone for STK push.");
      nav(`/order/success/${created.id}`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to place order. Try again.");
    } finally {
      setSaving(false);
    }
  };

  if (items.length === 0) {
    return (
      <Container className="py-12">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Cart" }, { label: "Checkout" }]} />
        <div className="mt-8 text-center">
          <h1 className="text-xl font-semibold">Your cart is empty</h1>
          <p className="mt-1 text-gray-600">Add some items before checking out.</p>
          <Link to="/shop" className="mt-4 inline-flex btn-primary rounded-xl px-5 py-2.5">
            Go to Shop
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-10">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Cart", href: "/cart" },
          { label: "Checkout" },
        ]}
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Form */}
        <form id={FORM_ID} onSubmit={onSubmit} className="lg:col-span-2 space-y-4 relative">
          {/* subtle loading overlay */}
          {saving && (
            <div className="absolute inset-0 z-10 rounded-2xl bg-white/60 backdrop-blur-sm flex items-center justify-center">
              <div className="inline-flex items-center gap-2 text-sm text-gray-700">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" className="opacity-20" />
                  <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" className="opacity-80" />
                </svg>
                Processing…
              </div>
            </div>
          )}

          <div className="card-soft p-5 space-y-3">
            <div className="font-semibold">Contact & Delivery</div>
            <input
              className="input"
              placeholder="Full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <div className="grid md:grid-cols-2 gap-3">
              <input
                className="input"
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
              <input
                className={`input ${form.phone && !validPhone(form.phone) ? "ring-1 ring-red-400" : ""}`}
                placeholder="Phone for delivery / M-Pesa"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
              />
            </div>
            <textarea
              className="input min-h-[90px]"
              placeholder="Delivery address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              required
            />
            <textarea
              className="input min-h-[72px]"
              placeholder="Order notes (optional)"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          <div className="card-soft p-5 space-y-4">
            <div className="font-semibold">Payment</div>

            <div className="pill-mpesa">
              <Smartphone className="h-4 w-4 text-mpesa" />
              <span>M-Pesa Till — secure STK push after you place order</span>
            </div>

            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300"
                checked={form.usePhoneForSTK}
                onChange={(e) => setForm({ ...form, usePhoneForSTK: e.target.checked })}
              />
              Use this phone number for the M-Pesa prompt
            </label>

            <button
              type="submit"
              disabled={disabled}
              className={`btn-mpesa w-full rounded-xl py-3 ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              {saving ? "Placing Order…" : "Place Order & Pay"}
            </button>

            <div className="text-xs text-gray-500">
              You’ll receive an STK push on your phone to confirm payment. Shipping is calculated at dispatch.
            </div>
          </div>
        </form>

        {/* Summary */}
        <div className="card-soft p-5 h-max">
          <div className="text-lg font-semibold mb-2">Order Summary</div>
          <ul className="text-sm text-gray-700 space-y-1 mb-3">
            {items.map((it) => (
              <li key={it.id} className="flex justify-between">
                <span className="truncate pr-3">
                  {it.title} × {it.qty}
                </span>
                <span>{toKSh(it.qty * it.price_cents)}</span>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between font-semibold">
            <span>Total</span>
            <span>{toKSh(total_cents)}</span>
          </div>
          <div className="mt-2 text-xs text-gray-500">Shipping calculated at dispatch.</div>

          <Link to="/cart" className="mt-4 inline-flex text-sm text-brand underline">
            Edit cart
          </Link>
        </div>
      </div>

      {/* Mobile sticky pay bar */}
      <div className="md:hidden fixed inset-x-0 bottom-0 z-30 border-t bg-white/90 backdrop-blur">
        <Container className="py-3 flex items-center justify-between gap-3">
          <div className="text-sm">
            Total <span className="font-semibold">{toKSh(total_cents)}</span>
          </div>
          <button
            form={FORM_ID}
            type="submit"
            disabled={disabled}
            className={`btn-mpesa rounded-xl px-4 py-2 ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            {saving ? "…" : "Pay with M-Pesa"}
          </button>
        </Container>
      </div>
      <div className="h-16 md:hidden" />
    </Container>
  );
}
