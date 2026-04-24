"use client";
import { useState } from "react";
import { Sparkles, Loader2, CheckCircle, ChefHat } from "lucide-react";

export default function AdminPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<null | { count: number }>(null);

  const generate = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/generate", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setResult(data);
      } else {
        alert("Error: " + data.error);
      }
    } catch (e) {
      alert("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-20 max-w-2xl">
      <div className="glass p-10 text-center">
        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
          <ChefHat size={32} />
        </div>
        <h1 className="text-3xl font-black text-white mb-4">Consola del Chef IA</h1>
        <p className="text-slate-400 mb-10">
          Usa el motor de Gemini para crear nuevas recetas basadas en los productos actuales de VeganFood.es
        </p>

        {loading ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-emerald-400 font-bold animate-pulse">Cocinando nuevas ideas...</p>
          </div>
        ) : result ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-2xl mb-8">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-white font-bold text-xl">¡Éxito total!</h2>
            <p className="text-slate-300 mt-2">Se han generado e insertado {result.count} nuevas recetas.</p>
            <button 
              onClick={() => setResult(null)}
              className="mt-6 text-primary font-bold uppercase text-xs tracking-widest hover:underline"
            >
              Generar más
            </button>
          </div>
        ) : (
          <button 
            onClick={generate}
            className="w-full bg-primary hover:bg-emerald-600 text-white font-black py-4 rounded-xl shadow-xl shadow-primary/20 flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02]"
          >
            <Sparkles size={20} />
            GENERAR 3 RECETAS NUEVAS
          </button>
        )}

        <div className="mt-12 pt-8 border-t border-white/5 flex justify-center gap-8">
          <a href="/" className="text-xs font-bold text-slate-500 hover:text-white uppercase tracking-tighter transition-colors">Volver a la web</a>
          <a href="https://veganfood.es" className="text-xs font-bold text-slate-500 hover:text-white uppercase tracking-tighter transition-colors">Ir a la tienda</a>
        </div>
      </div>
    </div>
  );
}
