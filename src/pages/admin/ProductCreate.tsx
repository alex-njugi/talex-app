import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "./_AdminLayout";
import { api, Product } from "@/lib/api";
import toast from "react-hot-toast";

export default function AdminProductCreate() {
  const nav = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Omit<Product, "id" | "slug"> & { images: { url: string }[] }>({
    title: "",
    sku: "",
    brand: "",
    category_id: "car",
    price_cents: 0,
    stock: 0,
    is_active: true,
    images: [{ url: "" }],
  });

  const set = (k: keyof typeof form, v: any) =>
    setForm((s) => ({ ...s, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const created = await api.products.create(form);
      toast.success("Product created");
      nav(`/admin/products/${created.id}/edit`);
    } catch (e: any) {
      toast.error(e?.message || "Failed to create");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout
      title="New Product"
      subtitle="Create a product with clean, minimal details"
      actions={null}
    >
      <form onSubmit={submit} className="grid gap-5 lg:grid-cols-3">
        {/* Left */}
        <div className="lg:col-span-2 space-y-5">
          <div className="card-soft p-5 space-y-3">
            <div className="font-semibold">Basics</div>
            <input
              className="input"
              placeholder="Title"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              required
            />
            <div className="grid sm:grid-cols-3 gap-3">
              <input
                className="input"
                placeholder="SKU"
                value={form.sku}
                onChange={(e) => set("sku", e.target.value)}
                required
              />
              <input
                className="input"
                placeholder="Brand"
                value={form.brand}
                onChange={(e) => set("brand", e.target.value)}
                required
              />
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
                placeholder="Price (KSh)"
                value={form.price_cents / 100}
                onChange={(e) => set("price_cents", Math.round(Number(e.target.value) * 100))}
              />
              <input
                className="input"
                type="number"
                min={0}
                placeholder="Stock"
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
              {form.images.map((im, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    className="input flex-1"
                    placeholder="Image URL"
                    value={im.url}
                    onChange={(e) => {
                      const next = [...form.images];
                      next[i] = { url: e.target.value };
                      set("images", next);
                    }}
                  />
                  <button
                    type="button"
                    className="btn bg-gray-100 rounded-xl px-3"
                    onClick={() => {
                      const next = form.images.filter((_, j) => j !== i);
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
              onClick={() => set("images", [...form.images, { url: "" }])}
            >
              Add Image
            </button>
          </div>
        </div>

        {/* Right */}
        <div className="space-y-3">
          <div className="card-soft p-5 space-y-3">
            <div className="font-semibold">Actions</div>
            <button disabled={saving} className="btn-primary w-full rounded-xl py-3">
              {saving ? "Saving..." : "Create Product"}
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
