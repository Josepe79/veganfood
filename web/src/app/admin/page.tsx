import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { AdminActions } from "./AdminActions";
import { DeleteOrderButton } from "./DeleteOrderButton";

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const pendingOrders = await prisma.order.findMany({
    where: { status: "PENDING" },
    include: {
      items: {
        include: { product: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const agotadosList = await prisma.product.findMany({
      where: { agotado: true },
      select: { id: true, nombre: true, ref: true, marca: true, imagen: true }
  });
  const stockAgotado = agotadosList.length;

  // Consolidación de Lista de la Compra Mayorista (Feliubadaló)
  const consolidated = new Map();
  let expectedB2BCost = 0;
  let grossSales = 0;

  pendingOrders.forEach(order => {
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

  // Lógica de Ventanas de Despacho Logístico JIT (13:45 - 18:45)
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
    <div className="pt-20 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Centro de Recepción JIT</h1>
          <p className="text-slate-400 mt-2">Agrupador logístico en vivo para macro-pedidos B2B.</p>
          <div className="mt-4 flex items-center gap-2">
            <span className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wide">Stock Fast-Sync</span>
            <span className="text-slate-400 text-sm font-medium">{stockAgotado} Referencias temporalmente agotadas en Feliubadaló.</span>
          </div>
        </div>
        
        <div className="flex gap-4">
            <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 min-w-32">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Costo Feliu</p>
                <p className="text-xl font-mono text-red-400">{expectedB2BCost.toFixed(2)}€</p>
            </div>
            <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 min-w-32">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Recaudado</p>
                <p className="text-xl font-mono text-emerald-400">{grossSales.toFixed(2)}€</p>
            </div>
            <div className="glass p-4 min-w-32 border-primary/30">
                <p className="text-xs text-primary font-bold uppercase tracking-wider mb-1">Margen Bruto</p>
                <p className="text-xl font-mono text-white">+{netProfit.toFixed(2)}€</p>
            </div>
        </div>
      </div>

      <div className="mb-8 glass bg-emerald-900/20 border-emerald-500/30 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
             </div>
             <div>
               <h3 className="text-emerald-400 font-bold">Ventanas de Carga Acordadas</h3>
               <p className="text-xs text-slate-300">Debes procesar esta lista 2 veces al día para cumplir tiempos logísticos de Feliubadaló.</p>
             </div>
          </div>
          <div className="text-right">
             <p className="text-xs text-slate-400 font-bold uppercase">Siguiente Cierre Programado</p>
             <p className="text-2xl font-mono font-bold text-white tracking-widest">{nextWindow}</p>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Lado Izquierdo: Lista Maestra Consolidad */}
        <div className="lg:col-span-2">
          <div className="glass p-6">
            <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
               <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M5 21h14"/><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/><path d="M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4"/></svg>
                 Lista Maestra Feliubadaló
               </h2>
               <span className="bg-primary/20 text-emerald-400 px-3 py-1 rounded-full text-sm font-bold border border-primary/30">
                 {shoppingList.length} Referencias Únicas
               </span>
            </div>

            {shoppingList.length === 0 ? (
                <div className="py-20 text-center flex flex-col items-center">
                    <svg className="w-16 h-16 text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                    <p className="text-slate-400 text-lg">No hay pedidos pendientes para consolidar.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-slate-500 border-b border-slate-700/50">
                                <th className="pb-3 pl-2 font-medium">Producto</th>
                                <th className="pb-3 font-medium">Marca</th>
                                <th className="pb-3 font-medium">EAN / Ref</th>
                                <th className="pb-3 font-medium text-center">Unidades</th>
                            </tr>
                        </thead>
                        <tbody>
                            {shoppingList.map((row, idx) => (
                                <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                    <td className="py-4 pl-2 flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white/5 rounded-md flex items-center justify-center p-1">
                                            {row.product.imagen ? (
                                                <Image src={row.product.imagen} alt={row.product.nombre} width={40} height={40} className="object-contain" />
                                            ) : (
                                                <div className="w-full h-full bg-slate-800"></div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm max-w-sm line-clamp-2 text-slate-200">{row.product.nombre}</p>
                                            <p className="text-xs text-slate-500 mt-1">Costo B2B C/U: {row.product.precioOriginal}€</p>
                                        </div>
                                    </td>
                                    <td className="py-4 text-sm text-slate-400">{row.product.marca}</td>
                                    <td className="py-4 text-xs font-mono text-slate-500">
                                        <div>{row.product.ean}</div>
                                        <div>{row.product.ref}</div>
                                    </td>
                                    <td className="py-4 text-center">
                                        <div className="inline-flex bg-slate-900 border border-slate-700 text-white font-bold text-lg px-4 py-1.5 rounded-lg shadow-inner">
                                            x{row.quantity}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            
            {shoppingList.length > 0 && (
                <div className="mt-8 flex justify-end">
                    <AdminActions recordCount={shoppingList.length} />
                </div>
            )}
          </div>
        </div>

        {/* Lado Derecho: Pedidos Individuales Crudos */}
        <div>
          <div className="glass p-6 sticky top-24">
             <h2 className="text-xl font-bold text-white mb-6">Desglose de Envíos Finales</h2>
             <p className="text-xs text-slate-400 mb-6">Pedidos de clientes a preparar tras la recepción B2B.</p>
             
             <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                 {pendingOrders.map(order => (
                     <div key={order.id} className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/50">
                         <div className="flex justify-between items-start mb-3 border-b border-slate-700/50 pb-3">
                             <div>
                                 <h3 className="font-bold text-slate-200 text-sm">{order.customerName}</h3>
                                 <p className="text-xs text-slate-400">{order.customerEmail}</p>
                             </div>
                             <div className="flex items-center gap-2">
                                 <div className="bg-slate-800 rounded px-2 py-1 text-xs font-mono text-slate-300">
                                     {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                 </div>
                                 <DeleteOrderButton orderId={order.id} />
                             </div>
                         </div>
                         <div className="space-y-2 mb-3">
                            {order.items.map(item => (
                                <div key={item.id} className="flex justify-between text-xs text-slate-300">
                                    <span className="truncate pr-4">{item.quantity}x {item.product.nombre}</span>
                                </div>
                            ))}
                         </div>
                         <div className="pt-2 border-t border-slate-700/50 flex justify-between text-xs">
                             <span className="text-slate-500">Destino: {order.address}</span>
                         </div>
                     </div>
                 ))}
                 
                 {pendingOrders.length === 0 && (
                     <div className="text-center py-10 text-slate-500">
                         Sin envíos
                     </div>
                 )}
             </div>
          </div>
        </div>
      </div>
      
      {/* Sección Inferior: Auditoría de Agotados Fast-Sync */}
      <div className="mt-8">
        <div className="glass p-6 border-red-500/20">
            <h2 className="text-xl font-bold text-red-400 mb-2 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                Auditoría JIT: Referencias Bloqueadas
            </h2>
            <p className="text-xs text-slate-400 mb-6">El siguiente inventario se detectó como "Agotado" en Feliubadaló en la última sincronización y está oculto/deshabilitado en portada temporalmente.</p>
            
            {agotadosList.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-sm border border-slate-700/50 rounded-lg border-dashed">
                    Feliubadaló informa de Stock saludable. Ninguna limitación B2B activa.
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 max-h-[400px] overflow-y-auto pr-2">
                    {agotadosList.map(prod => (
                        <div key={prod.id} className="bg-slate-900 border border-red-500/10 rounded-lg p-3 flex flex-col items-center text-center opacity-80 hover:opacity-100 transition-opacity">
                            <div className="w-16 h-16 bg-white/5 rounded-md mb-3 flex-shrink-0 p-1 relative grayscale">
                                <div className="absolute inset-0 bg-red-500/10 z-10 m-1 rounded mix-blend-multiply pointer-events-none"></div>
                                {prod.imagen ? (
                                    <Image src={prod.imagen} alt={prod.nombre} layout="fill" objectFit="contain" />
                                ) : (
                                    <div className="w-full h-full bg-slate-800"></div>
                                )}
                            </div>
                            <p className="text-[10px] text-red-300 font-mono mb-1">{prod.marca} • {prod.ref}</p>
                            <p className="text-xs text-slate-300 line-clamp-3 leading-tight">{prod.nombre}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
