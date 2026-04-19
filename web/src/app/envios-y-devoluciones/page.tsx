import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Envíos y Devoluciones | VeganFood.es",
  description: "Consulta nuestra política de envíos rápidos 24-48h y el derecho de desistimiento de 14 días para productos veganos.",
};

export default function EnviosDevoluciones() {
  return (
    <div className="max-w-4xl mx-auto pt-24 pb-12">
      <div className="glass p-8 md:p-12">
        <h1 className="text-3xl font-bold text-white mb-8 border-b border-white/10 pb-4">Política de Envíos y Devoluciones</h1>
        
        <div className="space-y-8 text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-emerald-400 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor font-bold"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
              1. Plazo de Devolución (Derecho de Desistimiento)
            </h2>
            <p>
              De acuerdo con la legislación vigente, dispones de un plazo de <strong>14 días naturales</strong> desde la recepción de tu pedido para ejercer tu derecho de desistimiento en productos no perecederos (suplementos, botes, productos secos, accesorios), sin necesidad de justificación.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-emerald-400 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              2. Productos Excluidos
            </h2>
            <p className="mb-3">
              Por razones de protección de la salud, seguridad alimentaria e higiene (según el Art. 103 de la Ley 3/2014), no se aceptará la devolución de:
            </p>
            <ul className="list-disc pl-6 space-y-2 italic text-slate-400">
              <li>Productos frescos, refrigerados o perecederos (frutas, verduras, carnes vegetales refrigeradas, quesos veganos frescos, etc.).</li>
              <li>Productos que hayan sido desprecintados, abiertos o manipulados tras la entrega.</li>
              <li>Cualquier producto que presente signos de uso o cuyo embalaje original haya sido dañado.</li>
            </ul>
          </section>

          <section className="bg-slate-800/50 p-6 rounded-2xl border border-white/5">
            <h2 className="text-xl font-semibold text-white mb-4">3. ¿Cómo solicitar una devolución?</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 font-bold">1</div>
                <p>Envía un correo a <strong>veganfood@jepco.es</strong> indicando tu número de pedido.</p>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 font-bold">2</div>
                <p>Responderemos en 24-48h con las instrucciones y la dirección de envío.</p>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 font-bold">3</div>
                <p>Envía el producto protegido a: <br/><span className="text-slate-400 text-sm">VeganFood.es - Avda. Salvador Espriu 38, 08181, Sentmenat (Barcelona)</span></p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-emerald-400 mb-4">4. Gastos de Envío</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-white/5 p-4 rounded-xl">
                <h3 className="font-bold text-white mb-2 underline">Cambio de opinión</h3>
                <p className="text-sm">Los gastos de envío de la devolución correrán a cargo del cliente.</p>
              </div>
              <div className="border border-white/5 p-4 rounded-xl">
                <h3 className="font-bold text-white mb-2 underline">Error o Defecto</h3>
                <p className="text-sm">VeganFood asumirá todos los gastos. Notifícanos en las primeras 24h tras la recepción.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-emerald-400 mb-4">5. Reembolsos</h2>
            <p>
              Una vez verificado el estado perfecto del producto, procesaremos el reembolso en <strong>5 a 7 días hábiles</strong> mediante el mismo método de pago original (Tarjeta, Apple/Google Pay o Bizum).
            </p>
          </section>

          <div className="mt-12 pt-8 border-t border-white/10 text-center">
             <p className="text-sm text-slate-500 italic">Si tienes cualquier duda adicional, nuestro equipo de soporte está a tu disposición de Lunes a Viernes de 9:00h a 18:00h.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
