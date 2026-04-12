import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/AddToCartButton";
import Link from "next/link";
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const id = (await params).id;
  const product = await prisma.product.findUnique({
    where: { id }
  });

  if (!product) return { title: 'Producto No Encontrado - VeganFood' };
  
  return {
    title: `${product.nombre} | VeganFood`,
    description: product.descripcion?.substring(0, 160) || `Comprar ${product.nombre} vegano online. Envío JIT en 24/48h.`,
  };
}

export default async function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  const product = await prisma.product.findUnique({
    where: { id }
  });

  if (!product) {
    notFound();
  }

  const sanitizeDescription = (text: string | null) => {
    if (!text) return "Un producto 100% verificado y validado por la plataforma VeganFood, trayendo la mejor calidad directamente desde el obrador/distribuidor hasta tu hogar de forma sostenible.";
    
    // 1. Normalizar todos los espacios invisibles (nbsp, tabs, multi-espacios, \n) a un solo espacio simple
    let cleaned = text.replace(/[\s\u00A0\t]+/g, ' ').replace(/\\n/g, ' ').replace(/\\r/g, '');
    
    // 2. Usar Expresiones Regulares híper-permisivas (Ignoran diferencias de acentos y caracteres raros)
    const spamPatterns = [
      /Si no encuentras lo que buscas/gi,
      /P[íi]delo aqu[íi]/gi,
      /Env[íi]os desde \d+h/gi,
      /Portes Gratis/gi,
      /F[áa]cil gesti[óo]n de devoluci[óo]n/gi,
      /M[áa]s de \d+ productos y \d+ marcas/gi,
      /M[áa]s de \d+ productos/gi,
      /y \d+ marcas/gi,
      /900 marcas/gi,
      /2500 productos/gi
    ];
    
    // Aniquilar patrones
    spamPatterns.forEach(regex => {
      cleaned = cleaned.replace(regex, '');
    });
    
    // 3. Limpieza de colisión: Si dos frases se borraron y quedó un " . . " o ".Más", arreglar ortografía básica.
    cleaned = cleaned.replace(/\s+/g, ' '); // quitar múltiples espacios generados por los huecos
    cleaned = cleaned.replace(/\s*\./g, '.'); // pegar el punto a la palabra anterior
    cleaned = cleaned.replace(/\.{2,}/g, '.'); // si hay ".." convertir a "."
    cleaned = cleaned.replace(/^\.+|\.+$/g, '').trim(); // quitar puntos sueltos al inicio o final de todo

    return cleaned || "Un producto 100% verificado y validado por la plataforma VeganFood, trayendo localmente la mejor calidad.";
  };

  return (
    <main className="min-h-screen pt-24 pb-12 px-4 container mx-auto fade-in">
      {/* Breadcrumb / Back Navigation */}
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center text-slate-400 hover:text-primary transition-colors font-medium hover:-translate-x-1 duration-300">
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver al Catálogo
        </Link>
      </div>

      <div className="glass-card rounded-3xl overflow-hidden p-[1px] relative">
        <div className="bg-slate-900/80 backdrop-blur-2xl rounded-[23px] lg:flex items-stretch min-h-[600px]">
          
          {/* Left Column: Image Area */}
          <div className="lg:w-1/2 p-8 lg:p-16 flex items-center justify-center bg-white/5 relative group shrink-0">
            {product.agotado && (
              <div className="absolute top-6 left-6 z-20 bg-slate-900/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-red-500/50 text-red-400 text-sm font-bold uppercase tracking-wider shadow-xl">
                Agotado Temporalmente
              </div>
            )}
            
            <div className="relative w-full aspect-square max-w-md mx-auto">
              {product.imagen ? (
                <Image 
                  src={product.imagen} 
                  alt={product.nombre} 
                  fill
                  className={`object-contain drop-shadow-2xl transition-all duration-700 group-hover:scale-105 ${product.agotado ? 'opacity-50 grayscale' : ''}`}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-800 rounded-3xl text-slate-500 border border-slate-700/50 shadow-inner">
                  <svg className="w-24 h-24 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
            {/* Subtle glow effect behind image */}
            <div className="absolute inset-0 bg-primary/10 blur-[100px] -z-10 rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-1000"></div>
          </div>

          {/* Right Column: Details & Actions */}
          <div className="lg:w-1/2 p-8 lg:p-12 xl:p-16 flex flex-col justify-center">
            
            {product.marca && (
              <div className="inline-block px-4 py-1.5 bg-primary/10 border border-primary/20 text-emerald-400 font-bold text-sm rounded-full mb-6 w-fit uppercase tracking-widest">
                {product.marca}
              </div>
            )}
            
            <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-8 font-sans tracking-tight">
              {product.nombre}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 mb-10 border-b border-white/5 pb-10">
              <div className="text-5xl font-black text-white tracking-tighter">
                {product.precioVenta.toFixed(2)}<span className="text-3xl text-primary ml-1 font-semibold">€</span>
              </div>
              <div className="text-sm text-slate-400 font-medium">
                <div>Impuestos incluidos</div>
                <div className="text-emerald-500 mt-2 flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1 rounded-lg w-fit border border-emerald-500/20">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                  Envío Refrigerado 24/48h
                </div>
              </div>
            </div>
            
            <div className="bg-slate-800/30 border border-white/5 rounded-2xl p-6 mb-8 shadow-inner">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Descripción del Producto
              </h3>
              <p className="text-slate-300 leading-relaxed font-light text-[15px] whitespace-pre-line">
                {sanitizeDescription(product.descripcion)}
              </p>
            </div>
            
            {product.ingredientes && product.ingredientes !== "" && (
              <div className="mb-10">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Información Nutricional & Ingredientes</h3>
                <div className="text-sm text-slate-400 leading-relaxed bg-slate-900/60 p-5 rounded-xl border border-white/5 whitespace-pre-line">
                  <span className="font-medium text-slate-300">Ingredientes: </span>
                  {product.ingredientes.replace(/\\n/g, '\n').replace(/\\r/g, '').trim()}
                </div>
              </div>
            )}
            
            <div className="mt-auto pt-6">
              {product.agotado ? (
                 <button disabled className="w-full py-4 bg-slate-800 text-slate-500 font-bold rounded-xl flex items-center justify-center gap-2 cursor-not-allowed border border-slate-700/50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                    Agotado Temporalmente
                 </button>
              ) : (
                <div className="transform transition-all active:scale-[0.99]">
                  <AddToCartButton product={product} isLarge={true} />
                  <p className="text-center text-xs text-slate-500 mt-4 font-medium flex items-center justify-center gap-1.5">
                     <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                     Pago 100% seguro y encriptado.
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
