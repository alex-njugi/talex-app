/* MOCK (localStorage) + HTTP (switch with VITE_API_BASE_URL) */

export type Img = { url: string };
export type Product = {
  id: string;
  title: string;
  slug: string;
  sku: string;
  brand: string;
  category_id: "car" | "tools";
  price_cents: number;
  stock: number;
  is_active: boolean;
  images?: Img[];
};

export type OrderItem = {
  product_id?: string;
  title: string;
  qty: number;
  price_cents: number;
  image?: string;
};
export type Order = {
  id: string;
  date: string;
  name: string;
  phone: string;
  address: string;
  status: "Pending" | "Paid" | "Shipped" | "Completed" | "Cancelled";
  payment?: { status: "Pending" | "Confirmed" | "Failed"; receipt?: string; phone?: string };
  items: OrderItem[];
};

const BASE = import.meta.env.VITE_API_BASE_URL?.trim();
const IS_HTTP = !!BASE;

const LS_PRODUCTS = "talex:products";
const LS_ORDERS = "talex:orders";

const delay = (ms = 350) => new Promise(r => setTimeout(r, ms));
const uid = () =>
  (crypto?.randomUUID?.() ?? `id_${Date.now()}_${Math.random().toString(16).slice(2)}`);

function readLS<T>(k: string, def: T): T {
  try { const v = localStorage.getItem(k); return v ? JSON.parse(v) as T : def; }
  catch { return def; }
}
function writeLS<T>(k: string, v: T) { localStorage.setItem(k, JSON.stringify(v)); }

/* -------- MOCK -------- */
const mock = {
  async listProducts(): Promise<Product[]> {
    await delay(); return readLS<Product[]>(LS_PRODUCTS, []);
  },
  async createProduct(p: Omit<Product,"id"|"slug"> & { slug?: string }): Promise<Product> {
    await delay();
    const items = readLS<Product[]>(LS_PRODUCTS, []);
    const id = uid();
    const slug = (p.slug || p.title).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)+/g,"");
    const rec: Product = { id, slug, ...p };
    writeLS(LS_PRODUCTS, [rec, ...items]);
    return rec;
  },
  async updateProduct(id: string, patch: Partial<Product>): Promise<Product> {
    await delay();
    const items = readLS<Product[]>(LS_PRODUCTS, []);
    const i = items.findIndex(x => x.id === id);
    if (i < 0) throw new Error("Not found");
    const next = { ...items[i], ...patch, id: items[i].id } as Product;
    items[i] = next; writeLS(LS_PRODUCTS, items);
    return next;
  },
  async deleteProduct(id: string) {
    await delay();
    const items = readLS<Product[]>(LS_PRODUCTS, []);
    writeLS(LS_PRODUCTS, items.filter(x => x.id !== id));
  },

  async listOrders(): Promise<Order[]> {
    await delay(); return readLS<Order[]>(LS_ORDERS, []);
  },
  async getOrder(id: string): Promise<Order | null> {
    await delay();
    const all = readLS<Order[]>(LS_ORDERS, []);
    return all.find(o => o.id === id) || null;
  },
  async createOrder(data: Omit<Order,"id"|"date"|"status"> & Partial<Order>): Promise<Order> {
    await delay();
    const all = readLS<Order[]>(LS_ORDERS, []);
    const rec: Order = {
      id: uid(),
      date: new Date().toISOString(),
      status: data.status ?? "Pending",
      name: data.name ?? "",
      phone: data.phone ?? "",
      address: data.address ?? "",
      items: data.items ?? [],
      payment: data.payment,
    };
    writeLS(LS_ORDERS, [rec, ...all]);
    return rec;
  },
  async updateOrder(id: string, patch: Partial<Order>): Promise<Order> {
    await delay();
    const all = readLS<Order[]>(LS_ORDERS, []);
    const i = all.findIndex(o => o.id === id);
    if (i < 0) throw new Error("Not found");
    const next = { ...all[i], ...patch, id: all[i].id } as Order;
    all[i] = next; writeLS(LS_ORDERS, all); return next;
  },

  async seedIfEmpty() {
    const has = readLS<Product[]>(LS_PRODUCTS, []);
    if (has.length) return;

    const seeded: Product[] = [
      {
        id: uid(),
        title: "3D Steering Wheel Covers (Assorted)",
        slug: "3d-steering-wheel-covers",
        sku: "SWC-3D",
        brand: "Talex",
        category_id: "car",
        price_cents: 80000,
        stock: 12,
        is_active: true,
        images: [{ url: "https://picsum.photos/seed/talex-swc/600/400" }]
      },
      {
        id: uid(),
        title: "Metallic Wiper Blades (Pair)",
        slug: "metallic-wiper-blades",
        sku: "WIPER-METAL",
        brand: "Talex",
        category_id: "car",
        price_cents: 45000,
        stock: 20,
        is_active: true,
        images: [{ url: "https://picsum.photos/seed/talex-wiper/600/400" }]
      },
      ...Array.from({ length: 6 }).map((_, i) => ({
        id: uid(),
        title: `Premium Car Accessory ${i + 1}`,
        slug: `premium-car-accessory-${i + 1}`,
        sku: `SKU${i + 1}`,
        brand: i % 2 ? "Bosch" : "Talex",
        category_id: "car",
        price_cents: 249900,
        stock: i % 3 ? 12 : 0,
        is_active: true,
        images: [{ url: `https://picsum.photos/seed/talex-${i}/600/400` }]
      }))
    ];
    writeLS(LS_PRODUCTS, seeded);

    const orders: Order[] = [
      {
        id: "1725690123",
        date: new Date().toISOString(),
        name: "Talex Customer",
        phone: "0700000000",
        address: "Kirinyaga Rd - Kumasi Rd Jct, Nairobi",
        status: "Paid",
        payment: { status: "Confirmed", receipt: "QHX3ABC123", phone: "0722690154" },
        items: [
          { title: "3D Steering Wheel Covers (Assorted)", qty: 1, price_cents: 80000, image: "https://picsum.photos/seed/talex-swc/120/120" },
          { title: "Metallic Wiper Blades (Pair)", qty: 1, price_cents: 45900, image: "https://picsum.photos/seed/talex-wiper/120/120" }
        ]
      }
    ];
    writeLS(LS_ORDERS, orders);
  }
};

