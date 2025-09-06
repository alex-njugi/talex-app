// src/components/ui/icons.tsx
import React from "react";
import {
  ShieldCheck,
  Truck,
  Storefront,
  MapPin,
  ShoppingCartSimple,
  Phone,
  EnvelopeSimple,
  Clock,
  NavigationArrow,
  DeviceMobile,
} from "phosphor-react";

// Premium social icons (brand-accurate)
export { SiInstagram, SiTiktok, SiFacebook, SiWhatsapp } from "react-icons/si";

// Classy Phosphor icons (duotone by default)
export const PShieldCheck = (p: any) => <ShieldCheck weight="duotone" {...p} />;
export const PTruck = (p: any) => <Truck weight="duotone" {...p} />;
export const PStore = (p: any) => <Storefront weight="duotone" {...p} />;
export const PMapPin = (p: any) => <MapPin weight="duotone" {...p} />;
export const PCart = (p: any) => <ShoppingCartSimple weight="duotone" {...p} />;
export const PPhone = (p: any) => <Phone weight="duotone" {...p} />;
export const PMail = (p: any) => <EnvelopeSimple weight="duotone" {...p} />;
export const PClock = (p: any) => <Clock weight="duotone" {...p} />;
export const PNav = (p: any) => <NavigationArrow weight="duotone" {...p} />;
export const PMobile = (p: any) => <DeviceMobile weight="duotone" {...p} />;

// Minimal M-Pesa mark (clean + always green by your Tailwind theme)
export const MpesaMark = ({ className = "h-4 w-4 text-mpesa" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm6 3.5a.75.75 0 0 0-1.5 0V8H9a.75.75 0 0 0 0 1.5h1.5V12H9a.75.75 0 0 0 0 1.5h1.5V17a.75.75 0 0 0 1.5 0v-3.5H14A.75.75 0 0 0 14 12h-2V9.5H14A.75.75 0 0 0 14 8h-2V6.5z"/>
  </svg>
);
