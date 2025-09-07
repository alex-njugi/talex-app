// src/pages/Shop.tsx
import Container from "@/components/layout/Container";
import Section from "@/components/ui/Section";
import ProductCard from "@/components/product/ProductCard";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { useAppSelector } from "@/store";
import { toKSh } from "@/utils/currency";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  MagnifyingGlass,
  XCircle,
  FunnelSimple,
  SlidersHorizontal,
  CheckCircle,
} from "phosphor-react";

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

  // URL → state
  const qParam = (params.get("search") || "").trim();
  const [term, setTerm] = useState(qParam);
  const [category, setCategory] = useState<CategoryVal>(fromSlug(params.get("category")));
  const [sort, setSort] = useState(params.get("sort") || "pop");
  const [inStockOnly, setInStockOnly] = useState(params.get("instock") === "1");

  // Derived price range from active catalog
  const allActive = useMemo(() => all.filter((p) => p.is_active), [all]);
  const priceBounds = useMemo(() => {
    if (allActive.length === 0) return { min: 0, max: 0 };
    const cents = allActive.map((p) => p.price_cents);
    return { min: Math.min(...cents), max: Math.max(...cents) };
  }, [allActive]);

  // Price filter state (in cents); initialize from query if provided
  const qMin = Number(params.get("min") || NaN);
  const qMax = Number(params.get("max") || NaN);
  const [minCents, setMinCents] = useState<number>(!isNaN(qMin) ? qMin : priceBounds.min);
  const [maxCents, setMaxCents] = useState<number>(!isNaN(qMax) ? qMax : priceBounds.max);

  // Keep local search box in sync with URL changes (e.g., back/forward)
  useEffect(() => setTerm(qParam), [qParam]);

  // If catalog bounds change (first load / refresh), gently clamp sliders
  useEffect(() => {
    setMinCents((v) => (priceBounds.min ? Math.max(priceBounds.min, v) : v));
    setMaxCents((v) => (priceBounds.max ? Math.min(priceBounds.max, v) : v));
  }, [priceBounds.min, priceBounds.max]);

  // Debounced search → URL
  useEffect(() => {
    const t = setTimeout(() => {
      if ((params.get("search") || "") !== term) {
        update("search", term);
      }
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term]);

  // “/” focuses search
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (e.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Stable "popularity"/"newest" using insertion order
  const orderIndex = useMemo(() => new Map(all.map((p, i) => [p.id, i])), [all]);

  const items = useMemo(() => {
    let arr = allActive;

    // category
    if (category !== "all") arr = arr.filter((p) => p.category_id === category);

    // stock
    if (inStockOnly) arr = arr.filter((p) => p.stock > 0);

    // price
    arr = arr.filter((p) => p.price_cents >= minCents && p.price_cents <= maxCents);

    // text search
    if (term) {
      const t = term.toLowerCase();
      arr = arr.filter(
        (p) => p.title.toLowerCase().includes(t) || p.brand.toLowerCase().includes(t)
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
        // "popularity": keep insertion order (lower index first)
        arr = [...arr].sort(
          (a, b) => (orderIndex.get(a.id) ?? 0) - (orderIndex.get(b.id) ?? 0)
        );
    }
    return arr;
  }, [allActive, term, sort, category, orderIndex, minCents, maxCents, inStockOnly]);

  const update = (k: string, v: string | number | boolean) => {
    const next = new URLSearchParams(params);
    const sv = String(v);
    if (sv && sv !== "all" && sv !== "false") next.set(k, sv);
    else next.delete(k);
    setParams(next, { replace: true });
  };

  const setCategoryAndQuery = (c: CategoryVal) => {
    setCategory(c);
    update("category", toSlug(c));
  };

  const clearSearch = () => {
    setTerm("");
    update("search", "");
  };

  const totalActive = allActive.length;

  // Mobile Filters sheet
  const [openFilters, setOpenFilters] = useState(false);
  const activeCount =
    (category !== "all" ? 1 : 0) +
    (term ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (minCents > priceBounds.min || maxCents < priceBounds.max ? 1 : 0);

  const resetAll = () => {
    setCategory("all");
    setInStockOnly(false);
    setTerm("");
    setMinCents(priceBounds.min);
    setMaxCents(priceBounds.max);
    const next = new URLSearchParams(params);
    ["category", "search", "sort", "instock", "min", "max"].forEach((k) => next.delete(k));
    setParams(next, { replace: true });
  };

  const applyPriceMin = (v: number) => {
    const clamped = Math.min(Math.max(v, priceBounds.min), maxCents);
    setMinCents(clamped);
    update("min", clamped);
  };
  const applyPriceMax = (v: number) => {
    const clamped = Math.max(Math.min(v, priceBounds.max), minCents);
    setMaxCents(clamped);
    update("max", clamped);
  };

  const currencyStep = 100 * 50; // KSh 50 steps (in cents)

  return (
    <Container className="pt-6 pb-24 md:pt-10 md:pb-12">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Shop" }]} />

      {/* Header + Desktop Controls */}
      <div className="mt-4 hidden md:block">
        <div className="card-soft p-5">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-2xl font-bold">All Products</h1>
            <div className="text-sm text-gray-600">
              Showing <span className="font-semibold">{items.length}</span> of{" "}
              <span className="font-semibold">{totalActive}</span>
            </div>
          </div>

          {/* Search */}
          <div className="mt-4 flex items-center gap-3">
            <form role="search" className="flex-1 flex items-center gap-2 rounded-xl border bg-white/70 px-3 py-2">
              <MagnifyingGlass size={18} className="text-gray-500" />
              <input
                ref={inputRef}
                id="shop-search-input"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Search products (e.g. wiper, cover, grinder)"
                className="flex-1 bg-transparent outline-none"
                aria-label="Search products"
              />
              {term && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="inline-flex items-center text-gray-500 hover:text-gray-700"
                  aria-label="Clear search"
                  title="Clear search"
                >
                  <XCircle size={18} />
                </button>
              )}
            </form>

            {/* Category segmented */}
            <div className="inline-flex rounded-xl border bg-white/70 overflow-hidden">
              <button
                onClick={() => setCategoryAndQuery("all")}
                className={`px-3 py-2 text-sm ${category === "all" ? "bg-brand text-white" : "text-gray-700 hover:bg-gray-100"}`}
              >
                All
              </button>
              <button
                onClick={() => setCategoryAndQuery("car")}
                className={`px-3 py-2 text-sm ${category === "car" ? "bg-brand text-white" : "text-gray-700 hover:bg-gray-100"}`}
              >
                Car Accessories
              </button>
              <button
                onClick={() => setCategoryAndQuery("tools")}
                className={`px-3 py-2 text-sm ${category === "tools" ? "bg-brand text-white" : "text-gray-700 hover:bg-gray-100"}`}
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

          {/* Filter row (price + stock) */}
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Price slider (dual) */}
            <div className="card-soft p-4">
              <div className="text-sm font-semibold mb-2">Price range</div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={priceBounds.min}
                  max={priceBounds.max}
                  step={currencyStep}
                  value={minCents}
                  onChange={(e) => applyPriceMin(Number(e.target.value))}
                  className="w-full"
                />
                <input
                  type="range"
                  min={priceBounds.min}
                  max={priceBounds.max}
                  step={currencyStep}
                  value={maxCents}
                  onChange={(e) => applyPriceMax(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-sm text-gray-700">
                <span>{toKSh(minCents)}</span>
                <span>—</span>
                <span>{toKSh(maxCents)}</span>
              </div>
            </div>

            {/* Stock toggle */}
            <div className="card-soft p-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Availability</div>
                <div className="text-xs text-gray-600">Show only items in stock</div>
              </div>
              <button
                onClick={() => {
                  const next = !inStockOnly;
                  setInStockOnly(next);
                  update("instock", next ? "1" : "");
                }}
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm border ${
                  inStockOnly ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-white/70 text-gray-700"
                }`}
                aria-pressed={inStockOnly}
              >
                <CheckCircle className={`h-4 w-4 ${inStockOnly ? "text-emerald-600" : "text-gray-400"}`} />
                In stock
              </button>
            </div>

            {/* Active chips */}
            <div className="card-soft p-4">
              <div className="text-sm font-semibold mb-2">Active filters</div>
              <div className="flex flex-wrap gap-2">
                {category !== "all" && (
                  <Chip onClear={() => setCategoryAndQuery("all")}>
                    Category: {category === "car" ? "Car Accessories" : "Power-line Tools"}
                  </Chip>
                )}
                {inStockOnly && <Chip onClear={() => { setInStockOnly(false); update("instock",""); }}>In stock</Chip>}
                {(minCents > priceBounds.min || maxCents < priceBounds.max) && (
                  <Chip onClear={() => { setMinCents(priceBounds.min); setMaxCents(priceBounds.max); update("min",""); update("max",""); }}>
                    {toKSh(minCents)} – {toKSh(maxCents)}
                  </Chip>
                )}
                {term && <Chip onClear={clearSearch}>“{term}”</Chip>}
                {(category !== "all" || inStockOnly || term || minCents > priceBounds.min || maxCents < priceBounds.max) && (
                  <button onClick={resetAll} className="text-sm text-gray-600 hover:text-gray-900 underline">
                    Clear all
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile toolbar */}
      <div className="mt-3 md:hidden sticky top-[56px] z-30">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOpenFilters(true)}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border bg-white/80 px-3 py-2"
          >
            <FunnelSimple size={18} />
            Filters{activeCount ? ` (${activeCount})` : ""}
          </button>
          <select
            className="input flex-1"
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
      </div>

      {/* Mobile search */}
      <div className="md:hidden mt-3">
        <form role="search" className="flex items-center gap-2 rounded-xl border bg-white/70 px-3 py-2">
          <MagnifyingGlass size={18} className="text-gray-500" />
          <input
            ref={inputRef}
            id="shop-search-input"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search products"
            className="flex-1 bg-transparent outline-none"
            aria-label="Search products"
          />
          {term && (
            <button
              type="button"
              onClick={clearSearch}
              className="inline-flex items-center text-gray-500 hover:text-gray-700"
              aria-label="Clear search"
              title="Clear search"
            >
              <XCircle size={18} />
            </button>
          )}
        </form>
        <div className="mt-2 text-xs text-gray-600">
          Showing <b>{items.length}</b> of <b>{totalActive}</b>
        </div>
      </div>

      {/* Results */}
      <Section>
        {all.length === 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-64 rounded-2xl border bg-white/60 animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="card-soft p-8 text-center text-gray-600">
            <div className="text-lg font-semibold mb-1">No products found</div>
            <div className="text-sm">Try a different search term or clear filters to see more items.</div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        )}
      </Section>

      {/* Mobile Filters Sheet */}
      {openFilters && (
        <div className="md:hidden fixed inset-0 z-40">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpenFilters(false)}
            aria-hidden="true"
          />
          {/* Panel */}
          <div className="absolute inset-x-0 bottom-0 rounded-t-2xl bg-white shadow-2xl">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="inline-flex items-center gap-2">
                <SlidersHorizontal size={18} />
                <span className="font-semibold">Filters</span>
              </div>
              <button
                onClick={() => resetAll()}
                className="text-sm text-gray-600 hover:text-gray-900 underline"
              >
                Reset
              </button>
            </div>

            <div className="p-4 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Category */}
              <div>
                <div className="text-sm font-semibold mb-2">Category</div>
                <div className="inline-flex rounded-xl border bg-white/70 overflow-hidden">
                  <button
                    onClick={() => setCategoryAndQuery("all")}
                    className={`px-3 py-2 text-sm ${category === "all" ? "bg-brand text-white" : "text-gray-700"}`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setCategoryAndQuery("car")}
                    className={`px-3 py-2 text-sm ${category === "car" ? "bg-brand text-white" : "text-gray-700"}`}
                  >
                    Car Accessories
                  </button>
                  <button
                    onClick={() => setCategoryAndQuery("tools")}
                    className={`px-3 py-2 text-sm ${category === "tools" ? "bg-brand text-white" : "text-gray-700"}`}
                  >
                    Power-line Tools
                  </button>
                </div>
              </div>

              {/* Price */}
              <div>
                <div className="text-sm font-semibold mb-2">Price range</div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={priceBounds.min}
                    max={priceBounds.max}
                    step={currencyStep}
                    value={minCents}
                    onChange={(e) => applyPriceMin(Number(e.target.value))}
                    className="w-full"
                  />
                  <input
                    type="range"
                    min={priceBounds.min}
                    max={priceBounds.max}
                    step={currencyStep}
                    value={maxCents}
                    onChange={(e) => applyPriceMax(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-sm text-gray-700">
                  <span>{toKSh(minCents)}</span>
                  <span>—</span>
                  <span>{toKSh(maxCents)}</span>
                </div>
              </div>

              {/* Stock */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">Availability</div>
                  <div className="text-xs text-gray-600">Show only items in stock</div>
                </div>
                <button
                  onClick={() => {
                    const next = !inStockOnly;
                    setInStockOnly(next);
                    update("instock", next ? "1" : "");
                  }}
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm border ${
                    inStockOnly ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-white/70 text-gray-700"
                  }`}
                  aria-pressed={inStockOnly}
                >
                  <CheckCircle className={`h-4 w-4 ${inStockOnly ? "text-emerald-600" : "text-gray-400"}`} />
                  In stock
                </button>
              </div>
            </div>

            <div className="p-4 border-t flex items-center gap-3">
              <button
                onClick={() => setOpenFilters(false)}
                className="btn-outline flex-1 rounded-xl py-3"
              >
                Close
              </button>
              <button
                onClick={() => setOpenFilters(false)}
                className="btn-primary flex-1 rounded-xl py-3"
              >
                Show results
              </button>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}

function Chip({
  children,
  onClear,
}: {
  children: React.ReactNode;
  onClear: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm">
      {children}
      <button
        className="text-gray-500 hover:text-gray-700"
        onClick={onClear}
        aria-label="Clear"
        title="Clear"
      >
        <XCircle size={16} />
      </button>
    </span>
  );
}
