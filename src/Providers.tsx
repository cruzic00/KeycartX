// Port of app/providers.tsx.
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { ToastProvider } from "./context/ToastContext";
import SmoothScroll from "./components/SmoothScroll";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SmoothScroll>
      <AuthProvider>
        <ToastProvider>
          <CartProvider>{children}</CartProvider>
        </ToastProvider>
      </AuthProvider>
    </SmoothScroll>
  );
}
