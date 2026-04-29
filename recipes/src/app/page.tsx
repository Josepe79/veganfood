import { prisma } from "@/lib/prisma";
import { RecipeCard } from "@/components/RecipeCard";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const recipes = await prisma.recipe.findMany({
    where: { publicado: true },
    orderBy: { createdAt: 'desc' },
    take: 24
  });

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <section className="relative glass rounded-3xl p-8 md:p-16 mb-20 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl text-center md:text-left">
          <h1 className="text-4xl md:text-7xl font-black text-white mb-6 tracking-tighter">
            Cocina <span className="text-primary">Vegana</span> <br /> sin complicaciones.
          </h1>
          <p className="text-lg text-slate-300 mb-8 leading-relaxed max-w-xl">
            Descubre recetas exclusivas diseñadas con los productos que amas de VeganFood.es. De la despensa a tu plato en tiempo récord.
          </p>
          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            <Link href="#recetas" className="bg-primary hover:bg-emerald-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-primary/20 transition-all hover:-translate-y-1">
              Explorar Recetas
            </Link>
            <a href="https://veganfood.es" className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold px-8 py-3 rounded-xl backdrop-blur-sm transition-all">
              Comprar Ingredientes
            </a>
          </div>
        </div>
      </section>

      {/* Grid de Recetas */}
      <section id="recetas">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Últimas Recetas</h2>
            <p className="text-slate-400 mt-1">Platos frescos, éticos y fáciles de preparar.</p>
          </div>
        </div>

        {recipes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {recipes.map(recipe => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
            <p className="text-slate-500 italic">Estamos cocinando nuevas recetas... Vuelve muy pronto.</p>
          </div>
        )}
      </section>

      {/* Promo Section */}
      <section className="mt-32 p-10 bg-gradient-to-r from-primary/20 to-transparent rounded-3xl border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="md:w-2/3">
          <h2 className="text-2xl font-bold text-white mb-2">¿Buscas un ingrediente específico?</h2>
          <p className="text-slate-400">Todos los ingredientes de nuestras recetas están disponibles con envío 24/48h en VeganFood.es</p>
        </div>
        <a href="https://veganfood.es" className="bg-primary text-white font-black px-10 py-4 rounded-full shadow-2xl hover:scale-105 transition-transform shrink-0">
          VISITAR LA TIENDA
        </a>
      </section>
    </div>
  );
}
