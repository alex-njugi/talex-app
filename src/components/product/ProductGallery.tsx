import { useState } from "react";
import { Img } from "@/lib/api";

export default function ProductGallery({ images, alt }: { images: Img[]; alt: string; }) {
  const safe = images?.length ? images : [{ url: "https://picsum.photos/seed/talex/800/600" }];
  const [i, setI] = useState(0);

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-2xl border bg-white/60">
        <img src={safe[i].url} alt={alt} className="w-full h-96 object-cover" loading="lazy" />
      </div>
      <div className="grid grid-cols-5 gap-2">
        {safe.map((img, idx) => (
          <button key={img.url + idx} onClick={() => setI(idx)} className={`rounded-xl overflow-hidden border ${idx === i ? "ring-2 ring-brand" : "opacity-80 hover:opacity-100"}`}>
            <img src={img.url} alt="" className="h-20 w-full object-cover" loading="lazy" />
          </button>
        ))}
      </div>
    </div>
  );
}
