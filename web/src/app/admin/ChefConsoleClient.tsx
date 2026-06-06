"use client";
import { useState } from "react";
import { Sparkles, Loader2, CheckCircle, ChefHat, Send } from "lucide-react";
import { publishRecipeAction } from "./actions";
import { useRouter } from "next/navigation";

export function ChefConsoleClient({ initialRecipes = [] }: { initialRecipes?: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [result, setResult] = useState<null | { count: number }>(null);

  const generate = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/recipes/generate", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setResult(data);
        router.refresh();
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
    <div className="glass p-8 border-emerald-500/30 rounded-3xl bg-emerald-950/5">
        <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500">
                <ChefHat size={24} />
            </div>
            <div>
                <h2 className="text-2xl font-bold text-white">Consola del Chef IA</h2>
                <p className="text-sm text-slate-400">Motor de Gemini + FLUX.1. Crea nuevas recetas automáticamente usando ingredientes de la tienda.</p>
            </div>
        </div>

        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700/50">
            {loading ? (
            <div className="flex flex-col items-center gap-4 py-6">
                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                <p className="text-emerald-400 font-bold animate-pulse text-sm">Inventando recetas y renderizando en 4k...</p>
            </div>
            ) : result ? (
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-xl text-center">
                <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                <h3 className="text-white font-bold">¡Éxito total!</h3>
                <p className="text-slate-300 text-sm mt-1">Se han generado e insertado {result.count} nuevas recetas.</p>
                <button 
                onClick={() => setResult(null)}
                className="mt-4 text-emerald-400 font-bold uppercase text-xs tracking-widest hover:underline"
                >
                Generar más
                </button>
            </div>
            ) : (
            <button 
                onClick={generate}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl shadow-xl shadow-emerald-900/20 flex items-center justify-center gap-3 transition-all transform hover:scale-[1.01]"
            >
                <Sparkles size={20} />
                GENERAR 3 RECETAS NUEVAS
            </button>
            )}
        </div>

        {/* LISTA DE RECETAS PARA PUBLICAR */}
        {initialRecipes.length > 0 && (
          <div className="mt-8 space-y-4">
            <h3 className="text-white font-bold mb-4">Últimas Recetas Generadas</h3>
            {initialRecipes.map((recipe) => (
              <div key={recipe.id} className="bg-slate-900/80 border border-slate-700 rounded-xl p-4 flex gap-4 items-start">
                {recipe.imagen && (
                  <img src={recipe.imagen} alt={recipe.nombre} className="w-24 h-24 object-cover rounded-lg flex-shrink-0" />
                )}
                <div className="flex-1">
                  <h4 className="text-white font-bold">{recipe.nombre}</h4>
                  {recipe.socialCopy ? (
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2 italic">"{recipe.socialCopy}"</p>
                  ) : (
                    <p className="text-xs text-red-400 mt-2">Sin texto para redes.</p>
                  )}
                </div>
                <button
                  onClick={async () => {
                    setPublishingId(recipe.id);
                    const res = await publishRecipeAction(recipe.id);
                    console.log("Respuesta Ayrshare:", res);
                    if(res.success) {
                        alert("¡Publicado en Ayrshare! Revisa la consola o tu cuenta de Ayrshare para confirmar. IDs: " + JSON.stringify(res.result?.postIds || []));
                    } else {
                        alert("Error de Ayrshare: " + res.error);
                    }
                    setPublishingId(null);
                  }}
                  disabled={publishingId === recipe.id || !recipe.socialCopy}
                  className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-all"
                >
                  {publishingId === recipe.id ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  Publicar
                </button>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}
