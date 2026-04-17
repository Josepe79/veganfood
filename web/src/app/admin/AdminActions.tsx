"use client";
import { useState } from "react";
import { marcarPedidosComoComprados } from "./actions";

export function AdminActions({ recordCount }: { recordCount: number }) {
  const [loading, setLoading] = useState(false);

  const handleComprar = async () => {
    if (!confirm(`¿Confirmas que ya has comprado estas ${recordCount} referencias en Feliubadaló? Esto moverá los pedidos a la cola de envío.`)) return;
    
    setLoading(true);
    try {
      const res = await fetch("/api/admin/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "MARK_PURCHASED" })
      });
      const result = await res.json();
      
      if (result.status === "success") {
        alert("¡Pedidos procesados! La lista de pendientes se ha vaciado.");
      } else {
        alert("Error: " + result.message);
      }
    } catch (e: any) {
      alert("Error de conexión: " + e.message);
    } finally {
      setLoading(false);
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
