"use client";
import { useState } from "react";
import { shipOrder } from "./actions";

export function ShipOrderButton({ orderId }: { orderId: string }) {
    const [tracking, setTracking] = useState("");
    const [loading, setLoading] = useState(false);

    const handleShip = async () => {
        if (!tracking) {
            alert("Por favor, introduce un número de seguimiento.");
            return;
        }

        if (!confirm("¿Confirmas que el pedido ha sido entregado al transportista? Se enviará un email al cliente.")) return;

        setLoading(true);
        const result = await shipOrder(orderId, tracking);
        setLoading(false);

        if (result.success) {
            alert("¡Pedido marcado como enviado! Email notificado al cliente.");
        } else {
            alert("Error al procesar el envío: " + result.error);
        }
    };

    return (
        <div className="mt-4 pt-4 border-t border-slate-700/50 flex flex-col gap-2">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Gestión de Salida</p>
            <div className="flex gap-2">
                <input 
                    type="text" 
                    placeholder="Nº Seguimiento (Packlink/MRW...)" 
                    value={tracking}
                    onChange={(e) => setTracking(e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-white text-xs px-3 py-2 rounded-lg flex-grow focus:outline-none focus:border-primary/50"
                />
                <button 
                    onClick={handleShip}
                    disabled={loading}
                    className="bg-primary/20 hover:bg-primary text-primary hover:text-slate-900 border border-primary/30 text-xs font-bold px-4 py-2 rounded-lg transition-all"
                >
                    {loading ? "..." : "Marcar Enviado"}
                </button>
            </div>
        </div>
    );
}
