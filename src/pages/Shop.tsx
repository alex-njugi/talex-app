import Container from "@/components/layout/Container";
import Section from "@/components/ui/Section";
import ProductCard from "@/components/product/ProductCard";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { useAppSelector } from "@/store";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

type CategoryVal = "all" | "car" | "tools";
const fromSlug = (s: string | null): CategoryVal => {
  if (s === "car" || s === "car-accessories") return "car";
  if (s === "tools" || s === "power-tools") return "tools";
  return "all";
};
const toSlug = (c: CategoryVal) => (c === "car" ? "car-accessories" : c === "tools" ? "power-tools" : "");

export default function Shop() {
  const all = useAppSelector((s) => s.product.products);
  const [params, setParams] = useSearchParams();

  const q = (params.get("search") || "").toLowerCase();
  const [category, setCategory] = useState<CategoryVal>(fromSlug(params.get("category")));
  const [sort, setSort] = useState(params.get("sort") || "pop");

  const orderIndex = useMemo(() => new Map(all.map((p, i) => [p.id, i])), [all]);

  const items = useMemo(() => {
    let arr = all.filter((p) => p.is_active);
    if (category !== "all") arr = arr.filter((p) => p.category_id === category);
    if (q) {
      const term = q.toLowerCase();
      arr = arr.filter((p) => p.title.toLowerCase().includes(term) || p.brand.toLowerCase().includes(term));
    }
    switch (sort) {
      case "new":
        arr = [...arr].sort((a, b) => (orderIndex.get(b.id) ?? 0) - (orderIndex.get(a.id) ?? 0)); break;
      case "price-asc":
        arr = [...arr].sort((a, b) => a.price_cents - b.price_cents); break;
      case "price-desc":
        arr = [...arr].sort((a, b) => b.price_cents - a.price_cents); break;
      default:
        arr = [...arr].sort((a, b) => (orderIndex.get(a.id) ?? 0) - (orderIndex.get(b.id) ?? 0));
    }
    return arr;
  }, [all, q, sort, category, orderIndex]);

  const update = (k: string, v: string) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v); else next.delete(k);
    setParams(next, { replace: true });
  };

  const setCategoryAndQuery = (c: CategoryVal) => {
    setCategory(c); update("category", toSlug(c));
  };

  return (
    <Container className="py-10">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Shop" }]} />

      <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h1 className="text-2xl font-bold">All Products</h1>
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-xl border bg-white/70 overflow-hidden">
            <button onClick={() => setCategoryAndQuery("all")} className={`px-3 py-2 text-sm ${category === "all" ? "bg-brand text-white" : "text-gray-700 hover:bg-gray-100"}`}>All</button>
            <button onClick={() => setCategoryAndQuery("car")} className={`px-3 py-2 text-sm ${category === "car" ? "bg-brand text-white" : "text-gray-700 hover:bg-gray-100"}`}>Car Accessories</button>
            <button onClick={() => setCategoryAndQuery("tools")} className={`px-3 py-2 text-sm ${category === "tools" ? "bg-brand text-white" : "text-gray-700 hover:bg-gray-100"}`}>Power-line Tools</button>
          </div>

          <select className="input w-44" value={sort} onChange={(e) => { setSort(e.target.value); update("sort", e.target.value); }}>
            <option value="pop">Popularity</option>
            <option value="new">Newest</option>
            <option value="price-asc">Price ↑</option>
            <option value="price-desc">Price ↓</option>
          </select>
        </div>
      </div>

      <Section>
        {items.length === 0 ? (
          <div className="text-gray-600">No products match your filters.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {items.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        )}
      </Section>
    </Container>
  );
}
