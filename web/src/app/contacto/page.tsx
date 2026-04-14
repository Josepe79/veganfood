import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Atención al Cliente y Contacto | VeganFood.es",
  description: "Contacta con VeganFood.es. Estamos en Sentmenat (Barcelona) para ayudarte con tu compra vegana online.",
};

export default function Contacto() {
  return (
    <div className="max-w-4xl mx-auto pt-24 pb-12 px-4">
      <div className="glass p-8 md:p-12">
        <h1 className="text-3xl font-bold text-white mb-8 border-b border-white/10 pb-4">Centro de Atención al Cliente</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* Columna Derecha: Información Directa */}
          <div className="space-y-8 order-1 md:order-2">
            <div>
              <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-widest mb-4">Información Corporativa</h3>
              <div className="bg-slate-800/50 rounded-2xl p-6 border border-white/5 space-y-4">
                <div className="flex items-start gap-4">
                  <svg className="w-5 h-5 text-slate-400 mt-1 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <div>
                    <p className="text-white font-medium">Oficinas y Recepción</p>
                    <p className="text-slate-400 text-sm">Avda. Salvador Espriu 38<br/>08181, Sentmenat (Barcelona)</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <svg className="w-5 h-5 text-slate-400 mt-1 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  <div>
                    <p className="text-white font-medium">Teléfono de Soporte</p>
                    <p className="text-slate-400 text-sm">93.145.65.80 (Nacional)</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <svg className="w-5 h-5 text-slate-400 mt-1 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  <div>
                    <p className="text-white font-medium">Email</p>
                    <p className="text-slate-400 text-sm">veganfood@jepco.es</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-widest mb-4">Horario de Atención</h3>
              <div className="bg-emerald-500/5 rounded-2xl p-6 border border-emerald-500/10">
                <p className="text-white text-lg font-bold">Lunes a Viernes</p>
                <p className="text-emerald-400 text-2xl font-black">09:00h – 18:00h</p>
                <p className="text-slate-500 text-xs mt-2 italic">Atendemos consultas por email 24/7 (Respuesta en menos de 24h).</p>
              </div>
            </div>
          </div>

          {/* Columna Izquierda: Formulario (UI Only) */}
          <div className="order-2 md:order-1">
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-widest mb-6">Escríbenos directamente</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nombre Completo</label>
                <input type="text" className="w-full bg-slate-900 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-emerald-500/50 transition-colors" placeholder="Ej: Maria García" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Correo Electrónico</label>
                <input type="email" className="w-full bg-slate-900 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-emerald-500/50 transition-colors" placeholder="maria@ejemplo.com" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Mensaje o Incidencia</label>
                <textarea rows={5} className="w-full bg-slate-900 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-emerald-500/50 transition-colors" placeholder="Cuéntanos cómo podemos ayudarte..."></textarea>
              </div>
              <button disabled className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-900/20 active:scale-[0.98]">
                Enviar Mensaje
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
