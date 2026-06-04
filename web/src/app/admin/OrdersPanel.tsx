"use client";
import { useState, useTransition } from "react";
import { updateOrderStatus, updateOrderAddress, captureRevolutOrder, cancelRevolutOrderAction } from "./actions";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING:    { label: "Pendiente",   color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  PAID:       { label: "Pagado",      color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  PROCESSING: { label: "En prep.",    color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  SHIPPED:    { label: "Enviado",     color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  CANCELLED:  { label: "Cancelado",   color: "bg-red-500/20 text-red-400 border-red-500/30" },
};

const ALL_STATUSES = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "CANCELLED"];

type OrderItem = { id: string; quantity: number; price: number; product: { nombre: string } };
type Order = {
  id: string; status: string; totalAmount: number; createdAt: string;
  address: string | null; trackingNumber: string | null;
  items: OrderItem[];
};
type Customer = {
  customerName: string; customerEmail: string; customerPhone: string | null;
  orders: Order[];
};

function OrderCard({ order, onUpdated }: { order: Order; onUpdated: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [editingAddress, setEditingAddress] = useState(false);
  const [address, setAddress] = useState(order.address ?? "");
  const s = STATUS_LABELS[order.status] ?? STATUS_LABELS.PENDING;

  const handleStatusChange = (newStatus: string) => {
    if (!confirm(`¿Cambiar estado a "${STATUS_LABELS[newStatus]?.label}"?`)) return;
    startTransition(async () => {
      await updateOrderStatus(order.id, newStatus);
      onUpdated();
    });
  };

  const handleSaveAddress = () => {
    startTransition(async () => {
      await updateOrderAddress(order.id, address);
      setEditingAddress(false);
      onUpdated();
    });
  };

  const handleCapture = () => {
    if (!confirm(`¿Capturar los fondos de este pedido en Revolut? Haz esto SOLO si ya has confirmado stock con Feliubadaló.`)) return;
    startTransition(async () => {
      await captureRevolutOrder(order.id);
      onUpdated();
    });
  };

  const handleCancelRevolut = () => {
    if (!confirm(`¿Cancelar la retención en Revolut? El dinero se liberará a la tarjeta del cliente.`)) return;
    startTransition(async () => {
      await cancelRevolutOrderAction(order.id);
      onUpdated();
    });
  };

  return (
    <div className={`border rounded-xl p-4 ${isPending ? "opacity-50" : ""} bg-slate-900/60 border-slate-700/50`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-500">#{order.id.slice(-8).toUpperCase()}</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${s.color}`}>{s.label}</span>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-white">{order.totalAmount.toFixed(2)}€</p>
          <p className="text-[10px] text-slate-500">{new Date(order.createdAt).toLocaleDateString("es-ES")}</p>
        </div>
      </div>

      {/* Productos */}
      <div className="space-y-1 mb-3">
        {order.items.map(item => (
          <div key={item.id} className="flex justify-between text-xs text-slate-400">
            <span className="truncate pr-2">• {item.product.nombre}</span>
            <span className="flex-shrink-0 font-bold">×{item.quantity} — {(item.price * item.quantity).toFixed(2)}€</span>
          </div>
        ))}
      </div>

      {/* Dirección */}
      <div className="mb-3">
        {editingAddress ? (
          <div className="flex gap-2">
            <input
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-600 text-white text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-primary/50"
              placeholder="Dirección completa con CP y ciudad"
            />
            <button onClick={handleSaveAddress} disabled={isPending}
              className="bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/30 text-xs font-bold px-3 py-2 rounded-lg transition-all">
              ✓
            </button>
            <button onClick={() => setEditingAddress(false)}
              className="bg-slate-800 text-slate-400 border border-slate-700 text-xs px-3 py-2 rounded-lg">
              ✕
            </button>
          </div>
        ) : (
          <div className="flex items-start gap-2">
            <p className="text-[11px] text-slate-400 flex-1 italic">{order.address || "⚠️ Sin dirección"}</p>
            <button onClick={() => setEditingAddress(true)}
              className="text-[10px] text-slate-500 hover:text-primary transition-colors flex-shrink-0">
              ✏️ editar
            </button>
          </div>
        )}
      </div>

      {/* Tracking */}
      {order.trackingNumber && (
        <p className="text-[11px] text-emerald-400 mb-3">🚚 Tracking: {order.trackingNumber}</p>
      )}

      {/* Acciones de Revolut (Solo si está pagado/retenido o pendiente) */}
      {(order.status === "PAID" || order.status === "PENDING") && (
        <div className="flex gap-2 mb-3">
          <button onClick={handleCapture} disabled={isPending}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-2 rounded transition-all">
            💰 Capturar (Cobrar)
          </button>
          <button onClick={handleCancelRevolut} disabled={isPending}
            className="flex-1 bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-3 py-2 rounded transition-all">
            ❌ Cancelar Retención
          </button>
        </div>
      )}

      {/* Cambiar estado */}
      <div className="flex flex-wrap gap-1 pt-3 border-t border-slate-700/50">
        {ALL_STATUSES.filter(st => st !== order.status).map(st => (
          <button key={st} onClick={() => handleStatusChange(st)} disabled={isPending}
            className="text-[10px] font-bold px-2 py-1 rounded border border-slate-700 text-slate-400 hover:border-primary/50 hover:text-primary transition-all">
            → {STATUS_LABELS[st]?.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function OrdersPanel({ customers }: { customers: Customer[] }) {
  const [, startTransition] = useTransition();
  const [refresh, setRefresh] = useState(0);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  const handleUpdated = () => startTransition(() => setRefresh(r => r + 1));

  const filtered = customers
    .map(c => ({
      ...c,
      orders: c.orders.filter(o =>
        (filterStatus === "ALL" || o.status === filterStatus)
      )
    }))
    .filter(c =>
      c.orders.length > 0 &&
      (search === "" ||
        c.customerName.toLowerCase().includes(search.toLowerCase()) ||
        c.customerEmail.toLowerCase().includes(search.toLowerCase()))
    );

  const totalOrders = customers.reduce((acc, c) => acc + c.orders.length, 0);

  return (
    <div>
      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text" placeholder="🔍 Buscar cliente..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="bg-slate-900/50 border border-slate-700 text-white text-sm px-4 py-2 rounded-xl focus:outline-none focus:border-primary/50 flex-1 min-w-48"
        />
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFilterStatus("ALL")}
            className={`text-xs font-bold px-3 py-2 rounded-xl border transition-all ${filterStatus === "ALL" ? "bg-primary/20 border-primary/50 text-primary" : "border-slate-700 text-slate-400 hover:border-slate-500"}`}>
            Todos ({totalOrders})
          </button>
          {ALL_STATUSES.map(st => {
            const count = customers.reduce((acc, c) => acc + c.orders.filter(o => o.status === st).length, 0);
            if (count === 0) return null;
            return (
              <button key={st} onClick={() => setFilterStatus(st)}
                className={`text-xs font-bold px-3 py-2 rounded-xl border transition-all ${filterStatus === st ? `${STATUS_LABELS[st].color}` : "border-slate-700 text-slate-400 hover:border-slate-500"}`}>
                {STATUS_LABELS[st].label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Clientes y pedidos */}
      {filtered.length === 0 ? (
        <p className="text-center text-slate-500 italic py-8">No hay pedidos que coincidan.</p>
      ) : (
        <div className="space-y-6">
          {filtered.map(customer => (
            <div key={customer.customerEmail} className="bg-slate-900/40 border border-slate-700/50 rounded-2xl p-5">
              {/* Info cliente */}
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4 pb-4 border-b border-slate-700/50">
                <div>
                  <h3 className="text-white font-bold text-base">{customer.customerName}</h3>
                  <div className="flex flex-wrap gap-4 mt-1">
                    <a href={`mailto:${customer.customerEmail}`} className="text-xs text-primary hover:underline">
                      📧 {customer.customerEmail}
                    </a>
                    {customer.customerPhone && (
                      <a href={`tel:${customer.customerPhone}`} className="text-xs text-slate-400 hover:text-white">
                        📞 {customer.customerPhone}
                      </a>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">{customer.orders.length} pedido(s)</p>
                  <p className="text-sm font-bold text-emerald-400">
                    {customer.orders.reduce((acc, o) => acc + o.totalAmount, 0).toFixed(2)}€ total
                  </p>
                </div>
              </div>

              {/* Pedidos del cliente */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {customer.orders.map(order => (
                  <OrderCard key={`${order.id}-${refresh}`} order={order} onUpdated={handleUpdated} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
