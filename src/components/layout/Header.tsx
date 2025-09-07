// src/components/layout/Header.tsx
import { Link, NavLink, useLocation } from "react-router-dom";
import Container from "./Container";
import {
  Smartphone,
  ShoppingCart,
  Menu,
  X,
  Search,
  Package,
  Tags,
  Info,
  ChevronRight,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAppSelector } from "@/store";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const cartCount = useAppSelector((s) => s.cart.totalQty ?? 0);
  const location = useLocation();

  // category active state (query-based)
  const { isShop, cat } = useMemo(() => {
    const isShop = location.pathname === "/shop";
    const params = new URLSearchParams(location.search);
    const cat = params.get("category"); // "car-accessories" | "power-tools" | null
    return { isShop, cat };
  }, [location.pathname, location.search]);

  const catClass = (slug: "car-accessories" | "power-tools") =>
    isShop && cat === slug ? "text-brand font-semibold" : "text-gray-700 hover:text-gray-900";

  // effects
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (e.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA") {
        e.preventDefault();
        document.getElementById("global-search-input")?.focus();
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  // auto-close on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.search]);

  // lock body scroll when menu open
  useEffect(() => {
    document.body.classList.toggle("overflow-hidden", open);
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-[120] backdrop-blur bg-white/60 border-b transition-all ${
        scrolled ? "h-14 shadow-soft" : "h-16"
      }`}
    >
      <Container className="flex h-full items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 font-extrabold tracking-tight">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand-dark text-white">
            T
          </span>
          <span className="hidden sm:inline">Talex Suppliers</span>
          <span className="sm:hidden">Talex</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link to="/shop?category=car-accessories" className={catClass("car-accessories")}>
            Car Accessories
          </Link>
          <Link to="/shop?category=power-tools" className={catClass("power-tools")}>
            Powerline Tools
          </Link>

          <NavLink
            to="/about"
            className={({ isActive }) =>
              isActive ? "text-brand font-semibold" : "text-gray-700 hover:text-gray-900"
            }
          >
            About us
          </NavLink>

          <NavLink to="/cart" className="text-gray-700 hover:text-gray-900 inline-flex items-center gap-1.5">
            <ShoppingCart className="h-4 w-4" />
            Cart
            {cartCount > 0 && (
              <span className="ml-1 rounded-full bg-brand text-white text-[10px] px-1.5 py-0.5">
                {cartCount}
              </span>
            )}
          </NavLink>

          <NavLink to="/login" className="text-gray-700 hover:text-gray-900">
            Login
          </NavLink>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Desktop M-Pesa pill */}
          <span className="hidden md:inline-flex items-center gap-2 rounded-full bg-mpesa/10 text-mpesa px-3 py-1 border border-mpesa/30">
            <Smartphone className="h-4 w-4" />
            Pay with M-Pesa
          </span>

          {/* Mobile icons */}
          <Link
            to="/cart"
            aria-label="Open cart"
            className="md:hidden relative inline-flex h-9 w-9 items-center justify-center rounded-xl border bg-white/70 hover:bg-white"
          >
            <ShoppingCart className="h-5 w-5 text-gray-800" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] rounded-full bg-brand text-white text-[10px] leading-[18px] text-center px-1">
                {cartCount}
              </span>
            )}
          </Link>

          <button
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-xl border bg-white/70 hover:bg-white"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </Container>

      {/* MOBILE MENU (premium sheet) */}
      <div
        id="mobile-menu"
        className={`md:hidden fixed inset-0 z-[140] ${open ? "" : "pointer-events-none"}`}
        aria-hidden={!open}
        role="dialog"
        aria-modal="true"
      >
        {/* Dim + blur backdrop */}
        <div
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
            open ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setOpen(false)}
        />

        {/* Sliding panel */}
        <div
          className={`absolute inset-x-0 top-0 rounded-b-3xl bg-gradient-to-b from-white to-white/95 shadow-2xl ring-1 ring-black/5 transition-transform duration-300 ease-out ${
            open ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          {/* Sheet header with close “X” */}
          <div className="flex items-center justify-between px-5 pt-4 pb-3">
            <Link to="/" className="flex items-center gap-2 font-extrabold tracking-tight">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-brand-dark text-white">
                T
              </span>
              <span>Talex</span>
            </Link>
            <button
              onClick={() => setOpen(false)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border bg-white hover:bg-gray-50 transition"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Quick search */}
          <div className="px-5 pb-4">
            <label
              htmlFor="global-search-input"
              className="mb-2 text-[11px] uppercase tracking-[0.18em] text-gray-500 block"
            >
              Search
            </label>
            <div className="flex items-center gap-2 rounded-2xl border bg-white px-3 py-2.5 focus-within:ring-2 focus-within:ring-brand">
              <Search className="h-4 w-4 text-gray-500" />
              <input
                id="global-search-input"
                className="w-full outline-none placeholder:text-gray-400"
                placeholder="Search products, brands…"
                onKeyDown={(e) => e.key === "Enter" && setOpen(false)}
              />
            </div>
          </div>

          {/* Content */}
          <div className="px-5 pb-6 space-y-4">
            {/* Primary CTA */}
            <Link
              to="/shop"
              className="btn-primary w-full rounded-2xl py-3 text-center"
              onClick={() => setOpen(false)}
            >
              Shop All Products
            </Link>

            {/* Feature cards */}
            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/shop?category=car-accessories"
                onClick={() => setOpen(false)}
                className="group rounded-2xl border bg-white p-4 hover:shadow-soft transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-brand" />
                    <div className="font-medium text-gray-900">Car Accessories</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                </div>
                <div className="mt-1 text-xs text-gray-500">Covers, blades, more</div>
              </Link>

              <Link
                to="/shop?category=power-tools"
                onClick={() => setOpen(false)}
                className="group rounded-2xl border bg-white p-4 hover:shadow-soft transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tags className="h-5 w-5 text-brand" />
                    <div className="font-medium text-gray-900">Power-line Tools</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                </div>
                <div className="mt-1 text-xs text-gray-500">Drills, cutters, gear</div>
              </Link>
            </div>

            {/* Simple list links */}
            <div className="rounded-2xl border bg-white divide-y">
              <Link
                to="/about"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between px-4 py-3 text-sm hover:bg-gray-50"
              >
                <span className="inline-flex items-center gap-2">
                  <Info className="h-4 w-4 text-gray-500" />
                  About Us
                </span>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </Link>

              <Link
                to="/track-order"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between px-4 py-3 text-sm hover:bg-gray-50"
              >
                <span className="inline-flex items-center gap-2">
                  <Package className="h-4 w-4 text-gray-500" />
                  Track Order
                </span>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </Link>

              <Link
                to="/cart"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between px-4 py-3 text-sm hover:bg-gray-50"
              >
                <span className="inline-flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-gray-500" />
                  Cart
                </span>
                {cartCount > 0 ? (
                  <span className="rounded-full bg-brand text-white text-[10px] px-1.5 py-0.5">
                    {cartCount}
                  </span>
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                )}
              </Link>
            </div>

            {/* Account row */}
            <div className="flex items-center justify-between rounded-2xl border bg-white px-4 py-3">
              <div className="text-sm text-gray-800">Account</div>
              <div className="flex gap-2">
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="btn-outline rounded-xl px-3 py-1.5 text-sm"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setOpen(false)}
                  className="btn-primary rounded-xl px-3 py-1.5 text-sm"
                >
                  Sign Up
                </Link>
              </div>
            </div>

            {/* M-Pesa pill */}
            <div className="inline-flex items-center gap-2 rounded-full bg-mpesa/10 text-mpesa px-3 py-1 border border-mpesa/30">
              <Smartphone className="h-4 w-4" />
              Pay with M-Pesa
            </div>

            {/* Safe area for bottom gesture bars */}
            <div className="pb-4" />
          </div>
        </div>
      </div>
    </header>
  );
}
