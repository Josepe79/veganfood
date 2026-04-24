import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Clock, ChefHat, ShoppingCart, ArrowLeft } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function RecipeDetail({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const recipe = await prisma.recipe.findUnique({
    where: { slug }
  });

  if (!recipe) {
    notFound();
  }

  const instrucciones = JSON.parse(recipe.instrucciones || "[]");
  const ingredientes = JSON.parse(recipe.ingredientes || "[]");

  // Recipe Schema for Google SEO
  const recipeSchema = {
    "@context": "https://schema.org/",
    "@type": "Recipe",
    "name": recipe.nombre,
    "image": [recipe.imagen],
    "description": recipe.descripcion,
    "prepTime": `PT${recipe.prepTime}M`,
    "cookTime": `PT${recipe.cookTime}M`,
    "recipeYield": "4 porciones",
    "recipeIngredient": ingredientes.map((i: any) => `${i.amount} de ${i.name}`),
    "recipeInstructions": instrucciones.map((step: string, index: number) => ({
      "@type": "HowToStep",
      "text": step,
      "position": index + 1
    }))
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(recipeSchema) }}
      />

      <Link href="/" className="inline-flex items-center text-slate-400 hover:text-primary mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Volver a recetas
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Imagen y Meta */}
        <div>
          <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl border border-white/10 mb-8">
            {recipe.imagen && (
              <Image src={recipe.imagen} alt={recipe.nombre} fill className="object-cover" />
            )}
          </div>
          
          <div className="flex gap-6 p-6 glass rounded-2xl">
            <div className="flex flex-col items-center flex-1">
              <Clock className="text-primary mb-2" />
              <span className="text-xs text-slate-400 uppercase font-bold">Preparación</span>
              <span className="text-white font-bold">{recipe.prepTime} min</span>
            </div>
            <div className="w-[1px] bg-white/10"></div>
            <div className="flex flex-col items-center flex-1">
              <ChefHat className="text-primary mb-2" />
              <span className="text-xs text-slate-400 uppercase font-bold">Dificultad</span>
              <span className="text-white font-bold">{recipe.dificultad}</span>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="flex flex-col">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
            {recipe.nombre}
          </h1>
          <p className="text-lg text-slate-300 mb-10 leading-relaxed italic">
            "{recipe.descripcion}"
          </p>

          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center text-sm">01</span>
            Ingredientes Necesarios
          </h2>
          
          <div className="space-y-4 mb-12">
            {ingredientes.map((ing: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                <div className="flex flex-col">
                  <span className="text-white font-bold">{ing.name}</span>
                  <span className="text-xs text-slate-500 uppercase">{ing.amount}</span>
                </div>
                {ing.productId && (
                  <a 
                    href={`https://veganfood.es/product/${ing.productId}?utm_source=platosveganos&utm_medium=recipe`} 
                    target="_blank"
                    className="flex items-center gap-2 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full border border-primary/20 hover:bg-primary hover:text-white transition-all"
                  >
                    <ShoppingCart className="w-3 h-3" />
                    Comprar en Tienda
                  </a>
                )}
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center text-sm">02</span>
            Pasos de la Receta
          </h2>
          
          <div className="space-y-6 recipe-content">
            {instrucciones.map((step: string, idx: number) => (
              <div key={idx} className="flex gap-4">
                <div className="font-black text-primary/40 text-3xl shrink-0">{(idx+1).toString().padStart(2, '0')}</div>
                <p className="text-slate-300 leading-relaxed pt-2">{step}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 pt-12 border-t border-white/5">
            <div className="bg-gradient-to-br from-emerald-500/20 to-transparent p-8 rounded-3xl border border-emerald-500/20 text-center">
              <h3 className="text-xl font-bold text-white mb-2">¿Te falta algún ingrediente?</h3>
              <p className="text-slate-400 mb-6 text-sm">Pide los ingredientes clave de esta receta y recíbelos en 24/48h.</p>
              <a href="https://veganfood.es" className="inline-block bg-primary text-white font-bold px-8 py-3 rounded-xl hover:scale-105 transition-transform">
                Ver Ingredientes en VeganFood.es
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
