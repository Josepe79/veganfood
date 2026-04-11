"use client";
import { useState } from "react";
import { marcarPedidosComoComprados } from "./actions";

export function AdminActions({ recordCount }: { recordCount: number }) {
  const [loading, setLoading] = useState(false);

  const handleComprar = async () => {
    if (!confirm(`¿Confirmas que ya has comprado estas ${recordCount} referencias en Feliubadaló? Esto moverá los pedidos a la cola de envío.`)) return;
    
    setLoading(true);
    const result = await marcarPedidosComoComprados();
    setLoading(false);
    
    if (result.success) {
      alert("¡Pedidos procesados! La lista de pendientes se ha vaciado.");
    } else {
      alert("Error procesando los pedidos.");
    }
  };

  return (
    <button 
      onClick={handleComprar}
      disabled={loading}
      className="bg-primary hover:bg-emerald-400 text-slate-900 font-bold px-6 py-3 rounded-xl transition-all shadow-lg hover:-translate-y-1"
    >
      {loading ? "Procesando BD..." : "✓ Marcar Macropedido como Realizado"}
    </button>
  );
}
