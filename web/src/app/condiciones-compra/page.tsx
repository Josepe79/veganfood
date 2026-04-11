export default function CondicionesCompra() {
  return (
    <div className="max-w-4xl mx-auto pt-24 pb-12">
      <div className="glass p-8 md:p-12">
        <h1 className="text-3xl font-bold text-white mb-8 border-b border-white/10 pb-4">Condiciones de Compra</h1>
        
        <div className="space-y-6 text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-emerald-400 mb-3">1. Proceso de Compra</h2>
            <p>
              El usuario podrá navegar libremente por el catálogo de VeganFood.es, seleccionando los productos de su interés añadiéndolos al carrito mediante el modelo exclusivo Just-In-Time de Jepco Consutors SL. Al procesar el pago, el contrato de compraventa y los productos se garantizan dentro de nuestra red logística de consolidación diaria gestionada con tecnología en la nube.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-emerald-400 mb-3">2. Precios e Impuestos</h2>
            <p>
              Los precios aplicables a cada producto son los indicados en la página web en la fecha del pedido excluyendo/incluyendo todos los impuestos aplicables (IVA) en función del checkout. Si su pedido supera los 50.00€, los gastos fijos logísticos de 4.99€ se cancelarán automáticamente, aplicando el beneficio de envío gratuito.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-emerald-400 mb-3">3. Forma de Pago</h2>
            <p>
              Jepco Consutors SL, a través de VeganFood, garantiza la seguridad de las transacciones apoyándose en pasarelas autorizadas:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li><strong>Revolut Pay:</strong> Red directa cifrada y de autenticación bancaria de dos pasos sin abandono de portal.</li>
              <li>Podrá utilizar Tarjetas de Crédito, Débito, Apple Pay y Google Pay.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-emerald-400 mb-3">4. Política de Envíos y Plazos</h2>
            <p>
              La naturaleza del modelo de inventario Just-In-Time implica cierres logísticos diarios a las 13:45h y 18:45h. Todos los pedidos realizados se tramitarán al finalizar el corte y serán despachados al día hábil siguiente garantizando la máxima cadena de frío y caducidades óptimas.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-emerald-400 mb-3">5. Devoluciones y Desistimiento</h2>
            <p>
              Debido a que nuestros productos de consumo vegano son alimenticios y en muchos casos altamente perecederos, no aplicará el derecho de desistimiento genérico una vez confirmada la preparación logística por conservación sanitaria. Cualquier incidencia (daño o producto en mal estado) podrá ser comunicada a <strong>veganfood@jepco.es</strong> acompañada de respaldo gráfico en un plazo de 24h tras la recepción.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
