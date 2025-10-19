import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { CartProvider } from "@/components/cart-context";
import { Toaster } from "@/components/ui/toaster";

createRoot(document.getElementById("root")!).render(
  <CartProvider>
    <>
      <App />
      <Toaster /> {/* ✅ Sekarang semua halaman (/, /cart, /checkout, /admin) bisa pakai toast */}
    </>
  </CartProvider>
);
