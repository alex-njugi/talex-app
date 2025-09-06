// src/components/cart/CartFab.tsx
import { ShoppingCart } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import { open } from "@/store/slices/cartSlice";

export default function CartFab() {
  const d = useAppDispatch();
  const count = useAppSelector((s)=>s.cart.totalQty);
  if (count === 0) return null;
  return (
    <button
      onClick={()=>d(open())}
      className="fixed bottom-6 right-6 shadow-xlsoft rounded-full bg-brand text-white h-14 w-14 inline-flex items-center justify-center"
      aria-label="Open cart"
    >
      <ShoppingCart className="h-6 w-6" />
      <span className="absolute -top-1 -right-1 rounded-full bg-white text-brand text-[10px] px-1.5 py-0.5">{count}</span>
    </button>
  );
}