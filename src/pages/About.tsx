// src/pages/About.tsx
import Container from "@/components/layout/Container";
import Section from "@/components/ui/Section";
import SocialLinks from "@/components/ui/SocialLinks";
import { BRAND } from "@/lib/brand";
import { Wrench, Award } from "lucide-react"; // keep these two from lucide
import {
  PShieldCheck,
  PTruck,
  PMapPin,
  PPhone,
  PMail,
  PClock,
  PMobile,
} from "@/components/ui/icons"; // premium duotone set
import { Link } from "react-router-dom";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&w=1920&q=80";

export default function About() {
  return (
    <>
      {/* HERO — clean, premium, no white fade */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={HERO_IMAGE}
            alt=""
            className="h-[440px] w-full object-cover object-center"
          />
          {/* darker overlay only for crisp contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/50 to-transparent" />
        </div>

        <Container>
          <div className="relative pt-24 pb-16 text-center text-white space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] tracking-[0.18em] uppercase">
              About Us
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">
              Welcome to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-dark">
                Talex
              </span>{" "}
              Suppliers Ltd
            </h1>

            <p className="text-white/90 max-w-3xl mx-auto">
              Your trusted destination for quality <b>car accessories</b> and{" "}
              <b>power-line tools</b>. We focus on dependable products, fair
              pricing, and fast, friendly service across Kenya.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <Link
                to="/shop"
                className="btn-primary rounded-xl px-5 py-2.5"
                aria-label="Shop all products"
              >
                Shop Now
              </Link>
              <a
                href={BRAND.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-outline rounded-xl px-5 py-2.5"
                title="Open our store location in Google Maps"
              >
                Visit Our Store
              </a>
            </div>
          </div>
        </Container>
      </section>

      {/* QUICK STATS */}
      <Container className="relative -mt-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="card-glass p-4 text-center">
            <div className="text-xs uppercase tracking-wider text-gray-600">
              Founded
            </div>
            <div className="text-lg font-semibold">Talex Suppliers</div>
          </div>
          <div className="card-glass p-4 text-center">
            <div className="text-xs uppercase tracking-wider text-gray-600">
              Delivery
            </div>
            <div className="text-lg font-semibold">
              Same-day Nairobi, 1–3d upcountry
            </div>
          </div>
          <div className="card-glass p-4 text-center">
            <div className="text-xs uppercase tracking-wider text-gray-600">
              Checkout
            </div>
            <div className="text-lg font-semibold text-mpesa">M-Pesa Till</div>
          </div>
          <div className="card-glass p-4 text-center">
            <div className="text-xs uppercase tracking-wider text-gray-600">
              Focus
            </div>
            <div className="text-lg font-semibold">
              Retail & Wholesale Pricing
            </div>
          </div>
        </div>
      </Container>

      {/* STORY */}
      <Section title="Our Story" subtitle="Built for reliability, pricing, and speed">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="card-soft p-6">
            <h3 className="text-lg font-semibold mb-2">Why we exist</h3>
            <p className="text-gray-700">
              Talex was started to make it simple to get{" "}
              <b>genuine, fairly-priced</b> auto accessories and tools — without
              waiting weeks. We curate trusted brands, keep popular items in
              stock, and prioritize <b>same-day dispatch within Nairobi</b>.
            </p>

            <ul className="mt-4 space-y-2 text-gray-700">
              <li className="flex gap-2">
                <PShieldCheck className="h-5 w-5 text-brand" aria-hidden="true" />
                Quality and warranty-backed items
              </li>
              <li className="flex gap-2">
                <PTruck className="h-5 w-5 text-brand" aria-hidden="true" />
                Fast local delivery & clear ETAs
              </li>
              <li className="flex gap-2">
                <Wrench className="h-5 w-5 text-brand" aria-hidden="true" />
                Practical advice for compatibility & use
              </li>
            </ul>
          </div>

          <div className="overflow-hidden rounded-2xl border bg-white/70">
            <img
              src="https://images.unsplash.com/photo-1542367597-8849eb96105a?auto=format&fit=crop&w=1400&q=80"
              alt="Talex car accessories"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </Section>

      {/* WHY CHOOSE TALEX */}
      <Section title="Why Choose Talex" subtitle="What sets us apart">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="card-soft p-5">
            <Award className="h-5 w-5 text-brand" aria-hidden="true" />
            <div className="mt-2 font-semibold">Curated Quality</div>
            <p className="text-gray-700 text-sm">
              We source reputable brands and back them with a simple{" "}
              <b>7-day return</b> for unused items.
            </p>
          </div>
          <div className="card-soft p-5">
            <PTruck className="h-5 w-5 text-brand" aria-hidden="true" />
            <div className="mt-2 font-semibold">Fast & Clear Delivery</div>
            <p className="text-gray-700 text-sm">
              Nairobi same-day (cut-off 3pm), upcountry in 1–3 days via trusted
              couriers.
            </p>
          </div>
          <div className="card-soft p-5">
            <PShieldCheck className="h-5 w-5 text-mpesa" aria-hidden="true" />
            <div className="mt-2 font-semibold">M-Pesa First</div>
            <p className="text-gray-700 text-sm">
              Seamless Lipa na M-Pesa Till checkout with secure STK push and
              instant confirmation.
            </p>
          </div>
        </div>
      </Section>

      {/* VISIT US */}
      <Section title="Visit Us" subtitle="We’re easy to reach">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="card-soft p-6 space-y-3">
            <div className="flex items-start gap-3">
              <PMapPin className="h-5 w-5 text-brand" aria-hidden="true" />
              <div>
                <div className="font-semibold">Address</div>
                <a
                  href={BRAND.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-brand hover:underline"
                >
                  {BRAND.address}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <PClock className="h-5 w-5 text-brand" aria-hidden="true" />
              <div>
                <div className="font-semibold">Store Hours</div>
                <div className="text-gray-700 text-sm">Mon–Sat: 7:00am – 5:00pm</div>
                <div className="text-gray-700 text-sm">Sun & Public Holidays: Closed</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <PPhone className="h-5 w-5 text-brand" aria-hidden="true" />
              <div>
                <div className="font-semibold">Phone</div>
                <a
                  href={`tel:${BRAND.phone.replace(/\s+/g, "")}`}
                  className="text-brand hover:underline"
                >
                  {BRAND.phone}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <PMail className="h-5 w-5 text-brand" aria-hidden="true" />
              <div>
                <div className="font-semibold">Email</div>
                <a
                  href="mailto:talexsuppliers@gmail.com"
                  className="text-brand hover:underline break-all"
                >
                  talexsuppliers@gmail.com
                </a>
              </div>
            </div>

            <div className="pt-2">
              <SocialLinks />
            </div>
          </div>

          <div className="card-soft p-6">
            <div className="font-semibold mb-2">How to order</div>
            <ol className="list-decimal pl-5 text-gray-700 space-y-2 text-sm">
              <li>Browse our catalog and add items to your cart.</li>
              <li>Enter contact & delivery details at checkout.</li>
              <li>
                Pay via <span className="font-semibold text-mpesa">M-Pesa Till</span> (STK push).
              </li>
              <li>We dispatch quickly and share your delivery ETA.</li>
            </ol>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link to="/shop" className="btn-primary rounded-xl px-5 py-2.5">
                Shop Now
              </Link>
              <a
                href={BRAND.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-outline rounded-xl px-5 py-2.5 inline-flex items-center gap-2"
              >
                <PMapPin className="h-4 w-4" aria-hidden="true" />
                Find Us
              </a>
              <span className="pill-mpesa inline-flex">
                <PMobile className="h-4 w-4 text-mpesa" aria-hidden="true" />
                M-Pesa Till Ready
              </span>
            </div>
          </div>
        </div>
      </Section>

      {/* MAP */}
      <Section title="Find Us on the Map" subtitle={BRAND.address}>
        <div className="overflow-hidden rounded-2xl border bg-white/70">
          <iframe
            title="Talex Suppliers Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.8196253401406!2d36.8271007749657!3d-1.2819956987058143!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f112b90160403%3A0x85e4de3143032cab!2sTALEX%20SUPPLIERS%20LTD!5e0!3m2!1sen!2ske!4v1756505817649!5m2!1sen!2ske"
            className="w-full h-[380px] md:h-[520px] border-0"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </Section>
    </>
  );
}
