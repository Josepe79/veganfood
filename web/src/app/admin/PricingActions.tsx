"use client";

import { useState, useTransition } from "react";
import { hideProduct, updateProductPrice, recoverProduct, togglePromotion } from "./actions";

export function PricingActions({ 
    productId, 
    currentPrice, 
    oculto, 
    enPromocion,
    onGenerateSocial,
    isGeneratingSocial = false
}: { 
    productId: string, 
    currentPrice: number, 
    oculto: boolean, 
    enPromocion: boolean,
    onGenerateSocial?: () => void,
    isGeneratingSocial?: boolean
}) {
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const [newPrice, setNewPrice] = useState(currentPrice.toString());

  const handleHide = () => {
      if (confirm("¿Seguro que deseas ocultar este producto indefinidamente de forma manual?")) {
          startTransition(() => {
              hideProduct(productId);
          });
      }
  };

  const handleRecover = () => {
      startTransition(() => {
          recoverProduct(productId);
      });
  };

  const handleTogglePromo = () => {
      startTransition(() => {
          togglePromotion(productId, !enPromocion);
      });
  };

  const handleSavePrice = () => {
      const parsed = parseFloat(newPrice);
      if (!isNaN(parsed)) {
          startTransition(() => {
              updateProductPrice(productId, parsed);
              setIsEditing(false);
          });
      }
  };

  if (isEditing) {
      return (
          <div className="flex items-center gap-1">
              <input 
                  type="number" 
                  step="0.01" 
                  value={newPrice} 
                  onChange={(e) => setNewPrice(e.target.value)} 
                  className="w-16 bg-slate-800 text-white text-xs px-1 py-1 rounded"
              />
              <button disabled={isPending} onClick={handleSavePrice} className="bg-blue-500 hover:bg-blue-400 text-white text-xs px-2 py-1 rounded flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </button>
              <button disabled={isPending} onClick={() => setIsEditing(false)} className="bg-slate-700 hover:bg-slate-600 text-white text-xs px-2 py-1 rounded">
                   <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
          </div>
      )
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={onGenerateSocial}
        disabled={isGeneratingSocial || isPending}
        title="Generar Vídeo Social con IA"
        className={`flex items-center gap-1.5 transition-all px-2.5 py-1.5 rounded-lg border shadow-sm ${
            isGeneratingSocial 
            ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400' 
            : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-400/30'
        } ${(isGeneratingSocial || isPending) ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
      >
        {isGeneratingSocial ? (
            <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        ) : (
            <>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
                <span className="text-[10px] font-bold uppercase tracking-tight">Vídeo IA</span>
            </>
        )}
      </button>

      <button
        onClick={() => setIsEditing(true)}
        disabled={isPending}
        title="Modificar Precio Manualmente"
        className={`bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded p-1.5 transition-colors ${isPending ? 'opacity-50' : ''}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="16 3 21 8 8 21 3 21 3 16 16 3"></polygon></svg>
      </button>
      <button
        onClick={handleTogglePromo}
        disabled={isPending}
        title={enPromocion ? "Quitar de Promociones" : "Destacar en Promociones"}
        className={`bg-purple-500/10 hover:bg-purple-500/20 ${enPromocion ? 'text-purple-300 border-purple-500/80 shadow-[0_0_10px_purple]' : 'text-purple-500 border-purple-500/30'} border rounded p-1.5 transition-all ${isPending ? 'opacity-50' : ''}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill={enPromocion ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
      </button>

      {oculto ? (
        <button
          onClick={handleRecover}
          disabled={isPending}
          title="Recuperar a la Tienda (Volver a Mostrar)"
          className={`bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded p-1.5 transition-colors ${isPending ? 'opacity-50' : ''}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
        </button>
      ) : (
        <button
          onClick={handleHide}
          disabled={isPending}
          title="Ocultar de la Web"
          className={`bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 rounded p-1.5 transition-colors ${isPending ? 'opacity-50' : ''}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle><line x1="1" y1="1" x2="23" y2="23"></line></svg>
        </button>
      )}
    </div>
  );
}
