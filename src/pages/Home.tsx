// src/pages/Home.tsx
import { Link } from "react-router-dom";

import { useAppSelector } from "@/store";
import { BRAND } from "@/lib/brand";

import Container from "@/components/layout/Container";
import Section from "@/components/ui/Section";
import SearchBar from "@/components/ui/SearchBar";
import SocialLinks from "@/components/ui/SocialLinks";
import ProductCard from "@/components/product/ProductCard";
import { PShieldCheck, PTruck, PStore, PMapPin } from "@/components/ui/icons";

const HERO_POSTER =
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1920&q=80";
const HERO_VIDEO_MP4 = "/media/talex-hero.mp4";
const HERO_VIDEO_WEBM = "/media/talex-hero.webm";

export default function Home() {
  const products = useAppSelector((s) => s.product.products);
  const popular = products.slice(0, 8);

  return (
    <>
      {/* HERO — video bg, poster for instant paint, reduced-motion fallback */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          {/* Autoplay video unless user prefers reduced motion */}
          <video
            className="hidden motion-safe:block h-[580px] w-full object-cover object-[center_35%]"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={HERO_POSTER}
            aria-hidden="true"
          >
            <source src={HERO_VIDEO_WEBM} type="video/webm" />
            <source src={HERO_VIDEO_MP4} type="video/mp4" />
          </video>

          {/* Reduced-motion & very-low-end fallback */}
          <img
            src={HERO_POSTER}
            alt=""
            className="block motion-safe:hidden h-[580px] w-full object-cover object-[center_35%]"
            loading="eager"
          />

          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/45 to-black/20" />
        </div>

        <Container>
          <div className="relative pt-28 sm:pt-32 pb-14 sm:pb-16">
            {/* Glass headline panel with gradient border */}
            <div className="mx-auto max-w-4xl p-[1.5px] rounded-2xl bg-gradient-to-r from-white/40 to-white/10">
              <div className="rounded-2xl border border-white/25 bg-white/10 backdrop-blur-xl shadow-[0_24px_60px_-12px_rgba(2,6,23,0.45)] px-5 sm:px-6 py-7 sm:py-8 text-center">
                <p className="text-[11px] sm:text-xs uppercase tracking-[0.18em] text-white/80">
                  Car Accessories • Power-Line Tools
                </p>
                <h1 className="mt-1 text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-dark">
                    Talex
                  </span>{" "}
                  <span className="text-white">Suppliers Ltd</span>
                </h1>
                <p className="mt-3 text-white/90">{BRAND.blurb}</p>
                <div className="mt-6">
                  <SearchBar />
                </div>
                <div className="mt-5">
                  <Link
                    to="/shop"
                    className="btn-primary rounded-xl px-5 sm:px-6 py-3 text-base sm:text-lg"
                    aria-label="Shop all products"
                  >
                    Shop Now
                  </Link>
                </div>
              </div>
            </div>

            {/* Trust row */}
            <div className="mx-auto mt-6 grid max-w-5xl grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-4">
              <div className="card-glass p-4 flex items-center gap-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-mpesa/10 ring-1 ring-mpesa/30">
                  <PShieldCheck size={18} className="text-mpesa" aria-hidden="true" />
                </span>
                <div className="text-sm">
                  <b>Secure payments</b>
                  <div className="opacity-80">M-Pesa STK checkout</div>
                </div>
              </div>

              <div className="card-glass p-4 flex items-center gap-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 ring-1 ring-sky-200">
                  <PTruck size={18} className="text-sky-500" aria-hidden="true" />
                </span>
                <div className="text-sm">
                  <b>Countrywide</b>
                  <div className="opacity-80">Same-day Nairobi</div>
                </div>
              </div>

              <div className="card-glass p-4 flex items-center gap-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 ring-1 ring-amber-200">
                  <PStore size={18} className="text-amber-500" aria-hidden="true" />
                </span>
                <div className="text-sm">
                  <b>Wholesale &amp; Retail</b>
                  <div className="opacity-80">Fair prices</div>
                </div>
              </div>

              <div className="card-glass p-4 flex items-center gap-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10 ring-1 ring-brand/20">
                  <PMapPin size={18} className="text-brand" aria-hidden="true" />
                </span>
                <div className="text-sm">
                  <b>Visit us</b>
                  <div className="opacity-80">{BRAND.address}</div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <SocialLinks />
            </div>
          </div>
        </Container>
      </section>

      {/* Shop by category */}
      <Section title="Shop by Category" subtitle="Clear routes to what you need">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            to="/shop?category=car-accessories"
            className="relative overflow-hidden rounded-2xl group shadow-soft"
          >
            <img
              className="h-56 w-full object-cover transition group-hover:scale-[1.03]"
              src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1920&q=80"
              alt="Car accessories"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
            <div className="absolute bottom-5 left-5 text-white text-xl font-semibold">
              Car Accessories
            </div>
          </Link>

          <Link
            to="/shop?category=power-tools"
            className="relative overflow-hidden rounded-2xl group shadow-soft"
          >
            <img
              className="h-56 w-full object-cover transition group-hover:scale-[1.03]"
              src="/images/powerline.png"
              alt="Power-line tools"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
            <div className="absolute bottom-5 left-5 text-white text-xl font-semibold">
              Power-line Tools
            </div>
          </Link>
        </div>
      </Section>

      {/* Trending today */}
      <Section title="Trending Today" subtitle="Popular picks from our social channels">
        {popular.length === 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-64 rounded-2xl border bg-white/60 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {popular.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
