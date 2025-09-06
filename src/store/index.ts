import { configureStore } from "@reduxjs/toolkit";
import product from "./slices/productSlice";
import cart from "./slices/cartSlice";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

const LS_CART = "talex:cart";
const preloadedCart =
  (() => { try { return JSON.parse(localStorage.getItem(LS_CART) || "null"); } catch { return null; } })() || undefined;

export const store = configureStore({
  reducer: { product, cart },
  preloadedState: preloadedCart ? { cart: preloadedCart } : undefined,
});

store.subscribe(() => {
  const state = store.getState() as any;
  localStorage.setItem(LS_CART, JSON.stringify(state.cart));
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
