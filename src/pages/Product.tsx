import Container from "@/components/layout/Container";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import QtyInput from "@/components/ui/QtyInput";
import ProductGallery from "@/components/product/ProductGallery";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store";
import { add } from "@/store/slices/cartSlice";
import { toKSh } from "@/utils/currency";
import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export default function Product() {
  const { slug } = useParams();
  const d = useAppDispatch();
  const p = useAppSelector((s) => s.product.products.find((x) => x.slug === slug));
  const [qty, setQty] = useState(1);

  if (!p) return <Container className="py-16"><div className="text-gray-600">Product not found.</div></Container>;

  const img = p.images?.[0]?.url || "https://picsum.photos/seed/talex/800/600";

  return (
    <Container className="py-10">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Shop", href: "/shop" }, { label: p.title }]} />

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <ProductGallery images={p.images ?? [{ url: img }]} alt={p.title} />

        <div>
          <h1 className="text-2xl font-bold">{p.title}</h1>
          <div className="mt-2 text-gray-600">{p.brand}</div>
          <div className="mt-4 text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-dark">{toKSh(p.price_cents)}</div>

          <div className="mt-3 flex items-center gap-3">
            <span className="badge-mpesa">Pay via M-Pesa Till</span>
            <span className={`badge ${p.stock > 0 ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}>{p.stock > 0 ? "In stock" : "Out of stock"}</span>
          </div>

          <div className="mt-5 flex items-center gap-4">
            <QtyInput value={qty} onChange={setQty} />
            <button
              className="btn-primary px-6 py-3 rounded-xl"
              disabled={p.stock <= 0}
              onClick={() => {
                d(add({ id: p.id, title: p.title, price_cents: p.price_cents, qty, image: img }));
                toast.success("Added to cart");
              }}
            >
              Add to Cart
            </button>
          </div>

          <div className="mt-8 grid gap-4">
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
              <div className="text-gray-700">Nairobi same-day (order before 3pm). Upcountry: 1–3 days via courier.</div>
            </div>

            <div className="card-soft p-4 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-mpesa" />
              <div className="text-sm text-gray-700">Secure checkout — M-Pesa Till (instant confirmation)</div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
