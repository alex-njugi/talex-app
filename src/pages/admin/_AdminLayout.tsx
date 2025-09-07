// src/components/layout/AdminLayout.tsx
import { useEffect, useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
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
  const [open, setOpen] = useState(false);
  const loc = useLocation();

  // Close drawer on route change
  useEffect(() => setOpen(false), [loc.pathname, loc.search]);
  // ESC to close + body scroll lock
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Top bar (mobile) */}
      <div className="sticky top-0 z-[95] bg-white/70 backdrop-blur border-b">
        <div className="mx-auto max-w-7xl px-4 lg:px-6 h-14 flex items-center justify-between">
          <button
            onClick={() => setOpen(true)}
            className="inline-flex lg:hidden items-center gap-2 rounded-xl border bg-white/70 px-3 py-1.5 text-sm hover:bg-white"
            aria-label="Open admin menu"
          >
            <span className="i-lucide-menu h-4 w-4" />
            Menu
          </button>
          <Link to="/admin" className="flex items-center gap-2 font-extrabold tracking-tight">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand-dark text-white">A</span>
            <span className="hidden sm:block">Talex Admin</span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl border bg-white/70 px-3 py-1.5 text-sm hover:bg-white"
          >
            <PTruck className="h-4 w-4" />
            <span className="hidden sm:block">Back to Store</span>
            <span className="sm:hidden">Store</span>
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 lg:px-6 py-6">
        <div className="grid gap-6 lg:grid-cols-[260px,1fr]">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block">
            <SidebarCard />
          </aside>

          {/* Mobile drawer */}
          {open && (
            <div className="lg:hidden fixed inset-0 z-[100]">
              <button
                className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"
                onClick={() => setOpen(false)}
                aria-label="Close menu overlay"
              />
              <div
                className="absolute left-0 top-0 h-full w-[84%] max-w-[320px] shadow-xl"
                aria-label="Admin navigation panel"
              >
                <div className="h-full translate-x-0 animate-[slideIn_.25s_ease-out]">
                  <SidebarCard onNavigate={() => setOpen(false)} />
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          <section className="space-y-5">
            {/* Page header */}
            <div className="rounded-2xl border bg-white/70 backdrop-blur p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-soft">
              <div>
                <div className="text-xl font-semibold tracking-tight">{title}</div>
                {subtitle && <div className="text-sm text-gray-600">{subtitle}</div>}
              </div>
              {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
            </div>

            {children}
          </section>
        </div>
      </div>

      {/* Keyframe for drawer */}
      <style>{`
        @keyframes slideIn { from { transform: translateX(-8%); opacity: .6; } to { transform: translateX(0); opacity: 1; } }
      `}</style>
    </div>
  );
}

function SidebarCard({ onNavigate }: { onNavigate?: () => void } = {}) {
  const linkBase =
    "flex items-center gap-2 rounded-xl px-3 py-2 transition-colors";
  const active =
    "bg-brand/10 text-brand font-semibold";
  const idle =
    "text-gray-800 hover:bg-gray-100";

  return (
    <div className="card-soft p-4 h-max sticky top-20 lg:top-6 bg-white/80 backdrop-blur border shadow-soft">
      <div className="flex items-center gap-2 font-extrabold tracking-tight mb-3">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand-dark text-white">A</span>
        <span>Talex Admin</span>
      </div>

      <nav className="space-y-1 text-sm">
        <NavLink
          to="/admin"
          onClick={onNavigate}
          className={({ isActive }) => `${linkBase} ${isActive ? active : idle}`}
        >
          <PShieldCheck className="h-4 w-4" /> Dashboard
        </NavLink>

        <NavLink
          to="/admin/products"
          onClick={onNavigate}
          className={({ isActive }) => `${linkBase} ${isActive ? active : idle}`}
        >
          <PStore className="h-4 w-4" /> Products
        </NavLink>

        <NavLink
          to="/admin/orders"
          onClick={onNavigate}
          className={({ isActive }) => `${linkBase} ${isActive ? active : idle}`}
        >
          <PCart className="h-4 w-4" /> Orders
        </NavLink>

        <Link
          to="/"
          onClick={onNavigate}
          className="mt-3 inline-flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-gray-100"
        >
          <PTruck className="h-4 w-4" /> Back to Store
        </Link>
      </nav>
    </div>
  );
}
