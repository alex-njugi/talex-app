// src/pages/NotFound.tsx
import { useNavigate } from "react-router-dom";
import Container from "@/components/layout/Container";
import SearchBar from "@/components/ui/SearchBar";
import { Link } from "react-router-dom";
import { ChevronLeft, Home, ShoppingBag, LifeBuoy } from "lucide-react";

export default function NotFound() {
  const nav = useNavigate();

  return (
    <section className="relative min-h-[100dvh] overflow-hidden bg-[radial-gradient(60%_40%_at_50%_-10%,rgba(16,185,129,0.14),transparent),radial-gradient(40%_35%_at_10%_90%,rgba(59,130,246,0.10),transparent)]">
      {/* Top mobile back */}
      <div className="absolute top-4 inset-x-0 px-5 flex items-center justify-between md:justify-end">
        <button
          onClick={() => (history.length > 1 ? history.back() : nav("/"))}
          className="md:hidden inline-flex items-center gap-1.5 rounded-2xl bg-white/90 backdrop-blur px-3.5 py-2.5 text-sm text-gray-800 border hover:bg-white"
          aria-label="Go back"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>
      </div>

      <Container className="py-24 md:py-36">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center justify-center rounded-3xl border border-white/60 bg-white/70 backdrop-blur px-4 py-2 text-[11px] tracking-[0.18em] uppercase text-gray-700">
            404 • Not Found
          </div>

          <h1 className="mt-4 text-5xl md:text-6xl font-extrabold leading-tight">
            Oops — we couldn’t find that page.
          </h1>
          <p className="mt-3 text-gray-600">
            The link might be broken or the page may have moved. Try searching for what you need.
          </p>

          {/* Search */}
          <div className="mt-6">
            <SearchBar />
          </div>

          {/* Actions */}
          <div className="mt-6 grid grid-cols-1 sm:inline-grid sm:grid-cols-3 gap-3 justify-center">
            <Link
              to="/"
              className="btn-primary rounded-xl px-5 py-3 inline-flex items-center justify-center gap-2"
            >
              <Home className="h-4 w-4" />
              Go Home
            </Link>
            <Link
              to="/shop"
              className="btn-outline rounded-xl px-5 py-3 inline-flex items-center justify-center gap-2"
            >
              <ShoppingBag className="h-4 w-4" />
              Shop Products
            </Link>
            <a
              href="mailto:talexsuppliers@gmail.com"
              className="rounded-xl px-5 py-3 inline-flex items-center justify-center gap-2 border bg-white/80 hover:bg-white"
            >
              <LifeBuoy className="h-4 w-4 text-brand" />
              Contact Support
            </a>
          </div>

          {/* Helpful links */}
          <div className="mt-8 text-sm text-gray-600">
            <span className="opacity-80">Quick links:</span>{" "}
            <Link to="/shop?category=car-accessories" className="text-brand hover:underline">
              Car accessories
            </Link>{" "}
            •{" "}
            <Link to="/shop?category=power-tools" className="text-brand hover:underline">
              Power-line tools
            </Link>{" "}
            •{" "}
            <Link to="/about" className="text-brand hover:underline">
              About us
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
