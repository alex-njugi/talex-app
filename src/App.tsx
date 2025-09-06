// src/App.tsx
import { Outlet, Route, Routes } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Home from "@/pages/Home";

import CartDrawer from "@/components/cart/CartDrawer";
import CartFab from "@/components/cart/CartFab";
import WhatsAppFab from "@/components/ui/WhatsAppFab";
import { Toaster } from "react-hot-toast";

import Shop from "@/pages/Shop";
import Product from "@/pages/Product";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import OrderSuccess from "@/pages/OrderSuccess";
import About from "@/pages/About";
import TrackOrder from "@/pages/TrackOrder";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Orders from "@/pages/Orders";
import NotFound from "@/pages/NotFound";

import AdminDashboard from "@/pages/admin/Dashboard";
import AdminProducts from "@/pages/admin/Products";
import AdminProductCreate from "@/pages/admin/ProductCreate";
import AdminProductEdit from "@/pages/admin/ProductEdit";
import AdminOrdersPage from "@/pages/admin/Orders";
import AdminOrderDetail from "@/pages/admin/OrderDetail";

import { useEffect, useState } from "react";
import { useAppDispatch } from "@/store";
import { loadProducts } from "@/store/slices/productSlice";
import { api } from "@/lib/api";
import SplashScreen from "@/components/ui/SplashScreen";

function Shell() {
  const d = useAppDispatch();
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        // Ensure mock has data (noop on real API)
        await api.seedIfEmpty();
        // Load products to store
        await d(loadProducts() as any);
        // Tiny delay for a smooth UX
        await new Promise((r) => setTimeout(r, 300));
      } finally {
        if (alive) setBooted(true);
      }
    })();
    return () => { alive = false; };
  }, [d]);

  if (!booted) return <SplashScreen />;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1"><Outlet /></main>
      <Footer />
      <CartFab />
      <CartDrawer />
      <WhatsAppFab />
      <Toaster position="top-center" />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<Shell />}>
        {/* public */}
        <Route index element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:slug" element={<Product />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order/success/:id" element={<OrderSuccess />} />

        {/* auth + account */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/me/orders" element={<Orders />} />

        {/* utilities */}
        <Route path="/track-order" element={<TrackOrder />} />

        {/* admin */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="/admin/products/new" element={<AdminProductCreate />} />
        <Route path="/admin/products/:id/edit" element={<AdminProductEdit />} />
        <Route path="/admin/orders" element={<AdminOrdersPage />} />
        <Route path="/admin/orders/:id" element={<AdminOrderDetail />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
