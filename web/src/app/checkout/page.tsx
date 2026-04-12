"use client";
import { useCart } from "@/context/CartContext";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const { items, cartSubtotalAmount, cartTotalAmount, shippingFee, cartTotalItems, clearCart, removeFromCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    direccion: "",
  });

  if (items.length === 0) {
    return (
      <div className="pt-24 pb-10 text-center max-w-lg mx-auto">
        <div className="glass p-12">
          <h2 className="text-2xl font-bold mb-4 text-white">Carrito Vacío</h2>
          <p className="text-slate-400 mb-8">No tienes productos en tu carrito de compra.</p>
          <Link href="/" className="bg-primary px-6 py-3 rounded-xl font-bold text-slate-900 transition-all hover:bg-emerald-400">
            Volver al Catálogo
          </Link>
        </div>
      </div>
    );
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create Database Order & Revolut Session via Next.js API
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: formData,
          cartItems: items.map(item => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: item.product.precioVenta
          })),
          totalAmount: cartTotalAmount
        })
      });

      const data = await res.json();
      if (res.ok && data.checkout_url) {
        // Redirigir de inmediato al banco y el banco nos mandará de vuelta a /success
        window.location.href = data.checkout_url;
      } else {
        alert("Error de procesamiento: " + data.error);
      }
    } catch(err) {
      console.error(err);
      alert("Hubo un error de red intentando conectar con Revolut.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-16 pb-10">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Formulary Checkout */}
        <div className="w-full md:w-2/3">
          <div className="glass p-8">
            <h1 className="text-3xl font-bold text-white mb-6">Detalles de Facturación</h1>
            <form onSubmit={handleCheckout} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Nombre Completo</label>
                  <input required
                    type="text" 
                    value={formData.nombre} 
                    onChange={e => setFormData({...formData, nombre: e.target.value})}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Correo Electrónico</label>
                  <input required
                    type="email" 
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-400 mb-2">Dirección de Envío Completa</label>
                  <input required
                    type="text" 
                    value={formData.direccion} 
                    onChange={e => setFormData({...formData, direccion: e.target.value})}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Teléfono</label>
                  <input required
                    type="tel" 
                    value={formData.telefono} 
                    onChange={e => setFormData({...formData, telefono: e.target.value})}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  />
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-800">
                <button type="submit" disabled={loading} className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-primary text-slate-900 font-bold tracking-wide text-lg hover:shadow-lg hover:shadow-primary/30 transition-all flex justify-center items-center gap-3">
                  {loading ? (
                    <span className="animate-pulse">Conectando pasarela segura...</span>
                  ) : (
                    <>
                      Procesar Pago Híbrido <span className="font-mono bg-slate-900/10 px-2 py-0.5 rounded">Revolut Pay</span>
                    </>
                  )}
                </button>
                <div className="flex items-center justify-center gap-2 mt-4 text-xs text-slate-500">
                   <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                   <span>Transacción cifrada y segura.</span>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Resumen del Carrito */}
        <div className="w-full md:w-1/3">
          <div className="glass p-6 sticky top-24">
            <h2 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">Resumen del Pedido</h2>
            <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2">
              {items.map((item) => (
                <div key={item.product.id} className="flex gap-4">
                  <div className="w-16 h-16 bg-white/5 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center p-2">
                    {item.product.imagen ? (
                      <Image src={item.product.imagen} alt={item.product.nombre} width={64} height={64} className="object-contain" />
                    ) : (
                      <div className="w-full h-full bg-slate-800"></div>
                    )}
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-sm font-semibold text-slate-200 line-clamp-2 leading-tight">{item.product.nombre}</h3>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-slate-400">Cant: {item.quantity}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-white">{(item.product.precioVenta * item.quantity).toFixed(2)}€</span>
                        <button type="button" onClick={() => removeFromCart(item.product.id)} className="text-slate-500 hover:text-red-400 transition-colors relative z-20" title="Quitar de la cesta">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {shippingFee > 0 && (
                <div className="bg-orange-500/10 border border-orange-500/30 text-orange-400 p-3 rounded-lg text-sm mb-4 font-medium flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                    <span>Añade {(50 - cartSubtotalAmount).toFixed(2)}€ más para disfrutar de <strong className="text-orange-300">Envío Gratis</strong>.</span>
                </div>
            )}
            
            <div className="space-y-3 pt-6 border-t border-white/10 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal ({cartTotalItems} uds)</span>
                <span>{cartSubtotalAmount.toFixed(2)}€</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Envío Rápid (JIT B2B)</span>
                {shippingFee === 0 ? (
                    <span className="text-emerald-400 font-bold uppercase tracking-wide">Gratis</span>
                ) : (
                    <span>{shippingFee.toFixed(2)}€</span>
                )}
              </div>
              <div className="flex justify-between text-xl font-bold text-white pt-4">
                <span>Total</span>
                <span className="text-primary">{cartTotalAmount.toFixed(2)}€</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
