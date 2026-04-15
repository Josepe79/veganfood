"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type FlaggedProduct = {
    id: string;
    nombre: string;
    marca: string;
    imagen: string | null;
    ingredientes: string | null;
    descripcion: string | null;
    precioVenta: number;
};

// Palabras clave que la IA usa como bandera roja (pueden ampliarse)
const RED_FLAGS = ["leche", "huevo", "miel", "gelatina", "caseína", "caseina", "lactosa", "suero", "pescado", "carne", "pollo"];

function highlightFlags(text: string | null) {
    if (!text) return <span className="text-slate-600 italic">No disponible</span>;
    
    let highlightedText = text;
    // Búsqueda simple case-insensitive. Para no re-renderizar un componente complejo, inyectamos tags HTML simples:
    RED_FLAGS.forEach(flag => {
        const regex = new RegExp(`\\b(${flag})\\b`, "gi");
        highlightedText = highlightedText.replace(regex, `<span class="bg-red-500/20 text-red-300 font-extrabold px-1 rounded ring-1 ring-red-500/50">$1</span>`);
    });

    // Sanitización muy básica para mostrarlo directamente
    return <div dangerouslySetInnerHTML={{ __html: highlightedText }} className="text-xs text-slate-400 line-clamp-3 leading-relaxed" />;
}

export function ReviewCenterClient({ 
    products, 
    brands = [], 
    selectedBrand 
}: { 
    products: FlaggedProduct[]; 
    brands?: { marca: string; count: number }[];
    selectedBrand?: string;
}) {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleBrandChange = (brand: string) => {
        const url = brand ? `/admin?brand=${encodeURIComponent(brand)}` : '/admin';
        router.push(url);
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(new Set(products.map(p => p.id)));
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

    const handleAction = (action: "VALIDATE" | "HIDE" | "DELETE", actionNameStr: string) => {
        if (selectedIds.size === 0) return;
        
        const confirmMsg = action === "DELETE" 
            ? `⚠️ PELIGRO: Vas a ELIMINAR PERMANENTEMENTE ${selectedIds.size} productos de tu base de datos central. ¿Estás absolutamente seguro?` 
            : `¿${actionNameStr} los ${selectedIds.size} productos seleccionados?`;

        if (confirm(confirmMsg)) {
            startTransition(async () => {
                try {
                    const res = await fetch("/api/admin/audit", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ productIds: Array.from(selectedIds), action })
                    });
                    const result = await res.json();
                    
                    if (result.status === "success") {
                        setSelectedIds(new Set());
                        router.refresh();
                    } else {
                        alert("Error: " + result.message);
                    }
                } catch (e: any) {
                    alert("Error de conexión: " + e.message);
                }
            });
        }
    };

    return (
        <div className="bg-slate-900/50 border border-red-500/20 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(239,68,68,0.05)]">
            
            <div className="bg-red-950/20 p-4 border-b border-red-500/20 flex flex-col lg:flex-row lg:items-center justify-between gap-4 sticky top-0 z-20 backdrop-blur-md">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <input 
                            type="checkbox" 
                            id="selectAllAudit"
                            className="rounded border-red-500 bg-slate-800 text-red-500 focus:ring-red-500/50 accent-red-500 w-5 h-5 cursor-pointer"
                            checked={products.length > 0 && selectedIds.size === products.length}
                            onChange={handleSelectAll}
                            disabled={products.length === 0}
                        />
                        <label htmlFor="selectAllAudit" className="text-sm font-bold text-red-300 cursor-pointer whitespace-nowrap">
                            Todos ({products.length})
                        </label>
                    </div>

                    {/* Filtro por Marca */}
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-red-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        <select 
                            value={selectedBrand || ""} 
                            onChange={(e) => handleBrandChange(e.target.value)}
                            className="bg-slate-900 border border-red-500/30 text-white text-xs rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-500/50 min-w-[200px]"
                        >
                            <option value="">Todas las marcas</option>
                            {brands.map(b => (
                                <option key={b.marca} value={b.marca}>
                                    {b.marca} ({b.count})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Selección ({selectedIds.size}):</span>
                    
                    <button 
                        disabled={isPending || selectedIds.size === 0}
                        onClick={() => handleAction("VALIDATE", "Dar por Válidos")}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-emerald-900/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        Validar
                    </button>
                    
                    <button 
                        disabled={isPending || selectedIds.size === 0}
                        onClick={() => handleAction("HIDE", "Ocultar")}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600 rounded-lg text-sm font-bold transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                        Ocultar
                    </button>

                    <button 
                        disabled={isPending || selectedIds.size === 0}
                        onClick={() => handleAction("DELETE", "Eliminar")}
                        className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-bold shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        Purgar
                    </button>
                </div>
            </div>

            {/* Listado o Estado Vacío */}
            <div className="max-h-[600px] overflow-y-auto w-full">
                {products.length === 0 ? (
                    <div className="py-20 text-center flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mb-4 ring-1 ring-emerald-500/30">
                            <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        </div>
                        <h3 className="text-xl font-bold text-white">Marca "{selectedBrand || 'Todas'}" limpia</h3>
                        <p className="text-slate-500 mt-2 text-sm max-w-xs">Has terminado con esta selección. Selecciona otra marca en el desplegable superior para continuar con la auditoría.</p>
                    </div>
                ) : products.map(prod => (
                    <div key={prod.id} className={`p-4 border-b border-white/5 flex flex-col md:flex-row gap-6 transition-colors hover:bg-white/5 ${selectedIds.has(prod.id) ? 'bg-red-500/5' : ''}`}>
                        
                        <div className="flex items-start gap-4 md:w-1/3 shrink-0">
                            <div className="mt-1">
                                <input 
                                    type="checkbox"
                                    className="rounded border-red-500 bg-slate-800 text-red-500 focus:ring-red-500/50 accent-red-500 w-5 h-5 cursor-pointer"
                                    checked={selectedIds.has(prod.id)}
                                    onChange={() => handleSelectOne(prod.id)}
                                />
                            </div>
                            <div className="w-16 h-16 bg-white/5 rounded-xl flex items-center justify-center p-2 shrink-0 border border-slate-700/50 relative overflow-hidden">
                                {prod.imagen ? <Image src={prod.imagen} alt={prod.nombre} layout="fill" objectFit="contain" /> : <span className="text-[10px] text-slate-600">A/V</span>}
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-200 leading-tight mb-1">{prod.nombre}</h4>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono border border-slate-700 uppercase tracking-widest">{prod.marca}</span>
                                    <span className="text-[10px] font-bold text-white">{prod.precioVenta.toFixed(2)}€</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 bg-black/20 p-3 rounded-xl border border-red-900/30">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-red-400 mb-1 flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                                    Descripción (Análisis IA)
                                </p>
                                {highlightFlags(prod.descripcion)}
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-500 mb-1 flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                    Ingredientes Originales
                                </p>
                                {highlightFlags(prod.ingredientes)}
                            </div>
                        </div>

                    </div>
                ))}
            </div>

        </div>
    );
}
