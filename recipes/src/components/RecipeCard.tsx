import Image from "next/image";
import Link from "next/link";
import { Clock, ChefHat } from "lucide-react";

interface RecipeCardProps {
  recipe: {
    id: string;
    nombre: string;
    slug: string;
    descripcion: string | null;
    imagen: string | null;
    prepTime: number | null;
    dificultad: string | null;
  };
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <div className="glass-card group flex flex-col h-full">
      <Link href={`/receta/${recipe.slug}`} className="block relative aspect-video overflow-hidden">
        {recipe.imagen ? (
          <Image 
            src={recipe.imagen} 
            alt={recipe.nombre} 
            fill 
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-500">
            No Image
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </Link>
      
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-center gap-4 mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-primary" />
            {recipe.prepTime} min
          </div>
          <div className="flex items-center gap-1">
            <ChefHat className="w-3 h-3 text-primary" />
            {recipe.dificultad}
          </div>
        </div>
        
        <Link href={`/receta/${recipe.slug}`}>
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {recipe.nombre}
          </h3>
        </Link>
        
        <p className="text-slate-400 text-sm line-clamp-2 mb-4 flex-grow">
          {recipe.descripcion || "Una receta deliciosa y fácil de preparar."}
        </p>
        
        <Link 
          href={`/receta/${recipe.slug}`}
          className="text-primary text-xs font-bold uppercase tracking-wider flex items-center gap-2 group/link"
        >
          Ver Receta Completa
          <svg className="w-4 h-4 transform transition-transform group-hover/link:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
