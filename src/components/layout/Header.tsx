// src/components/layout/Header.tsx
import { Link, NavLink, useLocation } from "react-router-dom";
import Container from "./Container";
import { Smartphone, ShoppingCart } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAppSelector } from "@/store";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const cartCount = useAppSelector((s) => s.cart.totalQty ?? 0);

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
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  // Active state for category links that use query params
  const location = useLocation();
  const { isShop, cat } = useMemo(() => {
    const isShop = location.pathname === "/shop";
    const params = new URLSearchParams(location.search);
    const cat = params.get("category"); // "car-accessories" | "power-tools" | null
    return { isShop, cat };
  }, [location.pathname, location.search]);

  const catClass = (slug: "car-accessories" | "power-tools") =>
    isShop && cat === slug
      ? "text-brand font-semibold"
      : "text-gray-700 hover:text-gray-900";

  return (
    <header
      className={`sticky top-0 z-[100] backdrop-blur bg-white/60 border-b transition-all ${
        scrolled ? "h-14 shadow-soft" : "h-16"
      }`}
    >
      <Container className="flex h-full items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-extrabold tracking-tight">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand-dark text-white">
            T
          </span>
          <span>Talex Suppliers</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          {/* Category links (use query string; manual active styles) */}
          <Link to="/shop?category=car-accessories" className={catClass("car-accessories")}>
            Car Accessories
          </Link>
          <Link to="/shop?category=power-tools" className={catClass("power-tools")}>
            Powerline Tools
          </Link>

          {/* About */}
          <NavLink
            to="/about"
            className={({ isActive }) =>
              isActive ? "text-brand font-semibold" : "text-gray-700 hover:text-gray-900"
            }
          >
            About us
          </NavLink>

          {/* Cart / Login */}
          <NavLink
            to="/cart"
            className="text-gray-700 hover:text-gray-900 inline-flex items-center gap-1.5"
          >
            <ShoppingCart className="h-4 w-4" /> Cart
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

        <div className="hidden md:flex items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-mpesa/10 text-mpesa px-3 py-1 border border-mpesa/30">
            <Smartphone className="h-4 w-4" />
            Pay with M-Pesa
          </span>
        </div>
      </Container>
    </header>
  );
}