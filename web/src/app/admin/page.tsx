import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { AdminActions } from "./AdminActions";
import { DeleteOrderButton } from "./DeleteOrderButton";
import { PricingActions } from "./PricingActions";
import { PricingTableClient } from "./PricingTableClient";
import { ShipOrderButton } from "./ShipOrderButton";

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
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
    orderBy: { createdAt: 'desc' }
  });

  // 2. Pedidos que YA hemos comprado y están en tránsito/preparación
  const processingOrders = await prisma.order.findMany({
    where: { status: "PROCESSING" },
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
      where: { precioCompetencia: { not: null } },
      select: { id: true, nombre: true, marca: true, precioOriginal: true, precioVenta: true, precioCompetencia: true, competenciaUrl: true, competenciaNombre: true, oculto: true, enPromocion: true },
      orderBy: { nombre: 'asc' }
  });

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

  // Lógica de Ventanas de Despacho Logístico JIT
  const now = new Date();
  const currentHour = now.getHours();
  const currentMin = now.getMinutes();
  const timeNum = currentHour + currentMin / 60;
  
  let nextWindow = "13:45h (Tránsito Tarde)";
  if (timeNum >= 13.75 && timeNum < 18.75) {
    nextWindow = "18:45h (Tránsito Mañana Sig.)";
  } else if (timeNum >= 18.75) {
    nextWindow = "13:45h mañana (Tránsito Tarde)";
  }

  return (
    <div className="pt-20 pb-10 px-4 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Centro de Recepción JIT</h1>
          <p className="text-slate-400 mt-2">Agrupador logístico en vivo para macro-pedidos B2B.</p>
        </div>
        
        <div className="flex gap-4">
            <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 min-w-32 text-center">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Costo Feliu</p>
                <p className="text-xl font-mono text-red-400 font-bold">{expectedB2BCost.toFixed(2)}€</p>
            </div>
            <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 min-w-32 text-center">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Recaudado</p>
                <p className="text-xl font-mono text-emerald-400 font-bold">{grossSales.toFixed(2)}€</p>
            </div>
            <div className="glass p-4 min-w-32 border-primary/30 text-center">
                <p className="text-[10px] text-primary font-bold uppercase tracking-wider mb-1">Margen Bruto</p>
                <p className="text-xl font-mono text-white font-bold">+{netProfit.toFixed(2)}€</p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Lado Izquierdo: Logística B2B */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="glass p-6">
            <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
               <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                    1. Lista de Compra a Feliubadaló
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Suma de productos de todos los pedidos pagados.</p>
               </div>
               <span className="bg-primary/20 text-emerald-400 px-3 py-1 rounded-full text-sm font-bold border border-primary/30">
                 {shoppingList.length} Refs
               </span>
            </div>

            {shoppingList.length === 0 ? (
                <div className="py-12 text-center text-slate-500 italic text-sm">
                    No hay compras pendientes.
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-slate-500 border-b border-slate-700/50 text-xs uppercase tracking-widest">
                                <th className="pb-3 pl-2 font-bold uppercase">Producto</th>
                                <th className="pb-3 font-bold uppercase">EAN / Ref</th>
                                <th className="pb-3 font-bold uppercase text-center">Cant.</th>
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

          {/* Gestión de Salida a Transportista */}
          <div className="glass p-6 border-primary/20">
             <div className="flex items-center justify-between mb-6 border-b border-primary/10 pb-4">
               <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M10 14.7 12 17l4-4.3"/><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/></svg>
                    2. Pedidos en Preparación / Salida
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Stock ya recibido. Introduce el tracking para notificar el envío.</p>
               </div>
               <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-sm font-bold border border-emerald-500/30">
                 {processingOrders.length} Listos
               </span>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {processingOrders.map(order => (
                     <div key={order.id} className="bg-slate-900/80 p-5 rounded-2xl border border-slate-700/50 flex flex-col justify-between">
                         <div>
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">READY TO SHIP</span>
                                <span className="text-[10px] text-slate-500 font-mono">#{order.id.slice(-6).toUpperCase()}</span>
                            </div>
                            <h3 className="text-white font-bold text-lg">{order.customerName}</h3>
                            <p className="text-xs text-slate-400 mb-4">{order.address}</p>
                            
                            <div className="space-y-1.5 mb-4">
                                {order.items.map(item => (
                                    <div key={item.id} className="text-[11px] text-slate-300 flex justify-between">
                                        <span>• {item.product.nombre}</span>
                                        <span className="font-bold text-slate-500 text-[10px]">x{item.quantity}</span>
                                    </div>
                                ))}
                            </div>
                         </div>

                         <ShipOrderButton orderId={order.id} />
                     </div>
                 ))}

                 {processingOrders.length === 0 && (
                     <div className="col-span-full py-12 text-center text-slate-600 text-sm italic">
                         No hay pedidos en fase de empaquetado.
                     </div>
                 )}
             </div>
          </div>
        </div>

        {/* Lado Derecho: Auditoría y Pricing */}
        <div className="space-y-8">
            <div className="glass p-6">
                <h2 className="text-xl font-bold text-white mb-4">Auditoría de Stock</h2>
                <div className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/10 rounded-xl mb-6">
                    <span className="text-xs text-slate-400 uppercase font-bold tracking-tighter">Agotados Feliu</span>
                    <span className="text-xl font-bold text-red-400">{stockAgotado}</span>
                </div>
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                    {agotadosList.slice(0, 5).map(prod => (
                        <div key={prod.id} className="flex items-center gap-3">
                            <div className="w-8 h-8 relative grayscale opacity-50 shrink-0">
                                {prod.imagen && <Image src={prod.imagen} alt={prod.nombre} layout="fill" objectFit="contain" />}
                            </div>
                            <p className="text-[10px] text-slate-500 line-clamp-1">{prod.nombre}</p>
                        </div>
                    ))}
                    {stockAgotado > 5 && <p className="text-center text-[10px] text-slate-600">...y {stockAgotado - 5} más</p>}
                </div>
            </div>

            <div className="glass p-6">
                <h2 className="text-xl font-bold text-white mb-4">Acciones de Precio</h2>
                <PricingTableClient data={priceIntelligence.slice(0, 10)} />
                <p className="text-[10px] text-slate-500 mt-4 text-center">Mostrando top 10 variaciones críticas.</p>
            </div>
        </div>

      </div>
    </div>
  );
}
