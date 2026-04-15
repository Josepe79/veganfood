"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function PromotionReset() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleReset = async () => {
        if (!confirm("⚠️ ¿ESTÁS SEGURO? Esto quitará la estrella de destacados de TODOS los productos de la tienda ahora mismo (Limpieza Total).")) return;
        
        setLoading(true);
        try {
            const res = await fetch("/api/diag", { method: "POST" });
            const data = await res.json();
            
            if (data.status === "success") {
                alert(`¡Limpieza completada! Se han quitado ${data.count} productos de destacados.`);
                router.refresh(); // Refresca la UI para mostrar 0 destacados
            } else {
                alert("Error de servidor: " + data.message);
            }
        } catch (e: any) {
            alert("Error de conexión: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button 
            onClick={handleReset}
            disabled={loading}
            className="text-[10px] text-red-500/50 hover:text-red-500 font-bold uppercase tracking-widest px-3 py-1 border border-red-500/20 hover:border-red-500/50 rounded-lg transition-all"
        >
            {loading ? "LIMPIANDO..." : "RESET TOTAL DESTACADOS"}
        </button>
    );
}
