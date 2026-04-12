"use client";

import { useState, useTransition } from "react";
import { hideProduct, updateProductPrice } from "./actions";

export function PricingActions({ productId, currentPrice }: { productId: string, currentPrice: number }) {
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
        onClick={() => setIsEditing(true)}
        disabled={isPending}
        title="Modificar Precio Manualmente"
        className={`bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded p-1.5 transition-colors ${isPending ? 'opacity-50' : ''}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="16 3 21 8 8 21 3 21 3 16 16 3"></polygon></svg>
      </button>
      <button
        onClick={handleHide}
        disabled={isPending}
        title="Ocultar de la Web"
        className={`bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 rounded p-1.5 transition-colors ${isPending ? 'opacity-50' : ''}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle><line x1="1" y1="1" x2="23" y2="23"></line></svg>
      </button>
    </div>
  );
}
