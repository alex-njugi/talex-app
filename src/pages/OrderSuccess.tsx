// src/pages/OrderSuccess.tsx
import { useEffect, useMemo, useState } from "react";
import Container from "@/components/layout/Container";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { Link, useParams } from "react-router-dom";
import { CheckCircle2, Truck, Receipt, Printer, Share2, Clipboard, ClipboardCheck, Home } from "lucide-react";
import toast from "react-hot-toast";

export default function OrderSuccess() {
  const { id } = useParams();
  const ref = useMemo(() => id ?? "—", [id]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // tiny confetti-ish pulse on mount
    const el = document.getElementById("success-burst");
    if (!el) return;
    el.animate(
      [
        { transform: "scale(0.9)", opacity: 0.6 },
        { transform: "scale(1.04)", opacity: 1 },
        { transform: "scale(1)", opacity: 1 },
      ],
      { duration: 520, easing: "cubic-bezier(.2,.8,.2,1)" }
    );
  }, []);

  const copyRef = async () => {
    try {
      await navigator.clipboard.writeText(ref);
      setCopied(true);
      toast.success("Reference copied");
      setTimeout(() => setCopied(false), 1200);
    } catch {
      toast.error("Couldn’t copy. Long-press to copy instead.");
    }
  };

  const shareRef = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Talex Order",
          text: `My Talex order reference: ${ref}`,
          url: window.location.href,
        });
      } else {
        await copyRef();
      }
    } catch {
      /* user cancelled – ignore */
    }
  };

  const printPage = () => window.print();

  return (
    <section className="relative">
      {/* ambient backdrop for premium feel */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_-10%,rgba(16,185,129,0.10),transparent),radial-gradient(40%_35%_at_10%_90%,rgba(59,130,246,0.10),transparent)]" />

      <Container className="relative pt-6 pb-16 md:pt-10">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Order Success" }]} />

        <div className="mx-auto mt-6 max-w-3xl">
          {/* Premium card */}
          <div className="relative overflow-hidden rounded-3xl border bg-white/85 backdrop-blur-xl shadow-[0_24px_60px_-16px_rgba(2,6,23,0.20)]">
            {/* subtle top gradient border */}
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-brand via-brand-dark to-brand/60" />

            <div className="p-6 sm:p-8 text-center">
              {/* success emblem */}
              <div id="success-burst" className="mx-auto h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white grid place-items-center shadow-lg ring-4 ring-emerald-100">
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold tracking-tight">
                Thank you! Your order is in 🎉
              </h1>
              <p className="mt-1 text-gray-700">
                We’ve received your order and sent a confirmation. You’ll get an update when it ships.
              </p>

              {/* Reference + actions */}
              <div className="mt-5 inline-flex items-center gap-3 rounded-2xl border bg-white/70 px-3.5 py-2.5">
                <span className="text-sm text-gray-600">Reference:</span>
                <code className="font-semibold tracking-wide">{ref}</code>
                <button
                  onClick={copyRef}
                  className="ml-1 inline-flex items-center gap-1.5 rounded-lg border bg-white/70 px-2.5 py-1.5 text-xs hover:bg-white"
                >
                  {copied ? <ClipboardCheck className="h-4 w-4 text-emerald-600" /> : <Clipboard className="h-4 w-4" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>

              {/* Next steps */}
              <div className="mt-6 grid gap-3 sm:grid-cols-3 text-left">
                <div className="rounded-xl border bg-white/70 p-4">
                  <div className="text-xs uppercase tracking-wide text-gray-500">Payment</div>
                  <div className="mt-1 font-semibold">M-Pesa Till (STK)</div>
                  <p className="mt-1 text-sm text-gray-600">If prompted on your phone, approve the request to complete payment.</p>
                </div>
                <div className="rounded-xl border bg-white/70 p-4">
                  <div className="text-xs uppercase tracking-wide text-gray-500">Dispatch</div>
                  <div className="mt-1 font-semibold">Same-day Nairobi</div>
                  <p className="mt-1 text-sm text-gray-600">Upcountry orders deliver in 1–3 days via trusted couriers.</p>
                </div>
                <div className="rounded-xl border bg-white/70 p-4">
                  <div className="text-xs uppercase tracking-wide text-gray-500">Support</div>
                  <div className="mt-1 font-semibold">We’re here to help</div>
                  <p className="mt-1 text-sm text-gray-600">WhatsApp us anytime if you need changes or assistance.</p>
                </div>
              </div>

              {/* Primary CTAs */}
              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                <Link
                  to={`/track-order?id=${encodeURIComponent(ref)}`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand text-white px-5 py-3 hover:bg-brand-dark"
                >
                  <Truck className="h-5 w-5" />
                  Track order
                </Link>
                <Link
                  to={`/order/success/${encodeURIComponent(ref)}`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border bg-white/70 px-5 py-3 hover:bg-white"
                >
                  <Receipt className="h-5 w-5" />
                  View receipt
                </Link>
                <Link
                  to="/me/orders"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border bg-white/70 px-5 py-3 hover:bg-white"
                >
                  My orders
                </Link>
              </div>

              {/* Secondary actions */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm">
                <button onClick={shareRef} className="inline-flex items-center gap-1.5 rounded-lg border bg-white/70 px-3 py-2 hover:bg-white">
                  <Share2 className="h-4 w-4" />
                  Share
                </button>
                <button onClick={printPage} className="inline-flex items-center gap-1.5 rounded-lg border bg-white/70 px-3 py-2 hover:bg-white">
                  <Printer className="h-4 w-4" />
                  Print
                </button>
                <Link to="/" className="inline-flex items-center gap-1.5 rounded-lg border bg-white/70 px-3 py-2 hover:bg-white">
                  <Home className="h-4 w-4" />
                  Home
                </Link>
                <Link to="/shop" className="inline-flex items-center gap-1.5 rounded-lg border bg-white/70 px-3 py-2 hover:bg-white">
                  Continue shopping
                </Link>
              </div>
            </div>
          </div>

          {/* Helpful note */}
          <p className="mx-auto max-w-2xl text-center text-xs text-gray-500 mt-4">
            Tip: Save your reference number above. You can track your order anytime from the link provided.
          </p>
        </div>
      </Container>
    </section>
  );
}
