// src/components/ui/SplashScreen.tsx
import { BRAND } from "@/lib/brand";

export default function SplashScreen() {
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white">
      <div className="w-full max-w-sm px-8">
        {/* Brand mark */}
        <div className="mx-auto mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-brand-dark shadow-xl">
          <span className="text-2xl font-extrabold">T</span>
        </div>

        {/* Title */}
        <div className="text-center">
          <h1 className="text-xl font-semibold tracking-tight">{BRAND.name}</h1>
          <p className="mt-1 text-sm text-white/80">
            Setting things up for you…
          </p>
        </div>

        {/* Loader */}
        <div className="mt-6 flex flex-col items-center gap-4">
          {/* Spinner */}
          <div className="h-8 w-8 rounded-full border-2 border-white/20 border-t-white/90 animate-spin" />

          {/* Progress bar (indeterminate) */}
          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full w-1/3 rounded-full bg-white/50 animate-[slide_1.4s_ease-in-out_infinite]" />
          </div>

          <p className="text-xs text-white/60">Please wait a moment</p>
        </div>
      </div>
    </div>
  );
}
