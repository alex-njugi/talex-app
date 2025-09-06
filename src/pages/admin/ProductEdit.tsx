import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "./_AdminLayout";
import { api, Product } from "@/lib/api";
import toast from "react-hot-toast";

export default function AdminProductEdit() {
  const { id } = useParams();
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Product | null>(null);

  useEffect(() => {
    (async () => {
      const list = await api.products.list();
      const found = list.find((p) => p.id === id) || null;
      setForm(found);
      setLoading(false);
    })();
  }, [id]);

  const set = (k: keyof Product, v: any) =>
    setForm((s) => (s ? { ...s, [k]: v } : s));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    try {
      setSaving(true);
      await api.products.update(form.id, form);
      toast.success("Product updated");
      nav("/admin/products");
    } catch (e: any) {
      toast.error(e?.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Edit Product" subtitle="Loading...">
        <div className="h-40 rounded-2xl bg-gray-100 animate-pulse" />
      </AdminLayout>
    );
  }
  if (!form) {
    return (
      <AdminLayout title="Edit Product">
        <div className="text-gray-600">Product not found.</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Edit Product" subtitle={form.title}>
      <form onSubmit={save} className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-5">
          <div className="card-soft p-5 space-y-3">
            <div className="font-semibold">Basics</div>
            <input className="input" value={form.title} onChange={(e) => set("title", e.target.value)} />
            <div className="grid sm:grid-cols-3 gap-3">
              <input className="input" value={form.sku} onChange={(e) => set("sku", e.target.value)} />
              <input className="input" value={form.brand} onChange={(e) => set("brand", e.target.value)} />
              <select
                className="input"
                value={form.category_id}
                onChange={(e) => set("category_id", e.target.value as any)}
              >
                <option value="car">Car accessories</option>
                <option value="tools">Power-line tools</option>
              </select>
            </div>
          </div>

          <div className="card-soft p-5 space-y-3">
            <div className="font-semibold">Pricing & Stock</div>
            <div className="grid sm:grid-cols-3 gap-3">
              <input
                className="input"
                type="number"
                min={0}
                value={form.price_cents / 100}
                onChange={(e) => set("price_cents", Math.round(Number(e.target.value) * 100))}
              />
              <input
                className="input"
                type="number"
                min={0}
                value={form.stock}
                onChange={(e) => set("stock", Number(e.target.value))}
              />
              <select
                className="input"
                value={String(form.is_active)}
                onChange={(e) => set("is_active", e.target.value === "true")}
              >
                <option value="true">Active</option>
                <option value="false">Hidden</option>
              </select>
            </div>
          </div>

          <div className="card-soft p-5 space-y-3">
            <div className="font-semibold">Images</div>
            <div className="space-y-2">
              {(form.images ?? [{ url: "" }]).map((im, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    className="input flex-1"
                    value={im.url}
                    onChange={(e) => {
                      const next = [...(form.images ?? [])];
                      next[i] = { url: e.target.value };
                      set("images", next);
                    }}
                  />
                  <button
                    type="button"
                    className="btn bg-gray-100 rounded-xl px-3"
                    onClick={() => {
                      const next = (form.images ?? []).filter((_, j) => j !== i);
                      set("images", next.length ? next : [{ url: "" }]);
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="btn-outline rounded-xl px-4"
              onClick={() => set("images", [...(form.images ?? []), { url: "" }])}
            >
              Add Image
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="card-soft p-5 space-y-3">
            <div className="font-semibold">Actions</div>
            <button disabled={saving} className="btn-primary w-full rounded-xl py-3">
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button type="button" onClick={() => history.back()} className="btn-outline w-full rounded-xl py-3">
              Cancel
            </button>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}
