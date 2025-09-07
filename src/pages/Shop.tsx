// src/pages/Shop.tsx
import Container from "@/components/layout/Container";
import Section from "@/components/ui/Section";
import ProductCard from "@/components/product/ProductCard";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { useAppSelector } from "@/store";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { MagnifyingGlass, XCircle } from "phosphor-react";

type CategoryVal = "all" | "car" | "tools";

const fromSlug = (s: string | null): CategoryVal => {
  if (s === "car" || s === "car-accessories") return "car";
  if (s === "tools" || s === "power-tools") return "tools";
  return "all";
};
const toSlug = (c: CategoryVal) =>
  c === "car" ? "car-accessories" : c === "tools" ? "power-tools" : "";

export default function Shop() {
  const all = useAppSelector((s) => s.product.products);
  const [params, setParams] = useSearchParams();

  const qParam = (params.get("search") || "").trim();
  const [term, setTerm] = useState(qParam);
  const [category, setCategory] = useState<CategoryVal>(fromSlug(params.get("category")));
  const [sort, setSort] = useState(params.get("sort") || "pop");

  // Keep local search box in sync if user navigates via back/forward/share link
  useEffect(() => setTerm(qParam), [qParam]);

  // Stable "popularity"/"newest" using insertion order
  const orderIndex = useMemo(() => new Map(all.map((p, i) => [p.id, i])), [all]);

  const items = useMemo(() => {
    let arr = all.filter((p) => p.is_active);

    // category filter
    if (category !== "all") arr = arr.filter((p) => p.category_id === category);

    // text search (title or brand)
    if (term) {
      const t = term.toLowerCase();
      arr = arr.filter(
        (p) =>
          p.title.toLowerCase().includes(t) ||
          p.brand.toLowerCase().includes(t)
      );
    }

    // sort
    switch (sort) {
      case "new":
        arr = [...arr].sort(
          (a, b) => (orderIndex.get(b.id) ?? 0) - (orderIndex.get(a.id) ?? 0)
        );
        break;
      case "price-asc":
        arr = [...arr].sort((a, b) => a.price_cents - b.price_cents);
        break;
      case "price-desc":
        arr = [...arr].sort((a, b) => b.price_cents - a.price_cents);
        break;
      default:
        // popularity → keep insertion order (lower index first)
        arr = [...arr].sort(
          (a, b) => (orderIndex.get(a.id) ?? 0) - (orderIndex.get(b.id) ?? 0)
        );
    }
    return arr;
  }, [all, term, sort, category, orderIndex]);

  const update = (k: string, v: string) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v);
    else next.delete(k);
    setParams(next, { replace: true });
  };

  const setCategoryAndQuery = (c: CategoryVal) => {
    setCategory(c);
    update("category", toSlug(c));
  };

  const onSubmitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    update("search", term);
  };

  const clearSearch = () => {
    setTerm("");
    update("search", "");
  };

  const totalActive = useMemo(() => all.filter((p) => p.is_active).length, [all]);

  return (
    <Container className="py-10">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Shop" }]} />

      {/* Premium controls: search + category + sort */}
      <div className="mt-4">
        <div className="card-soft p-4 sm:p-5">
          {/* Top row: title + result count */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-bold">All Products</h1>
            <div className="text-sm text-gray-600">
              Showing <span className="font-semibold">{items.length}</span> of{" "}
              <span className="font-semibold">{totalActive}</span> items
            </div>
          </div>

          {/* Middle row: search input */}
          <form
            role="search"
            onSubmit={onSubmitSearch}
            className="mt-4 flex items-center gap-2 rounded-xl border bg-white/70 px-3 py-2"
          >
            <MagnifyingGlass size={18} className="text-gray-500" />
            <input
              id="shop-search-input"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search products (e.g. wiper, cover, grinder)"
              className="flex-1 bg-transparent outline-none"
              aria-label="Search products"
            />
            {term ? (
              <button
                type="button"
                onClick={clearSearch}
                className="inline-flex items-center text-gray-500 hover:text-gray-700"
                aria-label="Clear search"
                title="Clear search"
              >
                <XCircle size={18} />
              </button>
            ) : null}
            <button type="submit" className="btn-primary rounded-lg px-4 py-2 text-sm">
              Search
            </button>
          </form>

          {/* Bottom row: category segment + sort */}
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Category segmented control */}
            <div className="inline-flex rounded-xl border bg-white/70 overflow-hidden">
              <button
                onClick={() => setCategoryAndQuery("all")}
                className={`px-3 py-2 text-sm ${
                  category === "all"
                    ? "bg-brand text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setCategoryAndQuery("car")}
                className={`px-3 py-2 text-sm ${
                  category === "car"
                    ? "bg-brand text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Car Accessories
              </button>
              <button
                onClick={() => setCategoryAndQuery("tools")}
                className={`px-3 py-2 text-sm ${
                  category === "tools"
                    ? "bg-brand text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Power-line Tools
              </button>
            </div>

            {/* Sort */}
            <select
              className="input w-48"
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                update("sort", e.target.value);
              }}
              aria-label="Sort products"
            >
              <option value="pop">Popularity</option>
              <option value="new">Newest</option>
              <option value="price-asc">Price ↑</option>
              <option value="price-desc">Price ↓</option>
            </select>
          </div>

          {/* Active filters chips */}
          {(category !== "all" || term) && (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              {category !== "all" && (
                <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1">
                  Category:{" "}
                  <b>
                    {category === "car" ? "Car Accessories" : "Power-line Tools"}
                  </b>
                  <button
                    className="text-gray-500 hover:text-gray-700"
                    onClick={() => setCategoryAndQuery("all")}
                    aria-label="Clear category filter"
                    title="Clear"
                  >
                    <XCircle size={16} />
                  </button>
                </span>
              )}
              {term && (
                <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1">
                  Search: <b className="truncate max-w-[200px]">{term}</b>
                  <button
                    className="text-gray-500 hover:text-gray-700"
                    onClick={clearSearch}
                    aria-label="Clear search filter"
                    title="Clear"
                  >
                    <XCircle size={16} />
                  </button>
                </span>
              )}
              <button
                className="ml-auto text-gray-600 hover:text-gray-900 underline"
                onClick={() => {
                  setCategory("all");
                  setTerm("");
                  const next = new URLSearchParams(params);
                  next.delete("category");
                  next.delete("search");
                  setParams(next, { replace: true });
                }}
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <Section>
        {items.length === 0 ? (
          <div className="card-soft p-8 text-center text-gray-600">
            <div className="text-lg font-semibold mb-1">No products found</div>
            <div className="text-sm">
              Try a different search term or clear filters to see more items.
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        )}
      </Section>
    </Container>
  );
}
