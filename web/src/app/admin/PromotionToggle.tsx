"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { togglePromotion } from "./actions";

export function PromotionToggle({ productId, isPromoted, productName }: { productId: string; isPromoted: boolean; productName: string }) {
    const router = useRouter();
    const [promoted, setPromoted] = useState(isPromoted);
    const [loading, setLoading] = useState(false);

    const handleToggle = async () => {
        setLoading(true);
        const result = await togglePromotion(productId, !promoted);
        if (result.success) {
            setPromoted(!promoted);
            router.refresh(); // Sincroniza el resto de la página
        }
        setLoading(false);
    };

    return (
        <button
            onClick={handleToggle}
            disabled={loading}
            title={promoted ? "Quitar de Destacados" : "Añadir a Destacados"}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                promoted
                    ? "bg-yellow-400/20 text-yellow-400 border border-yellow-400/50 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/50"
                    : "bg-slate-800 text-slate-500 border border-slate-700 hover:bg-yellow-400/20 hover:text-yellow-400 hover:border-yellow-400/50"
            } ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
            {loading ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
            ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill={promoted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
            )}
        </button>
    );
}
