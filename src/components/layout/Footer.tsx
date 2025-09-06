import Container from "./Container";
import SocialLinks from "@/components/ui/SocialLinks";
import { BRAND } from "@/lib/brand";
import { Smartphone, Phone, Mail, MapPin, Clock, Navigation } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white/80 border-t">
      <Container className="py-12 grid gap-10 md:grid-cols-2 lg:grid-cols-4 text-sm">
        <div>
          <div className="flex items-center gap-2 font-extrabold tracking-tight text-lg mb-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand-dark text-white">T</span>
            <span>{BRAND.name}</span>
          </div>
          <p className="text-gray-600">{BRAND.blurb}</p>
          <div className="mt-5"><SocialLinks /></div>
        </div>

        <div>
          <div className="font-semibold mb-3">Contact</div>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-brand" />
              <a href={`tel:${BRAND.phone.replace(/\s+/g, "")}`} className="hover:text-brand">{BRAND.phone}</a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-brand" />
              <a href="mailto:talexsuppliers@gmail.com" className="hover:text-brand">talexsuppliers@gmail.com</a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 text-brand" />
              <div className="space-y-1">
                <a href={BRAND.mapsUrl} target="_blank" rel="noreferrer" className="hover:text-brand block">{BRAND.address}</a>
                <a href={BRAND.mapsUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-brand hover:underline">
                  <Navigation className="h-3.5 w-3.5" /> Get directions
                </a>
              </div>
            </li>
          </ul>
        </div>

        <div>
          <div className="font-semibold mb-3">Store Hours</div>
          <ul className="space-y-1 text-gray-700">
            <li className="flex items-center gap-2"><Clock className="h-4 w-4 text-brand" /><span>Mon–Sat: 7:00am – 5:00pm</span></li>
            <li className="flex items-center gap-2"><Clock className="h-4 w-4 text-brand" /><span>Sun & Public Holidays: Closed</span></li>
          </ul>
        </div>

        <div>
          <div className="font-semibold mb-3">Quick Links</div>
          <ul className="space-y-2 text-gray-700">
            <li><a href="/shop" className="hover:text-brand">Shop All</a></li>
            <li><a href="/shop?category=car-accessories" className="hover:text-brand">Car Accessories</a></li>
            <li><a href="/shop?category=power-tools" className="hover:text-brand">Power-line Tools</a></li>
            <li><a href="/track-order" className="hover:text-brand">Track Order</a></li>
            <li><a href="/about" className="hover:text-brand">About</a></li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-gray-100">
        <Container className="py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <div>© {new Date().getFullYear()} {BRAND.name}. All rights reserved.</div>
          <div>
            Built by:{" "}
            <a href="https://alexnjugi.com" target="_blank" rel="noreferrer" className="underline text-brand hover:text-brand-dark">
              Alex Njugi Karanja
            </a>
          </div>
        </Container>
      </div>
    </footer>
  );
}
