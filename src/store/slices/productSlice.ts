import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api, Product } from "@/lib/api";

type Status = "idle" | "loading" | "success" | "error";
type State = { products: Product[]; status: Status; error?: string };

const initial: State = { products: [], status: "idle" };

export const loadProducts = createAsyncThunk("product/load", async () => {
  await api.seedIfEmpty();
  return await api.products.list();
});

const slice = createSlice({
  name: "product",
  initialState: initial,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(loadProducts.pending, (s) => { s.status = "loading"; });
    b.addCase(loadProducts.fulfilled, (s, a) => { s.status = "success"; s.products = a.payload; });
    b.addCase(loadProducts.rejected, (s, a) => { s.status = "error"; s.error = a.error.message; });
  },
});

export default slice.reducer;
