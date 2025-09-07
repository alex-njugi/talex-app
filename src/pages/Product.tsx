// src/pages/Product.tsx
import Container from "@/components/layout/Container";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import QtyInput from "@/components/ui/QtyInput";
import ProductGallery from "@/components/product/ProductGallery";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store";
import { add } from "@/store/slices/cartSlice";
import { toKSh } from "@/utils/currency";
import { ShieldCheck, Truck, Share2, Copy, Check, Package } from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

export default function Product() {
  const { slug } = useParams();
  const nav = useNavigate();
  const d = useAppDispatch();

  const p = useAppSelector((s) => s.product.products.find((x) => x.slug === slug));
  const [qty, setQty] = useState(1);
  const [copied, setCopied] = useState(false);

  if (!p) {
    return (
      <Container className="py-16">
        <div className="text-gray-600">Product not found.</div>
      </Container>
    );
  }

  const img = p.images?.[0]?.url || "https://picsum.photos/seed/talex/800/600";
  const inStock = p.stock > 0;
  const lowStock = p.stock > 0 && p.stock <= 3;

  const price = useMemo(() => toKSh(p.price_cents), [p.price_cents]);

  const onAdd = () => {
    d(add({ id: p.id, title: p.title, price_cents: p.price_cents, qty, image: img }));
    toast.success("Added to cart");
  };

  const onBuyNow = () => {
    onAdd();
    nav("/checkout");
  };

  const shareProduct = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: p.title,
          text: `${p.title} — ${price}`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied");
      }
    } catch {
      /* user cancelled */
    }
  };

  const copySku = async () => {
    try {
      await navigator.clipboard.writeText(p.sku);
      setCopied(true);
      toast.success("SKU copied");
      setTimeout(() => setCopied(false), 1000);
    } catch {
      toast.error("Couldn’t copy");
    }
  };

  return (
    <section className="relative">
      {/* Ambient soft backdrop */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_40%_at_50%_-10%,rgba(16,185,129,0.08),transparent),radial-gradient(40%_35%_at_10%_90%,rgba(59,130,246,0.08),transparent)]" />

      <Container className="relative pt-6 pb-24 md:pt-10 md:pb-12">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Shop", href: "/shop" },
            { label: p.title },
          ]}
        />

        <div className="mt-6 grid gap-8 lg:grid-cols-2">
          {/* Gallery */}
          <ProductGallery images={p.images ?? [{ url: img }]} alt={p.title} />

          {/* Details */}
          <div>
            {/* Title / brand */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold leading-tight">{p.title}</h1>
                <div className="mt-1 text-gray-600">{p.brand}</div>
              </div>

              {/* Quick actions */}
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={shareProduct}
                  className="rounded-xl border bg-white/70 px-3.5 py-2 hover:bg-white"
                  aria-label="Share"
                >
                  <Share2 className="h-4.5 w-4.5" />
                </button>
                <button
                  onClick={copySku}
                  className="rounded-xl border bg-white/70 px-3.5 py-2 hover:bg-white inline-flex items-center gap-1.5"
                  aria-label="Copy SKU"
                  title={`SKU: ${p.sku}`}
                >
                  {copied ? <Check className="h-4.5 w-4.5 text-emerald-600" /> : <Copy className="h-4.5 w-4.5" />}
                  <span className="text-xs">SKU</span>
                </button>
              </div>
            </div>

            {/* Price */}
            <div className="mt-3 text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-dark">
              {price}
            </div>

            {/* Badges */}
            <div className="mt-3 flex flex-wrap items-center gap-2.5">
              <span className="badge-mpesa">Pay via M-Pesa Till</span>
              <span
                className={`badge ${inStock ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}
              >
                {inStock ? "In stock" : "Out of stock"}
              </span>
              {lowStock && (
                <span
                  className="badge bg-amber-50 text-amber-700"
                  aria-live="polite"
                >
                  Only {p.stock} left
                </span>
              )}
            </div>

            {/* Controls */}
            <div className="mt-5 flex flex-wrap items-center gap-4">
              <QtyInput value={qty} onChange={setQty} />
              <button
                className="btn-primary px-6 py-3 rounded-xl"
                disabled={!inStock}
                onClick={onAdd}
              >
                Add to Cart
              </button>
              <button
                className="btn-outline px-6 py-3 rounded-xl"
                disabled={!inStock}
                onClick={onBuyNow}
              >
                Buy Now
              </button>
            </div>

            {/* Meta row (mobile quick actions) */}
            <div className="mt-4 flex sm:hidden items-center gap-2">
              <button
                onClick={shareProduct}
                className="rounded-xl border bg-white/70 px-3 py-2 hover:bg-white text-sm inline-flex items-center gap-1.5"
              >
                <Share2 className="h-4 w-4" /> Share
              </button>
              <button
                onClick={copySku}
                className="rounded-xl border bg-white/70 px-3 py-2 hover:bg-white text-sm inline-flex items-center gap-1.5"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />} SKU
              </button>
            </div>

            {/* Info cards */}
            <div className="mt-7 grid gap-4">
              <div className="card-soft p-4">
                <div className="font-semibold mb-1">Overview</div>
                <ul className="list-disc pl-5 text-gray-700 space-y-1">
                  <li>Genuine quality sourced by Talex.</li>
                  <li>Easy to install; fits most vehicles.</li>
                  <li>7-day simple returns (unused).</li>
                </ul>
              </div>

              <div className="card-soft p-4">
                <div className="font-semibold mb-1">Delivery & returns</div>
                <div className="text-gray-700">
                  Nairobi same-day (order before 3pm). Upcountry: 1–3 days via courier. 7-day returns on unused items.
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="card-soft p-4 flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-mpesa shrink-0" />
                  <div className="text-sm text-gray-700">
                    Secure checkout — M-Pesa Till (instant confirmation)
                  </div>
                </div>
                <div className="card-soft p-4 flex items-start gap-3">
                  <Truck className="h-5 w-5 text-brand shrink-0" />
                  <div className="text-sm text-gray-700">Same-day Nairobi, 1–3 days upcountry</div>
                </div>
                <div className="card-soft p-4 flex items-start gap-3">
                  <Package className="h-5 w-5 text-sky-600 shrink-0" />
                  <div className="text-sm text-gray-700">7-day returns (unused)</div>
                </div>
              </div>

              {/* Extra meta */}
              <div className="text-xs text-gray-500">
                SKU: <span className="font-medium">{p.sku}</span> • Category:{" "}
                <span className="font-medium">
                  {p.category_id === "car" ? "Car accessories" : "Power-line tools"}
                </span>
              </div>

              {/* Helpful link */}
              <div className="text-sm">
                <Link to="/track-order" className="text-brand hover:underline">
                  Track your order
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* Sticky mobile add bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/70 md:hidden">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-3">
          <div>
            <div className="text-xs text-gray-500">Total</div>
            <div className="text-lg font-bold">{toKSh(p.price_cents * qty)}</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={shareProduct}
              className="rounded-xl border bg-white px-3 py-2"
              aria-label="Share"
            >
              <Share2 className="h-4.5 w-4.5" />
            </button>
            <button
              disabled={!inStock}
              onClick={onAdd}
              className="btn-primary rounded-xl px-5 py-3 disabled:opacity-60"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
