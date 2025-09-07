// src/components/product/ProductGallery.tsx
import { useRef, useState } from "react";
import { Img } from "@/lib/api";
import { ChevronLeft, ChevronRight, PlayCircle } from "lucide-react";

type Props = { images: Img[]; alt: string };

const FALLBACK = "https://picsum.photos/seed/talex/800/600";
const isVideo = (url: string) => /\.(mp4|webm|ogg)(\?|#|$)/i.test(url);

export default function ProductGallery({ images, alt }: Props) {
  const safe = images?.length ? images : [{ url: FALLBACK }];
  const [i, setI] = useState(0);
  const wrap = (n: number) => (n + safe.length) % safe.length;
  const go = (delta: number) => setI((cur) => wrap(cur + delta));

  // touch swipe
  const startX = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (startX.current == null) return;
    const dx = e.changedTouches[0].clientX - startX.current;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    startX.current = null;
  };

  // keyboard nav on media
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") go(1);
    if (e.key === "ArrowLeft") go(-1);
    if (e.key === "Home") setI(0);
    if (e.key === "End") setI(safe.length - 1);
  };

  const current = safe[i]?.url || FALLBACK;

  return (
    <div className="space-y-4">
      {/* Media area */}
      <div
        className="relative group overflow-hidden rounded-2xl border bg-white/70"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Maintain premium aspect on all screens */}
        <div
          className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-gray-50"
          tabIndex={0}
          onKeyDown={onKeyDown}
          aria-live="polite"
          aria-label="Product media viewer"
        >
          {/* current media */}
          {isVideo(current) ? (
            <video
              key={current}
              className="absolute inset-0 h-full w-full object-cover"
              src={current}
              controls
              playsInline
              preload="metadata"
              poster={safe.find((m) => !isVideo(m.url))?.url || FALLBACK}
            />
          ) : (
            <img
              key={current}
              src={current}
              alt={alt}
              className="absolute inset-0 h-full w-full object-cover"
              loading="eager"
              onError={(e) => ((e.currentTarget.src = FALLBACK), (e.currentTarget.onerror = null))}
            />
          )}

          {/* Overlay gradient for legibility */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/10 to-transparent" />

          {/* Prev/Next (show if multiple images) */}
          {safe.length > 1 && (
            <>
              <button
                aria-label="Previous image"
                onClick={() => go(-1)}
                className="absolute left-3 top-1/2 -translate-y-1/2 hidden sm:flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 ring-1 ring-black/10 hover:bg-white transition shadow-md"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                aria-label="Next image"
                onClick={() => go(1)}
                className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 ring-1 ring-black/10 hover:bg-white transition shadow-md"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Video badge */}
          {isVideo(current) && (
            <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-[11px] text-white">
              <PlayCircle className="h-3.5 w-3.5" /> Video
            </span>
          )}
        </div>
      </div>

      {/* Thumbnails – scroll row on mobile, grid on md+ */}
      <div className="md:grid md:grid-cols-5 md:gap-2 flex gap-2 overflow-x-auto no-scrollbar snap-x snap-mandatory">
        {safe.map((img, idx) => {
          const active = idx === i;
          const vid = isVideo(img.url);
          return (
            <button
              key={img.url + idx}
              onClick={() => setI(idx)}
              className={`relative shrink-0 snap-start md:snap-none rounded-xl overflow-hidden border transition
                ${active ? "ring-2 ring-brand" : "opacity-85 hover:opacity-100"}
              `}
              style={{ width: "min(24%, 110px)" }} // mobile width; ignored on md grid
              aria-label={`Show ${vid ? "video" : "image"} ${idx + 1}`}
            >
              <div className="h-20 w-[110px] md:w-auto md:h-20">
                {vid ? (
                  <div className="relative h-full w-full">
                    <video
                      className="h-full w-full object-cover pointer-events-none"
                      src={img.url}
                      preload="metadata"
                      muted
                    />
                    <div className="absolute inset-0 bg-black/20" />
                    <PlayCircle className="absolute right-1.5 bottom-1.5 h-4 w-4 text-white drop-shadow" />
                  </div>
                ) : (
                  <img
                    src={img.url}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                    onError={(e) => ((e.currentTarget.src = FALLBACK), (e.currentTarget.onerror = null))}
                  />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