/* -------- HTTP -------- */
async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const r = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    ...init,
  });
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r.status === 204 ? (undefined as any) : await r.json();
}
const httpApi = {
  listProducts: () => http<Product[]>("/products"),
  createProduct: (p: Partial<Product>) => http<Product>("/products", { method: "POST", body: JSON.stringify(p) }),
  updateProduct: (id: string, patch: Partial<Product>) => http<Product>(`/products/${id}`, { method: "PUT", body: JSON.stringify(patch) }),
  deleteProduct: (id: string) => http<void>(`/products/${id}`, { method: "DELETE" }),

  listOrders: () => http<Order[]>("/orders"),
  getOrder: (id: string) => http<Order>(`/orders/${id}`),
  createOrder: (o: Partial<Order>) => http<Order>("/orders", { method: "POST", body: JSON.stringify(o) }),
  updateOrder: (id: string, patch: Partial<Order>) => http<Order>(`/orders/${id}`, { method: "PUT", body: JSON.stringify(patch) }),

  seedIfEmpty: async () => {},
};

/* -------- PUBLIC -------- */
export const api = {
  products: {
    list:   IS_HTTP ? httpApi.listProducts  : mock.listProducts,
    create: IS_HTTP ? httpApi.createProduct : mock.createProduct,
    update: IS_HTTP ? httpApi.updateProduct : mock.updateProduct,
    remove: IS_HTTP ? httpApi.deleteProduct : mock.deleteProduct,
  },
  orders: {
    list:   IS_HTTP ? httpApi.listOrders   : mock.listOrders,
    get:    IS_HTTP ? httpApi.getOrder     : mock.getOrder,
    create: IS_HTTP ? httpApi.createOrder  : mock.createOrder,
    update: IS_HTTP ? httpApi.updateOrder  : mock.updateOrder,
  },
  seedIfEmpty: IS_HTTP ? httpApi.seedIfEmpty : mock.seedIfEmpty,
};
