import { Link } from "react-router-dom";
import { Product } from "@/lib/api";
import { toKSh } from "@/utils/currency";

export default function ProductCard({ p }: { p: Product }) {
  const img = p.images?.[0]?.url || "https://picsum.photos/seed/talex/600/400";
  return (
    <Link to={`/product/${p.slug}`} className="group relative rounded-2xl overflow-hidden border bg-white/70">
      <img src={img} alt={p.title} className="h-40 w-full object-cover transition group-hover:scale-[1.03]"/>
      <div className="p-3">
        <div className="font-semibold truncate">{p.title}</div>
        <div className="text-sm text-gray-600">{p.brand}</div>
        <div className="mt-1 text-brand font-bold">{toKSh(p.price_cents)}</div>
      </div>
    </Link>
  );
}
