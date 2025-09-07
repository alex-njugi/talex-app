import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "./_AdminLayout";
import { api, Product } from "@/lib/api";
import { toKSh } from "@/utils/currency";
import toast from "react-hot-toast";

export default function AdminProducts() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Product[]>([]);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<"all" | "car" | "tools">("all");
  const [status, setStatus] = useState<"all" | "active" | "out">("all");

  const load = async () => {
    setLoading(true);
    await api.seedIfEmpty();
    const list = await api.products.list();
    setItems(list);
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    let arr = [...items];
    if (q) {
      const t = q.toLowerCase();
      arr = arr.filter(
        (p) =>
          p.title.toLowerCase().includes(t) ||
          p.brand.toLowerCase().includes(t) ||
          p.sku.toLowerCase().includes(t)
      );
    }
    if (category !== "all") arr = arr.filter((p) => p.category_id === category);
    if (status === "active") arr = arr.filter((p) => p.is_active);
    if (status === "out") arr = arr.filter((p) => p.stock <= 0);
    return arr;
  }, [items, q, category, status]);

  const onDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await api.products.remove(id);
    toast.success("Product deleted");
    load();
  };

  return (
    <AdminLayout
      title="Products"
      subtitle="Manage catalog, pricing and stock"
      actions={
        <Link to="/admin/products/new" className="btn-primary rounded-xl px-4 py-2 hidden sm:inline-flex">
          New Product
        </Link>
      }
    >
      {/* Toolbar */}
      <section className="mx-auto w-full max-w-screen-2xl px-4 lg:px-6 overflow-x-hidden">
        <div className="rounded-2xl border bg-white/80 backdrop-blur p-4 shadow-soft">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative min-w-[240px] flex-1">
              <input
                className="input w-full pl-10"
                placeholder="Search title, brand, or SKU"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>

            {/* Desktop selects */}
            <div className="hidden lg:flex items-center gap-3">
              <select
                className="input w-48"
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
              >
                <option value="all">All categories</option>
                <option value="car">Car accessories</option>
                <option value="tools">Power-line tools</option>
              </select>
              <select
                className="input w-40"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
              >
                <option value="all">All status</option>
                <option value="active">Active</option>
                <option value="out">Out of stock</option>
              </select>
            </div>
          </div>

          {/* Mobile wrap-safe filter pills */}
          <div className="mt-3 lg:hidden">
            <div className="flex flex-wrap gap-2">
              <FilterPill
                label="All"
                active={category === "all"}
                onClick={() => setCategory("all")}
              />
              <FilterPill
                label="Car accessories"
                active={category === "car"}
                onClick={() => setCategory("car")}
              />
              <FilterPill
                label="Power-line tools"
                active={category === "tools"}
                onClick={() => setCategory("tools")}
              />
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <FilterPill
                label="All status"
                active={status === "all"}
                onClick={() => setStatus("all")}
              />
              <FilterPill
                label="Active"
                active={status === "active"}
                onClick={() => setStatus("active")}
              />
              <FilterPill
                label="Out of stock"
                active={status === "out"}
                onClick={() => setStatus("out")}
              />
            </div>
          </div>
        </div>

        {/* MOBILE: cards (no horizontal scroll) */}
        <div className="lg:hidden mt-4 space-y-3">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
          ) : filtered.length === 0 ? (
            <EmptyState onReset={() => { setQ(""); setCategory("all"); setStatus("all"); }} />
          ) : (
            filtered.map((p) => (
              <ProductCard key={p.id} p={p} onDelete={onDelete} />
            ))
          )}
        </div>

        {/* DESKTOP: clean table (no overflow-x) */}
        <div className="hidden lg:block mt-5">
          <div className="rounded-2xl border bg-white/90 backdrop-blur shadow-soft overflow-visible">
            <table className="table-auto w-full text-sm leading-6 divide-y divide-gray-100">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <Th>Product</Th>
                  <Th>Brand</Th>
                  <Th>Category</Th>
                  <Th className="text-right">Price</Th>
                  <Th className="text-center">Stock</Th>
                  <Th className="text-center">Status</Th>
                  <Th className="text-right pr-4">Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <Td colSpan={7}>
                        <div className="h-9 rounded-xl bg-gray-100" />
                      </Td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <Td colSpan={7} className="text-center text-gray-600 py-10">
                      No products found.
                    </Td>
                  </tr>
                ) : (
                  filtered.map((p) => (
                    <tr key={p.id} className="odd:bg-white even:bg-gray-50/60 hover:bg-gray-50 transition-colors">
                      <Td>
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={p.images?.[0]?.url || "https://picsum.photos/seed/placeholder/80/80"}
                            className="h-12 w-12 rounded-xl object-cover border shrink-0"
                            alt=""
                            loading="lazy"
                          />
                          <div className="min-w-0">
                            <div className="font-medium truncate">{p.title}</div>
                            <div className="text-xs text-gray-500 truncate">{p.sku}</div>
                          </div>
                        </div>
                      </Td>
                      <Td className="truncate">{p.brand}</Td>
                      <Td className="capitalize">{p.category_id === "car" ? "Car accessories" : "Power-line tools"}</Td>
                      <Td className="text-right font-semibold whitespace-nowrap">{toKSh(p.price_cents)}</Td>
                      <Td className="text-center">{p.stock}</Td>
                      <Td className="text-center">
                        <span className={`badge ${p.is_active ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" : "bg-gray-100 text-gray-700 ring-1 ring-gray-200"}`}>
                          {p.is_active ? "Active" : "Hidden"}
                        </span>
                      </Td>
                      <Td className="text-right">
                        <div className="flex items-center justify-end gap-2 pr-1">
                          <Link to={`/admin/products/${p.id}/edit`} className="btn-outline rounded-xl px-3 py-1.5">Edit</Link>
                          <button onClick={() => onDelete(p.id)} className="btn rounded-xl px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100">
                            Delete
                          </button>
                        </div>
                      </Td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile FAB for quick "New Product" */}
        <Link
          to="/admin/products/new"
          className="lg:hidden fixed bottom-5 right-5 z-20 rounded-full shadow-soft border bg-gray-900 text-white px-4 py-3 flex items-center gap-2 active:scale-[.98]"
        >
          <PlusIcon className="h-5 w-5" /> New
        </Link>
      </section>
    </AdminLayout>
  );
}

