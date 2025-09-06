import { NavLink, Link } from "react-router-dom";
import { PShieldCheck, PTruck, PStore, PCart } from "@/components/ui/icons";

export default function AdminLayout({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[calc(100vh-64px-64px)] bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
        {/* Shell: sidebar + content */}
        <div className="grid gap-6 lg:grid-cols-[260px,1fr]">
          {/* Sidebar */}
          <aside className="card-soft p-4 h-max sticky top-20">
            <div className="flex items-center gap-2 font-extrabold tracking-tight mb-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand-dark text-white">A</span>
              <span>Talex Admin</span>
            </div>

            <nav className="space-y-1 text-sm">
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-xl px-3 py-2 ${
                    isActive ? "bg-brand/10 text-brand font-semibold" : "hover:bg-gray-100"
                  }`
                }
              >
                <PShieldCheck className="h-4 w-4" /> Dashboard
              </NavLink>
              <NavLink
                to="/admin/products"
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-xl px-3 py-2 ${
                    isActive ? "bg-brand/10 text-brand font-semibold" : "hover:bg-gray-100"
                  }`
                }
              >
                <PStore className="h-4 w-4" /> Products
              </NavLink>
              <NavLink
                to="/admin/orders"
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-xl px-3 py-2 ${
                    isActive ? "bg-brand/10 text-brand font-semibold" : "hover:bg-gray-100"
                  }`
                }
              >
                <PCart className="h-4 w-4" /> Orders
              </NavLink>
              <a
                href="/"
                className="mt-3 inline-flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-gray-100"
              >
                <PTruck className="h-4 w-4" /> Back to Store
              </a>
            </nav>
          </aside>

          {/* Content */}
          <section className="space-y-5">
            {/* Header */}
            <div className="rounded-2xl border bg-white/70 backdrop-blur p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-soft">
              <div>
                <div className="text-xl font-semibold">{title}</div>
                {subtitle && <div className="text-sm text-gray-600">{subtitle}</div>}
              </div>
              {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
            </div>

            {children}
          </section>
        </div>
      </div>
    </div>
  );
}
