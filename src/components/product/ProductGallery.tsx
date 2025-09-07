// src/components/product/ProductGallery.tsx
import { useEffect, useRef, useState } from "react";
import { Img } from "@/lib/api";
import { ChevronLeft, ChevronRight, PlayCircle, Maximize2, X } from "lucide-react";

type Props = { images: Img[]; alt: string };

const FALLBACK = "https://picsum.photos/seed/talex/800/600";
const isVideo = (url: string) => /\.(mp4|webm|ogg)(\?|#|$)/i.test(url);

export default function ProductGallery({ images, alt }: Props) {
  const safe = images?.length ? images : [{ url: FALLBACK }];
  const [i, setI] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const wrap = (n: number) => (n + safe.length) % safe.length;
  const go = (delta: number) => setI((cur) => wrap(cur + delta));
  const current = safe[i]?.url || FALLBACK;

  /* ---------- touch swipe (main + lightbox) ---------- */
  const startX = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => (startX.current = e.touches[0].clientX);
  const onTouchEnd = (e: React.TouchEvent) => {
    if (startX.current == null) return;
    const dx = e.changedTouches[0].clientX - startX.current;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    startX.current = null;
  };

  /* ---------- keyboard nav ---------- */
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") go(1);
    if (e.key === "ArrowLeft") go(-1);
    if (e.key === "Home") setI(0);
    if (e.key === "End") setI(safe.length - 1);
    if (e.key === "Escape" && lightbox) setLightbox(false);
  };

  /* ---------- preload neighbors (images only) ---------- */
  useEffect(() => {
    const next = safe[wrap(i + 1)]?.url;
    const prev = safe[wrap(i - 1)]?.url;
    [next, prev].forEach((u) => {
      if (u && !isVideo(u)) {
        const img = new Image();
        img.src = u;
      }
    });
  }, [i, safe.length]);

  /* ---------- lock body scroll when lightbox open ---------- */
  useEffect(() => {
    const prev = document.body.style.overflow;
    if (lightbox) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [lightbox]);

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
          aria-roledescription="carousel"
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
              className="absolute inset-0 h-full w-full object-cover select-none"
              loading="eager"
              decoding="async"
              draggable={false}
              onError={(e) => ((e.currentTarget.src = FALLBACK), (e.currentTarget.onerror = null))}
            />
          )}

          {/* Overlay gradient for legibility */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/10 to-transparent" />

          {/* Prev/Next (show if multiple images) */}
          {safe.length > 1 && (
            <>
              <button
                aria-label="Previous media"
                onClick={() => go(-1)}
                className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 ring-1 ring-black/10 hover:bg-white transition shadow-md focus:outline-none focus-visible:ring-2"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                aria-label="Next media"
                onClick={() => go(1)}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 ring-1 ring-black/10 hover:bg-white transition shadow-md focus:outline-none focus-visible:ring-2"
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

          {/* Open lightbox */}
          <button
            type="button"
            aria-label="Open fullscreen viewer"
            onClick={() => setLightbox(true)}
            className="absolute right-3 bottom-3 rounded-xl bg-white/80 ring-1 ring-black/10 hover:bg-white transition shadow-md p-2 focus:outline-none focus-visible:ring-2"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Thumbnails – scroll row on mobile, grid on md+ */}
      <div className="md:grid md:grid-cols-5 md:gap-2 flex gap-2 overflow-x-auto scrollbar-none snap-x snap-mandatory -mx-1 px-1">
        {safe.map((img, idx) => {
          const active = idx === i;
          const vid = isVideo(img.url);
          return (
            <button
              key={img.url + idx}
              onClick={() => setI(idx)}
              aria-label={`Show ${vid ? "video" : "image"} ${idx + 1} of ${safe.length}`}
              aria-current={active ? "true" : undefined}
              className={`relative flex-none md:flex-auto snap-start md:snap-none rounded-xl overflow-hidden border transition ring-offset-2 focus:outline-none focus-visible:ring-2
                ${active ? "ring-2 ring-brand" : "opacity-85 hover:opacity-100"}
              `}
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
                    className="h-full w-full object-cover select-none"
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                    onError={(e) => ((e.currentTarget.src = FALLBACK), (e.currentTarget.onerror = null))}
                  />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Lightbox (fullscreen) */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Fullscreen product media viewer"
          onKeyDown={onKeyDown}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <button
            aria-label="Close fullscreen"
            onClick={() => setLightbox(false)}
            className="absolute right-4 top-4 z-10 rounded-xl bg-white/90 p-2 shadow ring-1 ring-black/10 hover:bg-white focus:outline-none focus-visible:ring-2"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Prev / Next */}
          {safe.length > 1 && (
            <>
              <button
                aria-label="Previous media"
                onClick={() => go(-1)}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 rounded-xl bg-white/90 p-2 shadow ring-1 ring-black/10 hover:bg-white focus:outline-none focus-visible:ring-2"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                aria-label="Next media"
                onClick={() => go(1)}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 rounded-xl bg-white/90 p-2 shadow ring-1 ring-black/10 hover:bg-white focus:outline-none focus-visible:ring-2"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Media container */}
          <div className="absolute inset-0 grid place-items-center p-4">
            <div className="relative max-h-full max-w-6xl w-full">
              {isVideo(current) ? (
                <video
                  key={current}
                  className="mx-auto max-h-[80vh] w-full object-contain"
                  src={current}
                  controls
                  autoPlay
                  playsInline
                  preload="metadata"
                  poster={safe.find((m) => !isVideo(m.url))?.url || FALLBACK}
                />
              ) : (
                <img
                  key={current}
                  src={current}
                  alt={alt}
                  className="mx-auto max-h-[80vh] w-full object-contain select-none"
                  loading="eager"
                  decoding="async"
                  draggable={false}
                  onError={(e) => ((e.currentTarget.src = FALLBACK), (e.currentTarget.onerror = null))}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