/* ---------- Small mobile-friendly pieces ---------- */

function ProductCard({ p, onDelete }: { p: Product; onDelete: (id: string) => void }) {
  return (
    <div className="group relative w-full max-w-full overflow-hidden rounded-2xl border bg-white/90 backdrop-blur p-4 shadow-soft">
      <div className="flex items-start gap-3">
        <img
          src={p.images?.[0]?.url || "https://picsum.photos/seed/placeholder/200/200"}
          className="h-16 w-16 rounded-xl object-cover border shrink-0"
          alt=""
          loading="lazy"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="font-semibold tracking-tight truncate">{p.title}</div>
              <div className="text-xs text-gray-500 truncate">{p.brand} • {p.sku}</div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-xs text-gray-500">Price</div>
              <div className="font-semibold whitespace-nowrap">{toKSh(p.price_cents)}</div>
            </div>
          </div>

          <div className="mt-2 flex items-center gap-2 text-sm">
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-700 capitalize">
              {p.category_id === "car" ? "Car accessories" : "Power-line tools"}
            </span>
            <span className={`rounded-full px-2 py-0.5 text-xs ring-1 ${p.is_active ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-gray-100 text-gray-700 ring-gray-200"}`}>
              {p.is_active ? "Active" : "Hidden"}
            </span>
            <span className={`rounded-full px-2 py-0.5 text-xs ${p.stock > 0 ? "bg-gray-100 text-gray-700" : "bg-rose-50 text-rose-700"}`}>
              Stock: {p.stock}
            </span>
          </div>

          <div className="mt-3 flex items-center justify-end gap-2">
            <Link to={`/admin/products/${p.id}/edit`} className="btn-outline rounded-xl px-3 py-1.5">Edit</Link>
            <button
              onClick={() => onDelete(p.id)}
              className="btn rounded-xl px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`select-none rounded-full px-3 py-1 text-sm ring-1 transition
        ${active ? "bg-gray-900 text-white ring-gray-900" : "bg-white text-gray-700 ring-gray-300 hover:bg-gray-50"}`}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}

/* ---------- Table cells ---------- */
const Th = ({ children, className = "" }: any) => (
  <th className={`text-left px-4 py-3 font-semibold ${className}`}>{children}</th>
);
const Td = ({ children, className = "", colSpan }: any) => (
  <td className={`px-4 py-3 align-middle ${className}`} colSpan={colSpan}>
    {children}
  </td>
);

/* ---------- Icons ---------- */
function SearchIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path d="M15.5 15.5 20 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="10.5" cy="10.5" r="6" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  );
}
function PlusIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/* ---------- Skeleton / Empty ---------- */
function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border bg-white/70 p-4 w-full overflow-hidden">
      <div className="h-4 w-40 rounded bg-gray-200" />
      <div className="mt-2 h-3 w-48 rounded bg-gray-200" />
      <div className="mt-3 h-8 rounded-xl bg-gray-200" />
    </div>
  );
}
function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="rounded-2xl border bg-white/70 p-10 text-center w-full overflow-hidden">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
        <SearchIcon className="h-6 w-6 text-gray-400" />
      </div>
      <div className="font-semibold">No products found</div>
      <p className="mt-1 text-sm text-gray-600">Try another search or clear your filters.</p>
      <button onClick={onReset} className="mt-4 btn-outline rounded-xl px-4 py-2">Reset filters</button>
    </div>
  );
}
