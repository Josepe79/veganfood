"use client";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

export function Nav() {
  const { cartTotalItems } = useCart();

  return (
    <nav className="fixed w-full top-0 z-50 glass rounded-none border-t-0 border-x-0 !bg-slate-900/60 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center transform rotate-3 hover:rotate-6 transition-all shadow-lg shadow-primary/30">
            <span className="text-white font-bold text-xl">V</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">VeganFood<span className="text-primary">.es</span></span>
        </Link>
        
        <div className="hidden lg:flex items-center gap-5 font-medium text-[13px] uppercase tracking-wider text-slate-300">
          <Link href="/?q=semilla" className="hover:text-emerald-400 transition-colors">Bio Despensa</Link>
          <Link href="/?q=veg" className="hover:text-emerald-400 transition-colors">Sustitutos</Link>
          <Link href="/?q=chocolate" className="hover:text-emerald-400 transition-colors">Snacks & Dulces</Link>
          <Link href="/?q=proteina" className="hover:text-emerald-400 transition-colors">Suplementación</Link>
          <Link href="/?q=flash" className="text-purple-400 hover:text-purple-300 transition-colors font-black flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
            Ofertas Flash
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          <Link href="/checkout" className="relative p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer group">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300 group-hover:text-primary transition-colors"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
            {cartTotalItems > 0 && (
              <span className="absolute top-0 right-0 w-5 h-5 bg-primary text-[10px] flex items-center justify-center rounded-full font-bold text-white shadow-sm border border-slate-900 animate-pulse">
                {cartTotalItems > 99 ? '99+' : cartTotalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  )
}
