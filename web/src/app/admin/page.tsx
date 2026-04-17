import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { AdminActions } from "./AdminActions";
import { DeleteOrderButton } from "./DeleteOrderButton";
import { PricingActions } from "./PricingActions";
import { PricingTableClient } from "./PricingTableClient";
import { ShipOrderButton } from "./ShipOrderButton";
import { PromotionToggle } from "./PromotionToggle";
import { PromotionReset } from "./PromotionReset";
import { ReviewCenterClient } from "./ReviewCenterClient";
import { revalidatePath } from "next/cache";

export const dynamic = 'force-dynamic';

export default async function AdminDashboard(props: { searchParams: Promise<{ brand?: string }> }) {
  const searchParams = await props.searchParams;
  const filterBrand = searchParams.brand;
  
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);


  try {
    // 1. Pedidos que necesitamos comprar a Feliubadaló (Pagados o pendientes de consolidar)
    const waitingOrders = await prisma.order.findMany({
        where: { 
            status: { in: ["PENDING", "PAID"] } 
        },
        include: {
        items: {
            include: { product: true }
        }
        },
        orderBy: { updatedAt: 'desc' }
    });

    const processingOrders = await prisma.order.findMany({
        where: { 
            status: "PROCESSING" 
        },
        include: {
        items: {
            include: { product: true }
        }
        },
        orderBy: { updatedAt: 'desc' }
    });

    const agotadosList = await prisma.product.findMany({
        where: { agotado: true },
        select: { id: true, nombre: true, ref: true, marca: true, imagen: true }
    });
    const stockAgotado = agotadosList.length;

    const priceIntelligence = await prisma.product.findMany({
        take: 100, // Límite de seguridad para evitar payloads pesados en el cliente
        where: {
            OR: [
                { precioCompetencia: { not: null } }, 
                { oculto: true },                      
                { enPromocion: true },                 
                { isNuevo: true },
                { createdAt: { gte: sevenDaysAgo } }
            ]
        },
        select: { 
            id: true, 
            nombre: true, 
            marca: true, 
            precioOriginal: true, 
            precioVenta: true, 
            precioCompetencia: true, 
            competenciaUrl: true, 
            competenciaNombre: true, 
            oculto: true, 
            enPromocion: true, 
            isNuevo: true,
            createdAt: true
        },
        orderBy: { createdAt: 'desc' }
    });

    // Sanitización AGRESIVA de datos para evitar errores de serialización de Next.js
    const sanitizedPriceIntelligence = priceIntelligence.map(p => ({
        id: String(p.id),
        nombre: String(p.nombre || "Sin nombre"),
        marca: String(p.marca || "Genérica"),
        precioOriginal: Number(p.precioOriginal || 0),
        precioVenta: Number(p.precioVenta || 0),
        precioCompetencia: p.precioCompetencia !== null ? Number(p.precioCompetencia) : null,
        competenciaUrl: p.competenciaUrl ? String(p.competenciaUrl) : null,
        competenciaNombre: p.competenciaNombre ? String(p.competenciaNombre) : null,
        oculto: Boolean(p.oculto),
        enPromocion: Boolean(p.enPromocion),
        isNuevo: Boolean(p.isNuevo),
        createdAt: p.createdAt ? p.createdAt.toISOString() : new Date().toISOString()
    }));

    // Productos destacados actuales
    const promotedProducts = await prisma.product.findMany({
        where: { enPromocion: true, oculto: false },
        select: { id: true, nombre: true, marca: true, imagen: true, precioVenta: true, enPromocion: true },
        orderBy: { nombre: 'asc' }
    });

    // Candidatos a destacar (recientes, precio bajo, con imagen, disponibles)
    const candidatos = await prisma.product.findMany({
        where: { 
            enPromocion: false, 
            oculto: false, 
            agotado: false, 
            imagen: { not: '' },
            OR: [
                { precioCompetencia: { not: null } },
                { createdAt: { gte: sevenDaysAgo } }
            ]
        },
        select: { id: true, nombre: true, marca: true, imagen: true, precioVenta: true, enPromocion: true },
        orderBy: { createdAt: 'desc' },
        take: 40
    });

    // Auditoría Ética: Productos que la IA ha marcado para revisión manual
    const flaggedProducts = await prisma.product.findMany({
        where: { 
            needsReview: true,
            ...(filterBrand ? { marca: filterBrand } : {})
        },
        select: { id: true, nombre: true, marca: true, imagen: true, ingredientes: true, descripcion: true, precioVenta: true },
        orderBy: { updatedAt: 'desc' },
        take: 200 // Subimos un poco el límite si hay filtro, ya que será más específico
    });

    // Obtener lista única de marcas que tienen productos para revisar (para el filtro)
    const auditBrandsRaw = await prisma.product.groupBy({
        by: ['marca'],
        where: { needsReview: true },
        _count: { id: true },
        orderBy: { marca: 'asc' }
    });

    const auditBrands = auditBrandsRaw.map(b => ({
        marca: String(b.marca),
        count: b._count.id
    }));


    // Consolidación de Lista de la Compra Mayorista (Basada en pedidos "waiting")
    const consolidated = new Map();
    let expectedB2BCost = 0;
    let grossSales = 0;

    waitingOrders.forEach(order => {
        grossSales += order.totalAmount;
        order.items.forEach(item => {
        const p = item.product;
        const b2bTotal = p.precioOriginal * item.quantity;
        expectedB2BCost += b2bTotal;

        if (consolidated.has(p.id)) {
            const existing = consolidated.get(p.id);
            consolidated.set(p.id, {
            ...existing,
            quantity: existing.quantity + item.quantity
            });
        } else {
            consolidated.set(p.id, {
            product: p,
            quantity: item.quantity
            });
        }
        });
    });

    const shoppingList = Array.from(consolidated.values());
    const netProfit = grossSales - expectedB2BCost;

    return (
        <div className="pt-20 pb-10 px-4 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
            <div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">Centro de Recepción JIT</h1>
            <div className="flex items-center gap-4 mt-2">
                <p className="text-slate-400">Agrupador logístico en vivo para macro-pedidos B2B.</p>
                <PromotionReset />
            </div>
            </div>
            
            <div className="flex gap-4">
                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 min-w-32 text-center">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Costo Feliu</p>
                    <p className="text-xl font-mono text-red-400 font-bold">{(expectedB2BCost || 0).toFixed(2)}€</p>
                </div>
                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 min-w-32 text-center">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Recaudado</p>
                    <p className="text-xl font-mono text-emerald-400 font-bold">{(grossSales || 0).toFixed(2)}€</p>
                </div>
                <div className="glass p-4 min-w-32 border-primary/30 text-center">
                    <p className="text-[10px] text-primary font-bold uppercase tracking-wider mb-1">Margen Bruto</p>
                    <p className="text-xl font-mono text-white font-bold">+{(netProfit || 0).toFixed(2)}€</p>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Lado Izquierdo: Logística B2B (2/3 de ancho) */}
            <div className="lg:col-span-2 space-y-8">
            
            <div className="glass p-6">
                <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                        1. Lista de Compra a Feliubadaló
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">Suma de productos de todos los pedidos pagados.</p>
                </div>
                <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-sm font-bold border border-emerald-500/30">
                    {shoppingList.length} Refs
                </span>
                </div>

                {shoppingList.length === 0 ? (
                    <div className="py-12 text-center text-slate-500 italic text-sm">
                        No hay compras pendientes.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="text-slate-500 border-b border-slate-700/50 text-xs uppercase tracking-widest font-bold">
                                    <th className="pb-3 pl-2">Producto</th>
                                    <th className="pb-3">EAN / Ref</th>
                                    <th className="pb-3 text-center">Cant.</th>
                                </tr>
                            </thead>
                            <tbody>
                                {shoppingList.map((row, idx) => (
                                    <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="py-3 pl-2 flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white/5 rounded-md flex items-center justify-center p-1 overflow-hidden shrink-0">
                                                {row.product.imagen ? (
                                                    <Image src={row.product.imagen} alt={row.product.nombre} width={30} height={30} className="object-contain" />
                                                ) : (
                                                    <div className="w-full h-full bg-slate-800"></div>
                                                )}
                                            </div>
                                            <p className="font-semibold text-xs text-slate-200 line-clamp-2">{row.product.nombre}</p>
                                        </td>
                                        <td className="py-3 text-[10px] font-mono text-slate-500">
                                            <div>{row.product.ean}</div>
                                            <div>{row.product.ref}</div>
                                        </td>
                                        <td className="py-3 text-center">
                                            <span className="bg-slate-900 border border-slate-700 text-white font-bold text-sm px-3 py-1 rounded">
                                                x{row.quantity}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="mt-6 flex justify-end">
                            <AdminActions recordCount={shoppingList.length} />
                        </div>
                    </div>
                )}
            </div>
            </div>

            {/* Lado Derecho: Gestión de Salida (1/3 de ancho) */}
            <div className="lg:col-span-1">
            <div className="glass p-6 border-primary/20 sticky top-24">
                <div className="flex items-center justify-between mb-6 border-b border-primary/10 pb-4">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M10 14.7 12 17l4-4.3"/><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/></svg>
                        2. Salida / Tracking
                    </h2>
                </div>
                <span className="bg-primary/20 text-primary px-2 py-1 rounded-full text-[10px] font-bold border border-primary/30">
                    {processingOrders.length} Listos
                </span>
                </div>

                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    {processingOrders.map(order => (
                        <div key={order.id} className="bg-slate-900/80 p-4 rounded-xl border border-slate-700/50 flex flex-col">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-white font-bold text-sm truncate pr-2">{order.customerName}</h3>
                                <span className="text-[10px] text-slate-500 font-mono flex-shrink-0">#{order.id.slice(-4).toUpperCase()}</span>
                            </div>
                            <p className="text-[10px] text-slate-400 mb-3 truncate italic">{order.address}</p>
                            
                            <div className="space-y-1 mb-4">
                                {order.items.map(item => (
                                    <div key={item.id} className="text-[9px] text-slate-400 flex justify-between">
                                        <span className="truncate pr-4">• {item.product.nombre}</span>
                                        <span className="font-bold flex-shrink-0">x{item.quantity}</span>
                                    </div>
                                ))}
                            </div>

                            <ShipOrderButton orderId={order.id} />
                        </div>
                    ))}

                    {processingOrders.length === 0 && (
                        <div className="py-8 text-center text-slate-600 text-xs italic">
                            Nada para enviar.
                        </div>
                    )}
                </div>
            </div>
            </div>
        </div>

        {/* SECCIÓN INFERIOR PANORÁMICA (Auditoría y Precios) */}
        <div className="mt-12 space-y-8">
            
            {/* Auditoría de Stock Expansiva */}
            <div className="glass p-8 border-red-500/20">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                    <h2 className="text-2xl font-bold text-red-400 flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                        Auditoría de Stock Crítica (Feliubadaló)
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">Inventario agotado en origen que ha sido ocultado automáticamente para evitar roturas de stock.</p>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-6 py-3 text-center">
                        <p className="text-[10px] text-red-300 font-bold uppercase tracking-widest mb-1">Agotados Reales</p>
                        <p className="text-3xl font-extrabold text-red-500">{stockAgotado}</p>
                    </div>
                </div>
                
                {agotadosList.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 text-sm border border-slate-700/50 rounded-lg border-dashed">
                        Feliubadaló informa de Stock saludable. Ninguna limitación B2B activa.
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                        {agotadosList.map(prod => (
                            <div key={prod.id} className="bg-slate-900 border border-red-500/10 rounded-xl p-3 flex flex-col items-center text-center group">
                                <div className="w-16 h-16 bg-white/5 rounded-md mb-3 flex-shrink-0 p-1 relative grayscale group-hover:grayscale-0 transition-all">
                                    {prod.imagen ? (
                                        <Image src={prod.imagen} alt={prod.nombre} layout="fill" objectFit="contain" />
                                    ) : (
                                        <div className="w-full h-full bg-slate-800"></div>
                                    )}
                                </div>
                                <p className="text-[9px] text-red-300 font-mono mb-1 truncate w-full">{prod.marca}</p>
                                <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight h-6">{prod.nombre}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Pricing Intelligence Expansiva */}
            <div className="glass p-8 border-blue-500/20">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg>
                    </div>
                    <div>
                    <h2 className="text-2xl font-bold text-blue-400">Pricing Intelligence & Control</h2>
                    <p className="text-sm text-slate-400">Monitor dinámico de competitividad frente a Google Shopping. (Solo productos con EAN).</p>
                    </div>
                </div>
                
                {sanitizedPriceIntelligence.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 text-sm border border-slate-700/50 rounded-lg border-dashed">
                        Motor SerpAPI en espera. Ejecuta 'npm run sync:prices' para iniciar escrutinio del mercado.
                    </div>
                ) : (
                    <PricingTableClient data={sanitizedPriceIntelligence as any} />
                )}
            </div>

            {/* ⭐ GESTIÓN DE DESTACADOS */}
            <div className="mt-8 glass p-6 rounded-2xl border border-yellow-500/20">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-yellow-400/20 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Gestión de Destacados</h2>
                        <p className="text-sm text-slate-400">Controla qué productos aparecen en la sección "Lo que estamos probando" de la portada. Haz clic en ⭐ para añadir o quitar.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Actualmente destacados */}
                    <div>
                        <h3 className="text-sm font-bold text-yellow-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <span>⭐ En portada ahora ({promotedProducts.length})</span>
                        </h3>
                        <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                            {promotedProducts.length === 0 ? (
                                <p className="text-slate-500 text-sm py-4 text-center border border-dashed border-slate-700 rounded-lg">Ningún producto destacado. Añade algunos de la columna derecha.</p>
                            ) : promotedProducts.map((p: any) => (
                                <div key={p.id} className="flex items-center gap-3 bg-yellow-400/5 border border-yellow-400/20 rounded-xl px-3 py-2">
                                    {p.imagen && <img src={p.imagen} alt={p.nombre} className="w-10 h-10 object-contain rounded-lg bg-white/5 flex-shrink-0" />}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white text-sm font-medium truncate">{p.nombre}</p>
                                        <p className="text-yellow-400/70 text-xs">{p.marca} · {p.precioVenta.toFixed(2)}€</p>
                                    </div>
                                    <PromotionToggle productId={p.id} isPromoted={true} productName={p.nombre} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Candidatos a destacar */}
                    <div>
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">
                            Candidatos (precio más bajo, con imagen)
                        </h3>
                        <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                            {candidatos.map((p: any) => (
                                <div key={p.id} className="flex items-center gap-3 bg-slate-800/50 border border-slate-700/50 rounded-xl px-3 py-2 hover:border-yellow-400/30 transition-colors">
                                    {p.imagen && <img src={p.imagen} alt={p.nombre} className="w-10 h-10 object-contain rounded-lg bg-white/5 flex-shrink-0" />}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white text-sm font-medium truncate">{p.nombre}</p>
                                        <p className="text-slate-400 text-xs">{p.marca} · {p.precioVenta.toFixed(2)}€</p>
                                    </div>
                                    <PromotionToggle productId={p.id} isPromoted={false} productName={p.nombre} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* 🛡️ CENTRO DE AUDITORÍA VEGANA (NUEVO) */}
            <div className="mt-8 glass p-8 border-red-500/30 rounded-3xl bg-red-950/5">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center text-red-500 animate-pulse">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Centro de Auditoría Vegana</h2>
                        <p className="text-sm text-slate-400">Revisa los productos marcados por IA con posibles ingredientes de origen animal. Valida, oculta o purga rápidamente.</p>
                    </div>
                </div>

                <ReviewCenterClient products={flaggedProducts as any} brands={auditBrands} selectedBrand={filterBrand} />
            </div>

        </div>
        </div>
    );
  } catch (error: any) {
    return (
        <div className="pt-32 px-4 max-w-7xl mx-auto text-center">
            <div className="bg-red-500/10 border border-red-500/50 p-12 rounded-3xl">
                <h1 className="text-3xl font-bold text-red-500 mb-4">Error de Diagnóstico (Dashboard)</h1>
                <p className="text-slate-400 mb-8 font-mono text-xs max-w-2xl mx-auto bg-black/30 p-4 rounded-lg">
                    {error.message}
                    <br />
                    <br />
                    Stack: {error.stack?.slice(0, 300)}...
                </p>
                <a href="/admin" className="inline-block bg-white text-black px-6 py-2 rounded-full font-bold">Reintentar</a>
            </div>
        </div>
    )
  }
}
