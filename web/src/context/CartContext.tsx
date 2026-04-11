"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface CartProduct {
  id: string;
  nombre: string;
  marca: string;
  precioVenta: number;
  imagen: string | null;
  ean: string | null;
}

export interface CartItem {
  product: CartProduct;
  quantity: number;
}

interface CartContextProps {
  items: CartItem[];
  addToCart: (product: CartProduct) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  cartTotalAmount: number;
  cartTotalItems: number;
  clearCart: () => void;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load state from local storage on mount
    const saved = localStorage.getItem("veganfood_cart");
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch(e) {}
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if(mounted) {
      localStorage.setItem("veganfood_cart", JSON.stringify(items));
    }
  }, [items, mounted]);

  const addToCart = (product: CartProduct) => {
    setItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems(prev => prev.map(item => 
      item.product.id === productId ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => setItems([]);

  const cartTotalAmount = items.reduce((total, item) => total + (item.product.precioVenta * item.quantity), 0);
  const cartTotalItems = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      items, addToCart, removeFromCart, updateQuantity, cartTotalAmount, cartTotalItems, clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
