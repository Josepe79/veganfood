"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { hideProductsBulk, promoteProductsBulk, prepareSocialMediaVideo } from "./actions";
import { PricingActions } from "./PricingActions";
import SocialPreviewModal from "./SocialPreviewModal";

type IntelligenceItem = {
    id: string;
    nombre: string;
    marca: string;
    precioOriginal: number;
    precioVenta: number;
    precioCompetencia: number | null;
    competenciaUrl: string | null;
    competenciaNombre: string | null;
    oculto: boolean;
    enPromocion: boolean;
    isNuevo: boolean;
    createdAt: string; // ISO String from server
    videoUrl?: string | null;
    captions?: any | null;
};

export function PricingTableClient({ data }: { data: IntelligenceItem[] }) {
    const [filter, setFilter] = useState<"ALL" | "COMPETITIVO" | "AJUSTABLE" | "CRITICA" | "OCULTO" | "PROMOCION" | "NOVEDADES">("ALL");
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const [socialData, setSocialData] = useState<{ videoUrl: string, captions: any } | null>(null);
    const [generatingSocialId, setGeneratingSocialId] = useState<string | null>(null);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (generatingSocialId) {
            interval = setInterval(() => {
                fetch(`/api/social-status?id=${generatingSocialId}`)
                    .then(r => r.json())
                    .then(data => {
                        if (data.ready) {
                            setSocialData({ videoUrl: data.videoUrl, captions: data.captions });
                            setGeneratingSocialId(null);
                        }
                    })
                    .catch(err => console.error("Error polling social status:", err));
            }, 3000); // Poll once every 3 seconds
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [generatingSocialId]);

    const handleGenerateSocial = (productId: string) => {
        // Optimización masiva: Si el vídeo ya existe en la DB y te lo traje en el data[] de Prisma, ¡ábrelo de inmediato!
        const product = data.find(p => p.id === productId);
        if (product && product.videoUrl) {
            setSocialData({ videoUrl: product.videoUrl, captions: product.captions });
            return;
        }

        setGeneratingSocialId(productId);
        prepareSocialMediaVideo(productId).then(res => {
            if (!res.success) {
                alert("Error técnico de servidor: " + (res.error || "Desconocido"));
                setGeneratingSocialId(null);
            }
            // Si funciona, dejamos que el useEffect haga el Polling del background task.
        }).catch(err => {
            alert("Error de red llamando a la IA. Revisa tu conexión a internet.");
            console.error(err);
            setGeneratingSocialId(null);
        });
    };

    // Enriquecemos los datos calculando su status algorítmico al vuelo para poder filtrarlos
    const enrichedData = data.map(prod => {
        const nuestro = prod.precioVenta;
        const mercado = prod.precioCompetencia; // puede ser null
        const costo = prod.precioOriginal;
        
        let status: "COMPETITIVO" | "AJUSTABLE" | "CRITICA" | "OCULTO" | "PROMOCION" | "SIN_DATO" = "SIN_DATO";
        
        if (prod.oculto) {
            status = "OCULTO";
        } else if (prod.enPromocion) {
            status = "PROMOCION";
        } else if (mercado === null) {
            status = "SIN_DATO";
        } else if (mercado <= costo) {
            status = "CRITICA";
        } else if (mercado < nuestro && mercado > costo) {
            status = "AJUSTABLE";
        } else {
            status = "COMPETITIVO";
        }

        let finalUrl = prod.competenciaUrl || "#";
        if (finalUrl !== "#" && !finalUrl.startsWith("http")) {
            finalUrl = `https://www.google.com/search?q=${encodeURIComponent(prod.nombre + " " + prod.marca)}`;
        }

        const diff = mercado !== null ? mercado - nuestro : null;
        return { ...prod, status, mercado, nuestro, costo, diff, finalUrl };
    });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const filteredData = enrichedData.filter(prod => {
        if (filter === "ALL") return true;
        if (filter === "OCULTO") return prod.oculto;
        if (filter === "PROMOCION") return prod.enPromocion;
        if (filter === "NOVEDADES") return prod.isNuevo;
        return prod.status === filter;
    });

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(new Set(filteredData.map(p => p.id)));
        } else {
            setSelectedIds(new Set());
        }
    };

    const handleSelectOne = (id: string) => {
        const next = new Set(selectedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedIds(next);
    };

    const handleBulkHide = () => {
        if (selectedIds.size === 0) return;
        if (confirm(`¿Purgar los ${selectedIds.size} productos seleccionados directamente de la tienda?`)) {
            startTransition(() => {
                hideProductsBulk(Array.from(selectedIds)).then(() => {
                    setSelectedIds(new Set());
                });
            });
        }
    };

    const handleBulkPromote = () => {
        if (selectedIds.size === 0) return;
        if (confirm(`¿Destacar los ${selectedIds.size} productos seleccionados en la portada principal?`)) {
            startTransition(async () => {
                await promoteProductsBulk(Array.from(selectedIds), true);
                setSelectedIds(new Set());
                router.refresh();
            });
        }
    };

    return (
        <div className="w-full">
            {/* Header Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
                <div className="flex bg-slate-800/50 rounded-lg p-1 border border-slate-700/50 overflow-x-auto max-w-full">
                    <button onClick={() => setFilter("ALL")} className={`px-4 py-2 text-xs rounded-md whitespace-nowrap transition-colors ${filter === "ALL" ? "bg-slate-700 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"}`}>
                        Todos ({enrichedData.length})
                    </button>
                    <button 
                        onClick={() => setFilter("PROMOCION")}
                        className={`px-4 py-2 text-xs rounded-md whitespace-nowrap transition-colors ${filter === "PROMOCION" ? "bg-purple-500/20 text-purple-400 border border-purple-500/30 shadow-[0_0_15px_purple]" : "text-slate-400 hover:text-purple-300"}`}
                    >
                        En Promoción ({enrichedData.filter(p => p.enPromocion && !p.oculto).length})
                    </button>
                    <button 
                        onClick={() => setFilter("NOVEDADES")}
                        className={`px-4 py-2 text-xs rounded-md whitespace-nowrap transition-colors ${filter === "NOVEDADES" ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : "text-slate-400 hover:text-blue-300"}`}
                    >
                        Novedades
                    </button>
                    <button onClick={() => setFilter("CRITICA")} className={`px-4 py-2 text-xs rounded-md whitespace-nowrap transition-colors ${filter === "CRITICA" ? "bg-red-500/20 text-red-400 border border-red-500/30" : "text-slate-400 hover:text-red-300"}`}>
                        Críticos ({enrichedData.filter(p => p.status === "CRITICA").length})
                    </button>
                    <button onClick={() => setFilter("AJUSTABLE")} className={`px-4 py-2 text-xs rounded-md whitespace-nowrap transition-colors ${filter === "AJUSTABLE" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "text-slate-400 hover:text-amber-300"}`}>
                        Ajustables ({enrichedData.filter(p => p.status === "AJUSTABLE").length})
                    </button>
                    <button onClick={() => setFilter("COMPETITIVO")} className={`px-4 py-2 text-xs rounded-md whitespace-nowrap transition-colors ${filter === "COMPETITIVO" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "text-slate-400 hover:text-emerald-300"}`}>
                        Competitivos ({enrichedData.filter(p => !p.oculto && !p.enPromocion && p.mercado !== null && p.costo < p.mercado && p.mercado >= p.nuestro).length})
                    </button>
                    <button onClick={() => setFilter("OCULTO")} className={`px-4 py-2 text-xs rounded-md whitespace-nowrap transition-colors ${filter === "OCULTO" ? "bg-slate-900 text-slate-300 border border-slate-600 shadow-inner" : "text-slate-500 hover:text-slate-300"}`}>
                        Restaurar Ocultos ({enrichedData.filter(p => p.oculto).length})
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    {selectedIds.size > 0 && (
                        <div className="flex gap-2">
                            <button 
                                onClick={handleBulkPromote}
                                disabled={isPending}
                                className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-[0_0_15px_purple] transition-all active:scale-95"
                            >
                                {isPending ? (
                                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                )}
                                Promocionar {selectedIds.size}
                            </button>
                            <button 
                                onClick={() => {
                                    if (selectedIds.size === 0) return;
                                    if (confirm(`¿Quitar la estrella de destacados a estos ${selectedIds.size} productos?`)) {
                                        startTransition(async () => {
                                            await promoteProductsBulk(Array.from(selectedIds), false);
                                            setSelectedIds(new Set());
                                            router.refresh();
                                        });
                                    }
                                }}
                                disabled={isPending}
                                className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 border border-slate-600 transition-all active:scale-95"
                            >
                                Quitar Promoción
                            </button>
                            <button 
                                onClick={() => {
                                    if (selectedIds.size === 0) return;
                                    if (confirm(`¿Purgar los ${selectedIds.size} productos seleccionados directamente de la tienda?`)) {
                                        startTransition(async () => {
                                            await hideProductsBulk(Array.from(selectedIds));
                                            setSelectedIds(new Set());
                                            router.refresh();
                                        });
                                    }
                                }}
                                disabled={isPending}
                                className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-lg shadow-red-900/20 transition-all active:scale-95"
                            >
                                {isPending ? (
                                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                                )}
                                Purgar {selectedIds.size}
                            </button>
                        </div>
                    )}
                </div>

            </div>

            {/* Visual Table */}
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto rounded-lg border border-slate-700/50 bg-slate-900/50">
                <table className="w-full text-left border-collapse text-sm">
                    <thead className="sticky top-0 bg-slate-900 z-10 shadow-md">
                        <tr className="text-slate-500 border-b border-slate-700/50">
                            <th className="py-3 pl-4 pr-2 w-10">
                                <input 
                                    type="checkbox" 
                                    className="rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500/50 accent-blue-500 w-4 h-4"
                                    checked={filteredData.length > 0 && selectedIds.size === filteredData.length}
                                    onChange={handleSelectAll}
                                />
                            </th>
                            <th className="pb-3 pl-2 font-medium">Producto a Examen</th>
                            <th className="pb-3 font-medium text-center">Costo B2B</th>
                            <th className="pb-3 font-medium text-center">Nuestro PVP</th>
                            <th className="pb-3 font-medium text-center">Mercado Google</th>
                            <th className="pb-3 font-medium text-right pr-4">Estado / Delta</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredData.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-12 text-center text-slate-500">
                                    Ningún producto coincide con el filtro seleccionado.
                                </td>
                            </tr>
                        ) : filteredData.map((prod) => {
                            let alertLevel = "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
                            let statusMsg = "Competitivo";
                            
                            if (prod.status === "AJUSTABLE") {
                                alertLevel = "bg-amber-500/10 border-amber-500/30 text-amber-400";
                                statusMsg = "Ajustable";
                            } else if (prod.status === "OCULTO") {
                                alertLevel = "bg-slate-800/80 border-slate-600/50 text-slate-400 opacity-60";
                                statusMsg = "Retirado";
                            } else if (prod.status === "PROMOCION") {
                                alertLevel = "bg-purple-500/10 border-purple-500/50 text-purple-400 font-bold shadow-[0_0_10px_purple]";
                                statusMsg = "En Promoción ✨";
                            } else if (prod.status === "SIN_DATO") {
                                alertLevel = "bg-slate-700/50 border-slate-600/50 text-slate-400";
                                statusMsg = "Sin dato";
                            } else if (prod.status === "CRITICA") {
                                alertLevel = "bg-red-500/10 border-red-500/30 text-red-400";
                                statusMsg = "Crítico";
                            }

                            return (
                                <tr key={prod.id} className={`hover:bg-white/5 transition-colors ${selectedIds.has(prod.id) ? "bg-blue-500/5" : ""}`}>
                                    <td className="py-4 pl-4 pr-2">
                                        <input 
                                            type="checkbox"
                                            className="rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500/50 accent-blue-500 w-4 h-4 cursor-pointer"
                                            checked={selectedIds.has(prod.id)}
                                            onChange={() => handleSelectOne(prod.id)}
                                        />
                                    </td>
                                    <td className="py-4 pl-2">
                                        <p className="font-semibold text-slate-200 line-clamp-1">{prod.nombre}</p>
                                        <p className="text-xs text-slate-500">{prod.marca}</p>
                                    </td>
                                    <td className="py-4 text-center font-mono text-slate-400">{prod.costo.toFixed(2)}€</td>
                                    <td className="py-4 text-center font-mono text-white bg-slate-800/50 rounded-lg">{prod.nuestro.toFixed(2)}€</td>
                                    <td className="py-4 text-center">
                                        {prod.mercado !== null ? (
                                            <>
                                                <a href={prod.finalUrl} target="_blank" className="font-mono text-blue-300 hover:underline">{prod.mercado.toFixed(2)}€</a>
                                                {prod.competenciaNombre && <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">{prod.competenciaNombre}</p>}
                                            </>
                                        ) : (
                                            <span className="text-slate-600 text-xs">Sin escanear</span>
                                        )}
                                    </td>
                                    <td className="py-4 text-right pr-4">
                                        <div className="flex flex-col items-end gap-2">
                                            <div className={`inline-flex items-center gap-2 border px-3 py-1 rounded-md ${alertLevel}`}>
                                                <span className="text-xs uppercase tracking-wide">{statusMsg}</span>
                                                {prod.diff !== null && <span className="font-mono">{prod.diff > 0 ? "+" : ""}{prod.diff.toFixed(2)}€</span>}
                                            </div>
                                            <PricingActions 
                                                productId={prod.id} 
                                                currentPrice={prod.nuestro} 
                                                oculto={prod.oculto} 
                                                enPromocion={prod.enPromocion} 
                                                onGenerateSocial={() => handleGenerateSocial(prod.id)}
                                                isGeneratingSocial={generatingSocialId === prod.id}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {/* Social Preview Modal */}
            {socialData && (
                <SocialPreviewModal 
                    videoUrl={socialData.videoUrl} 
                    captions={socialData.captions} 
                    onClose={() => setSocialData(null)} 
                />
            )}
        </div>
    );
}

function PageModal({ children }: { children: React.ReactNode }) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
            <div className="pointer-events-auto">
                {children}
            </div>
        </div>
    )
}
