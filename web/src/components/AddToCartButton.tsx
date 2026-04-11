"use client";
import { useCart, CartProduct } from "@/context/CartContext";

export function AddToCartButton({ product }: { product: CartProduct }) {
  const { addToCart } = useCart();

  return (
    <button 
      onClick={() => addToCart(product)}
      className="w-10 h-10 rounded-full flex items-center justify-center transition-all bg-primary text-slate-900 hover:bg-emerald-400 hover:scale-110 shadow-lg shadow-primary/20 cursor-pointer"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
    </button>
  );
}
