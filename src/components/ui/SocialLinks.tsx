// src/components/ui/SocialLinks.tsx
import React from "react";
import { SiInstagram, SiTiktok, SiFacebook, SiWhatsapp } from "@/components/ui/icons";

type Size = "sm" | "md";
type Props = {
  className?: string;
  size?: Size;                 // "sm" = compact (default), "md" = regular
  showWhatsappNumber?: boolean;
  whatsappNumber?: string;     // e.g. "0722690154"
};

function waLink(num: string) {
  const digits = num.replace(/\D/g, "").replace(/^0/, "");
  return `https://wa.me/254${digits}`;
}

export default function SocialLinks({
  className = "",
  size = "sm",
  showWhatsappNumber = false,
  whatsappNumber = "0722690154",
}: Props) {
  const S = {
    sm: {
      btn: "h-9 w-9 rounded-lg",
      icon: "h-4 w-4",
      gap: "gap-2",
      pill: "h-9 px-3 text-[13px] rounded-lg",
    },
    md: {
      btn: "h-10 w-10 rounded-xl",
      icon: "h-5 w-5",
      gap: "gap-3",
      pill: "h-10 px-3.5 text-sm rounded-xl",
    },
  }[size];

  const baseBtn =
    `inline-flex items-center justify-center border shadow-soft transition focus:outline-none focus:ring-2 focus:ring-brand/40 ${S.btn}`;

  return (
    <div className={`flex items-center ${S.gap} ${className}`}>
      {/* Instagram */}
      <a
        href="https://www.instagram.com/talex_suppliersltd/"
        target="_blank"
        rel="noreferrer"
        aria-label="Instagram"
        title="Instagram"
        className={`${baseBtn} border-transparent text-white bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] hover:brightness-110`}
      >
        <SiInstagram className={S.icon} />
      </a>

      {/* TikTok */}
      <a
        href="https://www.tiktok.com/@supplierslimited"
        target="_blank"
        rel="noreferrer"
        aria-label="TikTok"
        title="TikTok"
        className={`${baseBtn} bg-black text-white border-black/20 hover:bg-black/90`}
      >
        <SiTiktok className={S.icon} />
      </a>

      {/* Facebook */}
      <a
        href="https://www.facebook.com/talexsuppliersltd/"
        target="_blank"
        rel="noreferrer"
        aria-label="Facebook"
        title="Facebook"
        className={`${baseBtn} bg-[#1877F2] text-white border-[#1877F2]/30 hover:brightness-110`}
      >
        <SiFacebook className={S.icon} />
      </a>

      {/* WhatsApp */}
      <a
        href={waLink(whatsappNumber)}
        target="_blank"
        rel="noreferrer"
        aria-label="WhatsApp"
        title="WhatsApp"
        className={`${baseBtn} bg-[#25D366] text-white border-[#25D366]/40 hover:brightness-110`}
      >
        <SiWhatsapp className={S.icon} />
      </a>

      {showWhatsappNumber && (
        <a
          href={waLink(whatsappNumber)}
          target="_blank"
          rel="noreferrer"
          aria-label={`Chat on WhatsApp ${whatsappNumber}`}
          className={`inline-flex items-center ${S.pill} gap-2 font-medium bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/40 hover:bg-[#25D366]/15 focus:outline-none focus:ring-2 focus:ring-brand/40`}
        >
          <SiWhatsapp className="h-4 w-4" />
          <span>{whatsappNumber}</span>
        </a>
      )}
    </div>
  );
}
