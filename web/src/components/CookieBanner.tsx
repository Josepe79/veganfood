"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setShowBanner(false);
  };

  const declineCookies = () => {
    localStorage.setItem("cookie-consent", "declined");
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 z-[100] md:max-w-xl animate-slide-up">
      <div className="glass-card rounded-2xl p-6 shadow-2xl border border-white/10 bg-slate-900/95 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-white font-bold mb-1">Tu privacidad nos importa 🌱</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              En VeganFood.es utilizamos cookies propias y de terceros para mejorar tu experiencia, analizar el tráfico y mostrarte contenido personalizado. 
              Puedes aceptar todas las cookies o configurar tus preferencias. Consulta nuestra <Link href="/politica-privacidad" className="text-primary hover:underline font-bold">Política de Cookies</Link>.
            </p>
          </div>
          <div className="flex flex-col gap-2 w-full md:w-auto">
            <button
              onClick={acceptCookies}
              className="px-6 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
            >
              Aceptar Todo
            </button>
            <button
              onClick={declineCookies}
              className="px-6 py-2 bg-slate-800 text-slate-400 text-xs font-bold rounded-lg hover:bg-slate-700 transition-all border border-white/5"
            >
              Rechazar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
