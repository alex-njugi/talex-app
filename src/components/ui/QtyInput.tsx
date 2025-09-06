export default function QtyInput({
  value,
  onChange,
}: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="inline-flex items-center rounded-xl border bg-white/70">
      <button type="button" className="px-3 py-2" onClick={() => onChange(Math.max(1, value - 1))}>-</button>
      <input className="w-14 text-center bg-transparent outline-none" type="number" min={1} value={value} onChange={(e)=>onChange(Math.max(1, Number(e.target.value)))} />
      <button type="button" className="px-3 py-2" onClick={() => onChange(value + 1)}>+</button>
    </div>
  );
}
