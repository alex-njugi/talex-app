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
  if (!file.type.startsWith("image/")) return src;

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
    // NOTE: stored in **shillings** to match the rest of the app (kept field name for compatibility)
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
      toast.success("Image added");
    } catch {
      toast.error("Failed to read selected file");
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!form.title.trim()) return toast.error("Title is required");
      if (!form.sku.trim()) return toast.error("SKU is required");
      if (form.price_cents <= 0) return toast.error("Enter a valid price");

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

  // Display value in KSh (keeps 0 as empty on first load); we store **shillings**
  const priceDisplay = form.price_cents ? String(form.price_cents) : "";

  return (
    <AdminLayout
      title="New Product"
      subtitle="Create a product with clean, minimal details"
      actions={null}
    >
      {/* MOBILE sticky actions */}
      <div className="lg:hidden fixed inset-x-0 bottom-0 z-20 print:hidden">
        <div className="mx-auto w-full max-w-screen-sm px-4 pb-3 safe-bottom">
          <div className="rounded-2xl border bg-white/80 backdrop-blur shadow-soft p-2 flex gap-2">
            <button
              type="button"
              onClick={() => history.back()}
              className="btn-outline flex-1 rounded-xl py-3"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              form="product-form"
              type="submit"
              disabled={saving}
              className="btn-primary flex-1 rounded-xl py-3"
            >
              {saving ? "Saving…" : "Create"}
            </button>
          </div>
        </div>
      </div>

      <form id="product-form" onSubmit={submit} className="grid gap-5 lg:grid-cols-3 lg:items-start">
        {/* Left */}
        <div className="lg:col-span-2 space-y-5">
          {/* Basics */}
          <div className="card-soft p-5 space-y-4">
            <SectionTitle title="Basics" hint="The essentials customers will see first." />
            <Field label="Title" required>
              <input
                className="input"
                placeholder="eg. 2-in-1 Car Vacuum Cleaner"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                required
              />
            </Field>

            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="SKU" required>
                <input
                  className="input"
                  placeholder="eg. VAC-200"
                  value={form.sku}
                  onChange={(e) => set("sku", e.target.value)}
                  required
                />
              </Field>
              <Field label="Brand" required>
                <input
                  className="input"
                  placeholder="eg. PowerLine"
                  value={form.brand}
                  onChange={(e) => set("brand", e.target.value)}
                  required
                />
              </Field>
              <Field label="Category">
                <select
                  className="input"
                  value={form.category_id}
                  onChange={(e) => set("category_id", e.target.value as any)}
                >
                  <option value="car">Car accessories</option>
                  <option value="tools">Power-line tools</option>
                </select>
              </Field>
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="card-soft p-5 space-y-4">
            <SectionTitle title="Pricing & Stock" hint="Set a clear price and maintain availability." />
            <div className="grid gap-3 sm:grid-cols-3">
              {/* Price with KSh prefix and mobile decimal keypad (stores **shillings**) */}
              <Field label="Price" hint="In Kenyan Shillings" required>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">KSh</span>
                  <input
                    className="input pl-12"
                    inputMode="decimal"
                    pattern="[0-9]*[.,]?[0-9]*"
                    placeholder="0"
                    value={priceDisplay}
                    onChange={(e) => {
                      const raw = e.target.value.replace(",", ".");
                      const num = Number(raw);
                      // store in **shillings** (rounded)
                      set("price_cents", Number.isFinite(num) ? Math.max(0, Math.round(num)) : 0);
                    }}
                  />
                </div>
              </Field>

              {/* Stock: numeric keypad */}
              <Field label="Stock" required>
                <input
                  className="input"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  placeholder="eg. 25"
                  value={form.stock}
                  onChange={(e) => set("stock", Math.max(0, Number(e.target.value)))}
                />
              </Field>

              {/* Status as a simple segmented control on mobile; select on desktop if you prefer */}
              <Field label="Visibility">
                <div className="hidden sm:block">
                  <select
                    className="input"
                    value={String(form.is_active)}
                    onChange={(e) => set("is_active", e.target.value === "true")}
                  >
                    <option value="true">Active</option>
                    <option value="false">Hidden</option>
                  </select>
                </div>
                <div className="sm:hidden flex gap-2">
                  <button
                    type="button"
                    onClick={() => set("is_active", true)}
                    className={`flex-1 rounded-xl px-3 py-2 text-sm ring-1 ${
                      form.is_active ? "bg-gray-900 text-white ring-gray-900" : "bg-white text-gray-700 ring-gray-300"
                    }`}
                  >
                    Active
                  </button>
                  <button
                    type="button"
                    onClick={() => set("is_active", false)}
                    className={`flex-1 rounded-xl px-3 py-2 text-sm ring-1 ${
                      !form.is_active ? "bg-gray-900 text-white ring-gray-900" : "bg-white text-gray-700 ring-gray-300"
                    }`}
                  >
                    Hidden
                  </button>
                </div>
              </Field>
            </div>
          </div>

          {/* Images */}
          <div className="card-soft p-5 space-y-4">
            <SectionTitle title="Images" hint="Add clear product photos. First image becomes the cover." />

            {/* Mobile-first image grid */}
            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {form.images.map((im, i) => (
                <li key={i} className="group relative">
                  <div className="aspect-square w-full overflow-hidden rounded-xl border bg-white/70">
                    {im.url ? (
                      <img src={im.url} alt="" className="h-full w-full object-cover" loading="lazy" />
                    ) : (
                      <div className="h-full w-full grid place-items-center text-xs text-gray-400">No image</div>
                    )}
                  </div>

                  {/* Image controls */}
                  <div className="mt-2 flex gap-2">
                    <label className="btn-outline rounded-xl px-3 py-2 text-sm cursor-pointer flex-1 text-center">
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={(e) => handlePickFile(i, e.target.files?.[0])}
                      />
                      {im.url ? "Replace" : "Upload"}
                    </label>
                    <button
                      type="button"
                      className="btn bg-gray-100 rounded-xl px-3 py-2 text-sm"
                      onClick={() => {
                        const next = form.images.filter((_, j) => j !== i);
                        set("images", next.length ? next : [{ url: "" }]);
                      }}
                    >
                      Remove
                    </button>
                  </div>

                  {/* URL input (collapsible on mobile for compactness) */}
                  <div className="mt-2">
                    <input
                      className="input"
                      placeholder="…or paste image URL"
                      value={im.url}
                      onChange={(e) => {
                        const next = [...form.images];
                        next[i] = { url: e.target.value };
                        set("images", next);
                      }}
                    />
                  </div>

                  {/* Cover badge */}
                  {i === 0 && (
                    <span className="absolute -top-2 -left-2 rounded-full bg-gray-900 text-white text-[11px] px-2 py-0.5 shadow">
                      Cover
                    </span>
                  )}
                </li>
              ))}

              {/* Add tile */}
              <li>
                <button
                  type="button"
                  onClick={() => set("images", [...form.images, { url: "" }])}
                  className="aspect-square w-full rounded-xl border-2 border-dashed border-gray-300 grid place-items-center text-sm text-gray-600 hover:bg-gray-50"
                >
                  + Add image
                </button>
              </li>
            </ul>

            <p className="text-xs text-gray-500">
              Tip: local files are stored as optimized previews (data URLs). For production, upload to storage and save the returned URL.
            </p>
          </div>
        </div>

        {/* Right (desktop actions) */}
        <div className="space-y-3 hidden lg:block">
          <div className="card-soft p-5 space-y-3 sticky top-6">
            <div className="font-semibold">Actions</div>
            <button disabled={saving} className="btn-primary w-full rounded-xl py-3">
              {saving ? "Saving…" : "Create Product"}
            </button>
            <button
              type="button"
              onClick={() => history.back()}
              className="btn-outline w-full rounded-xl py-3"
              disabled={saving}
            >
              Cancel
            </button>
            <div className="text-xs text-gray-500">
              You can edit details & reorder images after creating the product.
            </div>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}

/* ---------- tiny components for clarity ---------- */
function SectionTitle({ title, hint }: { title: string; hint?: string }) {
  return (
    <div>
      <div className="font-semibold">{title}</div>
      {hint && <div className="text-xs text-gray-500">{hint}</div>}
    </div>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-1.5 text-xs font-medium text-gray-700">
        {label} {required && <span className="text-rose-600">*</span>}
      </div>
      {children}
      {hint && <div className="mt-1 text-[11px] text-gray-500">{hint}</div>}
    </label>
  );
}

/* (icons are inherited from your styles if needed) */
