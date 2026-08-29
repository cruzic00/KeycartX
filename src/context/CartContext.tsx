// Port of lib/cart.tsx.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";

type CartItem = {
  id: string;
  name: string;
  price: number;
  mrp?: number; // original rate (paisa) for savings display
  image: string;
  size: string;
  qty: number;
};

type CartContextValue = {
  items: CartItem[];
  total: number;
  addItem: (item: Omit<CartItem, "qty">) => void;
  removeItem: (id: string, size: string) => void;
  updateQty: (id: string, size: string, qty: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "tee-store-cart-v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const { user, loading } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);

  // 1. Fetch Cart from Backend on Login
  useEffect(() => {
    async function loadCart() {
      if (loading) return;

      if (user) {
        try {
          const res = await fetch("/api/cart");
          if (res.ok) {
            const data = await res.json();
            setItems(data.cart || []);
          }
        } catch (error) {
          console.error("Failed to load cart", error);
        }
      } else {
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) setItems(JSON.parse(raw));
        } catch {}
      }
      setIsInitialized(true);
    }

    loadCart();
  }, [user, loading]);

  // 2. Save Cart to Backend (or LocalStorage) on Change
  useEffect(() => {
    if (!isInitialized) return;

    const saveCart = async () => {
      if (user) {
        try {
          await fetch("/api/cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cart: items }),
          });
        } catch (error) {
          console.error("Failed to save cart", error);
        }
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      }
    };

    const timeout = setTimeout(saveCart, 500);
    return () => clearTimeout(timeout);
  }, [items, user, isInitialized]);

  const addItem: CartContextValue["addItem"] = useCallback((item) => {
    setItems((prev) => {
      const idx = prev.findIndex((p) => p.id === item.id && p.size === item.size);
      if (idx >= 0) {
        const clone = [...prev];
        clone[idx] = { ...clone[idx], qty: clone[idx].qty + 1 };
        return clone;
      }
      return [...prev, { ...item, qty: 1 }];
    });
  }, []);

  const removeItem = useCallback((id: string, size: string) => {
    setItems((prev) => prev.filter((p) => !(p.id === id && p.size === size)));
  }, []);

  const updateQty = useCallback((id: string, size: string, qty: number) => {
    setItems((prev) => prev.map((p) => (p.id === id && p.size === size ? { ...p, qty } : p)));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const total = useMemo(() => items.reduce((sum, it) => sum + it.price * it.qty, 0), [items]);

  const value: CartContextValue = useMemo(
    () => ({ items, total, addItem, removeItem, updateQty, clear }),
    [items, total, addItem, removeItem, updateQty, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
