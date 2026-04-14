import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sobre Nosotros | VeganFood.es",
  description: "Conoce a VeganFood.es, tu supermercado vegano JIT de confianza gestionado por Jepco Consutors SL.",
};

export default function SobreNosotros() {
  return (
    <div className="max-w-4xl mx-auto pt-24 pb-12 px-4">
      <div className="glass p-8 md:p-12">
        <h1 className="text-4xl font-extrabold text-white mb-8 tracking-tight">Cero Crueldad, Máxima Frescura</h1>
        
        <div className="space-y-8 text-slate-300 leading-relaxed">
          <section>
             <p className="text-lg text-emerald-400 font-medium italic mb-4">
               "En VeganFood.es no solo vendemos comida; distribuimos un estilo de vida consciente, ético y sostenible."
             </p>
             <p>
               Nuestra misión es simple: hacer que la alimentación 100% vegetal sea accesible, variada y, sobre todo, increíblemente fresca. Fundada bajo el paraguas tecnológico de <strong>Jepco Consutors SL</strong>, VeganFood nace para solucionar uno de los mayores problemas del e-commerce vegano: la rotación y la frescura de los productos refrigerados.
             </p>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12">
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
              <h3 className="text-xl font-bold text-white mb-3">Modelo Just-In-Time</h3>
              <p className="text-sm">
                A diferencia de los almacenes convencionales donde los productos pueden pasar semanas estancados, nosotros operamos con un modelo <strong>JIT (Just-In-Time)</strong>. Consolidamos los pedidos diariamente y los recogemos directamente de nuestros obradores y distribuidores de confianza (como Feliubadaló) horas antes de enviártelos.
              </p>
            </div>
            <div className="bg-emerald-500/10 p-6 rounded-2xl border border-emerald-500/20">
              <h3 className="text-xl font-bold text-emerald-400 mb-3">Frescura Garantizada</h3>
              <p className="text-sm">
                Este sistema nos permite garantizarte las fechas de caducidad más largas del mercado y una cadena de frío ininterrumpida, ya que el producto "vive" en nuestras cámaras solo lo estrictamente necesario.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Respaldo y Transparencia</h2>
            <p>
              VeganFood.es es una marca operada por <strong>Jepco Consutors SL</strong> (NIF B66150434), con sede en Sentmenat, Barcelona. Llevamos años aplicando tecnología en la nube para optimizar la logística de alimentos perecederos, asegurando que cada paquete que sale de nuestras instalaciones cumpla con los más altos estándares de calidad alimentaria europea.
            </p>
          </section>

          <section className="border-t border-white/10 pt-8 mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-black text-white mb-1">100%</div>
              <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">Vegano</p>
            </div>
            <div>
              <div className="text-3xl font-black text-white mb-1">JIT</div>
              <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">Modelo Logístico</p>
            </div>
            <div>
              <div className="text-3xl font-black text-white mb-1">SENTMENAT</div>
              <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">Base de Operaciones</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
