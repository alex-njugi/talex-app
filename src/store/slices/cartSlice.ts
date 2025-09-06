import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type CartItem = {
  id: string;
  title: string;
  price_cents: number;
  qty: number;
  image?: string;
};
type CartState = {
  items: CartItem[];
  total_cents: number;
  totalQty: number;
  isOpen: boolean;
};
const initial: CartState = { items: [], total_cents: 0, totalQty: 0, isOpen: false };

const recalc = (s: CartState) => {
  s.total_cents = s.items.reduce((a, b) => a + b.price_cents * b.qty, 0);
  s.totalQty = s.items.reduce((a, b) => a + b.qty, 0);
};

const slice = createSlice({
  name: "cart",
  initialState: initial,
  reducers: {
    add(s, a: PayloadAction<CartItem>) {
      const i = s.items.findIndex(x => x.id === a.payload.id);
      if (i >= 0) s.items[i].qty += a.payload.qty;
      else s.items.unshift(a.payload);
      recalc(s); s.isOpen = true;
    },
    remove(s, a: PayloadAction<string>) {
      s.items = s.items.filter(x => x.id !== a.payload); recalc(s);
    },
    setQty(s, a: PayloadAction<{ id: string; qty: number }>) {
      const it = s.items.find(x => x.id === a.payload.id);
      if (it) it.qty = Math.max(1, a.payload.qty); recalc(s);
    },
    clear(s) { s.items = []; recalc(s); },
    open(s) { s.isOpen = true; },
    close(s) { s.isOpen = false; },
  },
});

export const { add, remove, setQty, clear, open, close } = slice.actions;
export default slice.reducer;
