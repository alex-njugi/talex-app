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
        <Link to="/admin/products/new" className="btn-primary rounded-xl px-4 py-2">New Product</Link>
      }
    >
      {/* Filters */}
      <div className="rounded-2xl border bg-white/70 backdrop-blur p-4 shadow-soft">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <input
            className="input sm:w-64"
            placeholder="Search title, brand, or SKU"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <div className="flex flex-wrap items-center gap-3">
            <select
              className="input w-40"
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
      </div>

      {/* Table */}
      <div className="rounded-2xl border bg-white/70 backdrop-blur shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
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
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <Td colSpan={7}>
                      <div className="h-8 rounded-xl bg-gray-100" />
                    </Td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <Td colSpan={7} className="text-center text-gray-600 py-8">
                    No products found.
                  </Td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="border-t hover:bg-gray-50/60">
                    <Td>
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images?.[0]?.url || "https://picsum.photos/seed/placeholder/80/80"}
                          className="h-12 w-12 rounded-xl object-cover border"
                        />
                        <div>
                          <div className="font-medium">{p.title}</div>
                          <div className="text-xs text-gray-500">{p.sku}</div>
                        </div>
                      </div>
                    </Td>
                    <Td>{p.brand}</Td>
                    <Td className="capitalize">{p.category_id === "car" ? "Car accessories" : "Power-line tools"}</Td>
                    <Td className="text-right font-semibold">{toKSh(p.price_cents)}</Td>
                    <Td className="text-center">{p.stock}</Td>
                    <Td className="text-center">
                      <span className={`badge ${p.is_active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                        {p.is_active ? "Active" : "Hidden"}
                      </span>
                    </Td>
                    <Td className="text-right">
                      <div className="flex items-center justify-end gap-2 pr-1">
                        <Link to={`/admin/products/${p.id}/edit`} className="btn-outline rounded-xl px-3 py-1.5">Edit</Link>
                        <button onClick={() => onDelete(p.id)} className="btn rounded-xl px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100">
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
    </AdminLayout>
  );
}

const Th = ({ children, className = "" }: any) => (
  <th className={`text-left px-4 py-3 font-semibold ${className}`}>{children}</th>
);
const Td = ({ children, className = "", colSpan }: any) => (
  <td className={`px-4 py-3 align-middle ${className}`} colSpan={colSpan}>
    {children}
  </td>
);
