import { Nav } from "@/components/Nav";

export default function SobreNosotros() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="container mx-auto px-4 py-24 max-w-4xl">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-black mb-6 bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent italic">
            Nuestra Historia
          </h1>
          <p className="text-slate-400 text-lg">
            Más que una tienda, un compromiso con el futuro del planeta.
          </p>
        </div>

        <div className="space-y-12 text-slate-300 leading-relaxed text-lg">
          <section className="bg-white/5 p-8 rounded-3xl border border-white/10 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-4">¿Quiénes somos?</h2>
            <p>
              <strong>VeganFood.es</strong> es una iniciativa de <strong>Jepco Consultors SL</strong>, una empresa con sede en Sentmenat (Barcelona) dedicada a la consultoría y la logística avanzada. Nuestra pasión por la sostenibilidad y la alimentación ética nos llevó a crear un supermercado online que rompe las barreras de la distribución tradicional.
            </p>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-emerald-600/10 p-8 rounded-3xl border border-emerald-500/20">
              <h2 className="text-xl font-bold text-emerald-400 mb-4">Nuestra Misión</h2>
              <p className="text-sm">
                Facilitar el acceso a una alimentación 100% vegetal sin renunciar al sabor ni a la comodidad. Queremos que ser vegano sea tan fácil como pulsar un botón.
              </p>
            </div>
            <div className="bg-teal-600/10 p-8 rounded-3xl border border-teal-500/20">
              <h2 className="text-xl font-bold text-teal-400 mb-4">Nuestra Visión</h2>
              <p className="text-sm">
                Convertirnos en la red logística JIT (Just-In-Time) de referencia para productos plant-based en España, garantizando la máxima frescura.
              </p>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-3xl font-bold text-white italic">Transparencia y Confianza</h2>
            <p>
              Sabemos que comprar online requiere confianza. Por eso, en <strong>VeganFood.es</strong> operamos con total transparencia:
            </p>
            <ul className="list-disc pl-6 space-y-4 text-slate-400">
              <li><strong>Almacén Real:</strong> No somos un simple intermediario. Gestionamos nuestra logística desde Avda. Salvador Espriu 38, Sentmenat.</li>
              <li><strong>Pagos Seguros:</strong> Utilizamos pasarelas de pago con cifrado SSL de grado bancario.</li>
              <li><strong>Soporte Humano:</strong> Detrás de la pantalla hay un equipo real listo para ayudarte por teléfono o email.</li>
            </ul>
          </section>

          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-1 rounded-3xl">
            <div className="bg-slate-950 p-8 rounded-[22px] text-center">
              <h3 className="text-xl font-bold mb-4">¿Tienes alguna duda?</h3>
              <p className="text-slate-400 mb-6 text-sm">
                Estamos aquí para hablar contigo. Llámanos al <strong>931 456 580</strong> o visítanos en nuestras oficinas.
              </p>
              <a href="/contacto" className="inline-block bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 px-8 rounded-full transition-all">
                Contactar ahora
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
