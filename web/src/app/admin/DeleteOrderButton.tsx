"use client";

import { useTransition } from "react";
import { deleteOrder } from "./actions";

export function DeleteOrderButton({ orderId }: { orderId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => {
        if (confirm("¿Seguro que quieres descartar este pedido de pruebas?")) {
          startTransition(async () => {
            try {
              const res = await fetch("/api/admin/order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId, action: "DELETE" })
              });
              const result = await res.json();
              if (result.status !== "success") {
                alert("Error: " + result.message);
              }
            } catch (e: any) {
              alert("Error de conexión: " + e.message);
            }
          });
        }
      }}
      disabled={isPending}
      className={`bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded p-1.5 transition-colors ${isPending ? 'opacity-50' : ''}`}
      title="Eliminar Pedido"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
    </button>
  );
}
