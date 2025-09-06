// src/components/ui/WhatsAppFab.tsx
import { BRAND } from "@/lib/brand";
import { SiWhatsapp } from "react-icons/si";

export default function WhatsAppFab() {
  return (
    <a
      href={BRAND.socials.whatsapp}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 left-6 h-14 w-14 rounded-full bg-mpesa text-white shadow-xlsoft grid place-items-center"
      aria-label="Chat on WhatsApp"
      title="Chat on Whatsapp"
    >
      <SiWhatsapp size={22} />
    </a>
  );
}