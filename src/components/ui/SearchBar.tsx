import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SUGGESTIONS = [
  "Steering wheel cover",
  "Wiper blades",
  "Car mats",
  "Dash cam",
  "Tyre inflator",
  "Polishing kit",
  "Angle grinder",
  "Cordless drill",
];

export default function SearchBar({
  placeholder = "Search car accessories, tools…",
}) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const nav = useNavigate();
  const anchorRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return SUGGESTIONS.slice(0, 6);
    return SUGGESTIONS.filter((s) => s.toLowerCase().includes(term)).slice(0, 6);
  }, [q]);

  // Position the dropdown with the input's bounding rect
  const updateRect = () => {
    if (!anchorRef.current) return;
    const r = anchorRef.current.getBoundingClientRect();
    setRect(r);
  };

  useEffect(() => {
    updateRect();
    const handleClick = (e: MouseEvent) => {
      if (!anchorRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const handleResize = () => updateRect();
    const handleScroll = () => updateRect();

    window.addEventListener("click", handleClick);
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("click", handleClick);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const go = (term: string) => {
    setOpen(false);
    nav(`/shop?search=${encodeURIComponent(term || q)}`);
  };

  return (
    <>
      <div ref={anchorRef} className="mx-auto w-full max-w-2xl relative z-10">
        <div className="flex items-center gap-2 rounded-2xl bg-white/90 backdrop-blur px-3 py-2 border shadow-soft">
          <Search className="h-5 w-5 text-gray-500" />
          <input
            id="global-search-input"
            className="w-full bg-transparent outline-none placeholder:text-gray-500"
            placeholder={placeholder}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setOpen(true);
              setHi(0);
              updateRect();
            }}
            onFocus={() => {
              setOpen(true);
              updateRect();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") return go(filtered[hi] ?? q);
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setHi((p) => Math.min(p + 1, filtered.length - 1));
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setHi((p) => Math.max(p - 1, 0));
              }
              if (e.key === "Escape") setOpen(false);
            }}
          />
          <button className="btn-primary px-5 py-2 rounded-xl" onClick={() => go(q)}>
            Search
          </button>
        </div>
      </div>

      {/* Portal dropdown so it can float above everything */}
      {open && filtered.length > 0 && rect &&
        createPortal(
          <div
            style={{
              position: "fixed",
              left: rect.left,
              top: rect.bottom + 6, // small gap below input
              width: rect.width,
              zIndex: 9999,
            }}
            className="overflow-auto max-h-72 rounded-b-2xl border border-t-0 bg-white shadow-xl"
          >
            {filtered.map((s, i) => (
              <button
                key={s}
                onClick={() => go(s)}
                className={`w-full text-left px-4 py-2 text-sm ${
                  i === hi ? "bg-gray-100" : "hover:bg-gray-50"
                }`}
              >
                {s}
              </button>
            ))}
          </div>,
          document.body
        )}
    </>
  );
}