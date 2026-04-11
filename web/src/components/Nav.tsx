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
        
        <div className="hidden md:flex items-center gap-6 font-medium text-sm">
          <Link href="/" className="text-primary border-b-2 border-primary pb-1">Catálogo</Link>
          <a href="#" className="hover:text-primary transition-colors text-slate-300">Novedades</a>
          <a href="#" className="hover:text-primary transition-colors text-slate-300">Promociones</a>
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
          
          <button className="hidden md:block px-5 py-2 bg-gradient-to-r from-primary to-emerald-400 text-slate-900 font-bold rounded-lg hover:shadow-lg hover:shadow-primary/40 hover:-translate-y-0.5 transition-all outline-none">
            Admin
          </button>
        </div>
      </div>
    </nav>
  )
}
