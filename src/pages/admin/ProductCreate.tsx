// src/pages/admin/ProductCreate.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "./_AdminLayout";
import { api, Product } from "@/lib/api";
import toast from "react-hot-toast";

/** Compress an image file to a data URL for instant preview + smaller payloads */
async function fileToDataURL(file: File, maxSize = 1400): Promise<string> {
  const asDataURL = (f: File) =>
    new Promise<string>((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(String(r.result));
      r.onerror = rej;
      r.readAsDataURL(f);
    });

  const src = await asDataURL(file);
  // Quick guard: if it's not an image or small enough, just return
  if (!file.type.startsWith("image/")) return src;

  // Draw to canvas to cap dimensions and compress
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const im = new Image();
    im.onload = () => res(im);
    im.onerror = rej;
    im.src = src;
  });

  const { width, height } = img;
  const scale = Math.min(1, maxSize / Math.max(width, height));
  const w = Math.max(1, Math.round(width * scale));
  const h = Math.max(1, Math.round(height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return src;
  ctx.drawImage(img, 0, 0, w, h);

  // Use JPEG for good size/quality balance. If you prefer WEBP, change mime to 'image/webp'.
  return canvas.toDataURL("image/jpeg", 0.85);
}

export default function AdminProductCreate() {
  const nav = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<
    Omit<Product, "id" | "slug"> & { images: { url: string }[] }
  >({
    title: "",
    sku: "",
    brand: "",
    category_id: "car",
    price_cents: 0,
    stock: 0,
    is_active: true,
    images: [{ url: "" }],
  });

  const set = (k: keyof typeof form, v: any) => setForm((s) => ({ ...s, [k]: v }));

  const handlePickFile = async (idx: number, file?: File | null) => {
    try {
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      const dataUrl = await fileToDataURL(file, 1400);
      const next = [...form.images];
      next[idx] = { url: dataUrl };
      set("images", next);
    } catch {
      toast.error("Failed to read selected file");
    }
  };

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
                value={form.price_cents }
                onChange={(e) =>
                  set("price_cents", Math.round(Number(e.target.value) ))
                }
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

          {/* Images: URL or pick from device */}
          <div className="card-soft p-5 space-y-3">
            <div className="font-semibold">Images</div>
            <div className="space-y-3">
              {form.images.map((im, i) => (
                <div key={i} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  {/* Preview */}
                  <div className="flex items-center gap-3 sm:w-64">
                    <div className="h-16 w-16 rounded-xl overflow-hidden border bg-white/70">
                      {im.url ? (
                        <img
                          src={im.url}
                          alt=""
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-full w-full grid place-items-center text-xs text-gray-400">
                          No image
                        </div>
                      )}
                    </div>

                    {/* Upload from device */}
                    <label className="btn-outline rounded-xl px-3 py-2 text-sm cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handlePickFile(i, e.target.files?.[0])}
                      />
                      Choose file…
                    </label>
                  </div>

                  {/* OR paste a link */}
                  <div className="flex-1 flex gap-2">
                    <input
                      className="input flex-1"
                      placeholder="…or paste an image URL"
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
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="btn-outline rounded-xl px-4"
                onClick={() => set("images", [...form.images, { url: "" }])}
              >
                Add Image
              </button>
              <div className="text-xs text-gray-500">
                Tip: local files are stored as optimized previews (data URLs). When you move to a real
                backend, switch to uploading files and saving the returned URL.
              </div>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="space-y-3">
          <div className="card-soft p-5 space-y-3">
            <div className="font-semibold">Actions</div>
            <button disabled={saving} className="btn-primary w-full rounded-xl py-3">
              {saving ? "Saving..." : "Create Product"}
            </button>
            <button
              type="button"
              onClick={() => history.back()}
              className="btn-outline w-full rounded-xl py-3"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}
