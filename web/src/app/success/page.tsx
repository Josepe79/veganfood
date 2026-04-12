"use client";
import Link from "next/link";
import { useEffect } from "react";
import { useCart } from "@/context/CartContext";

export default function SuccessPage() {
  const { clearCart } = useCart();

  useEffect(() => {
    // La pasarela de pago culminó con éxito, limpiamos nuestro carrito en memoria local
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-screen pt-32 pb-10 px-4 flex items-center justify-center fade-in">
      <div className="glass-card max-w-lg w-full p-10 text-center relative overflow-hidden">
        {/* Glow de éxito */}
        <div className="absolute inset-0 bg-emerald-500/10 blur-3xl rounded-full"></div>
        
        <div className="relative z-10">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
            <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-3xl font-black text-white mb-4">¡Pago Completado!</h1>
          <p className="text-slate-300 mb-8 leading-relaxed">
            Hemos recibido tu orden y ya está en fase de preparación logística (JIT). Te notificaremos por correo cuando tu paquete salga hacia destino.
          </p>
          
          <Link href="/" className="inline-block bg-primary text-slate-900 font-bold px-8 py-4 rounded-xl hover:bg-emerald-400 transition-colors shadow-lg shadow-primary/20">
            Seguir Comprando
          </Link>
        </div>
      </div>
    </div>
  );
}
