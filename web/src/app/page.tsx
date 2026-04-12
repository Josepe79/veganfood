import { prisma } from "../lib/prisma";
import Image from "next/image";
import { AddToCartButton } from "@/components/AddToCartButton";
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home({ searchParams }: { searchParams: Promise<{ q?: string, marca?: string }> }) {
  const params = await searchParams;
  const q = params.q || "";
  const marca = params.marca || "";

  // Construir consulta dinámica Prisma
  const whereClause: any = {};
  if (q) {
    whereClause.nombre = { contains: q, mode: 'insensitive' };
  }
  if (marca) {
    whereClause.marca = { equals: marca };
  }

  // 1. Obtener lista de productos filtrada
  const products = await prisma.product.findMany({
    where: whereClause,
    orderBy: { nombre: 'asc' }
  });

  // 2. Obtener lista de marcas únicas reales de la DB para poblar el dropdown
  const uniqueBrands = await prisma.product.findMany({
    select: { marca: true },
    distinct: ['marca'],
    orderBy: { marca: 'asc' }
  });

  // Texto dinámico para el encabezado del Grid
  const gridTitle = (q || marca) ? `Resultados de búsqueda (${products.length})` : "Catálogo Destacado";
  const gridSubtitle = q ? `Filtrando por "${q}"` : "Explora nuestra colección de proveedores top";
  
  return (
    <div className="pt-24 pb-10">
      {/* Hero Header */}
      <div className="relative glass rounded-3xl p-10 mb-12 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-primary/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="relative z-10 md:w-2/3">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-4">
            Nutrición 100% <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-primary">Vegana</span>
          </h1>
          <p className="text-lg text-slate-300 mb-8 max-w-xl">
            Accede al mayor catálogo mayorista especializado en dietética natural. Sin stock oculto, precios totalmente dinámicos y sin interrupciones.
          </p>
          <form action="/" method="GET" className="flex flex-col sm:flex-row bg-slate-900/60 p-2 rounded-2xl border border-slate-700/50 backdrop-blur-sm max-w-2xl w-full gap-2">
            <input 
              name="q"
              defaultValue={q}
              type="text" 
              placeholder="Ej: Tofu, Bebida de Avena..." 
              className="bg-transparent border-none text-white px-4 py-3 w-full focus:outline-none focus:ring-0 placeholder:text-slate-500"
            />
            
            <div className="relative border-t sm:border-t-0 sm:border-l border-slate-700/50 flex items-center min-w-[200px]">
              <select name="marca" defaultValue={marca} className="appearance-none bg-transparent text-slate-300 w-full pl-4 pr-10 py-3 focus:outline-none focus:ring-0 cursor-pointer text-sm">
                 <option value="" className="bg-slate-900">Cualquier Marca</option>
                 {uniqueBrands.filter(b => b.marca).map(b => (
                    <option key={b.marca} value={b.marca} className="bg-slate-900">{b.marca}</option>
                 ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </div>
            </div>

            <button type="submit" className="bg-primary hover:bg-primary-dark transition-colors text-white font-bold px-8 py-3 rounded-xl shadow-lg mt-2 sm:mt-0">
              Buscar
            </button>
            
            {(q || marca) && (
              <Link href="/" className="sm:hidden mt-2 text-center text-xs text-slate-400 underline">Limpiar filtros</Link>
            )}
          </form>
          
          {(q || marca) && (
            <div className="mt-4 hidden sm:block">
               <Link href="/" className="text-sm text-slate-400 hover:text-white transition-colors bg-white/5 px-4 py-1.5 rounded-full border border-white/10 flex items-center gap-2 inline-flex">
                 <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                 Borrar Filtros
               </Link>
            </div>
          )}
        </div>
        <div className="md:w-1/3 flex justify-center relative">
           <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-transparent blur-2xl rounded-full"></div>
           <div className="w-56 h-56 bg-slate-800 rounded-full border-4 border-slate-700/50 overflow-hidden relative shadow-[0_0_50px_rgba(16,185,129,0.3)] flex items-center justify-center p-8">
             <Image src="https://online.feliubadalo.com/media/catalog/product/placeholder/default/2.png" alt="Vegan Preview" width={200} height={200} className="object-contain" />
           </div>
        </div>
      </div>

      {/* Grid Menu Title */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">{gridTitle}</h2>
          <p className="text-slate-400 mt-1">{gridSubtitle}</p>
        </div>
        <div className="hidden sm:flex gap-2">
           <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-primary/20 text-emerald-400 border border-primary/30">Stock Real-Time</span>
           <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-slate-800 text-slate-300 border border-slate-700">100% Validado Vegano</span>
        </div>
      </div>

      {/* Dynamic Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id} className="glass-card flex flex-col h-full relative group">
            {product.agotado && (
              <div className="absolute top-4 left-4 z-20 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full border border-red-500/50 text-red-400 text-xs font-bold uppercase tracking-wider">
                Agotado
              </div>
            )}
            
            <Link href={`/product/${product.id}`} className="block flex-grow cursor-pointer outline-none">
              <div className="relative pt-[100%] w-full bg-white/5 rounded-t-xl overflow-hidden p-6 flex items-center justify-center">
                <div className="absolute inset-0 p-8 flex items-center justify-center">
                  {product.imagen ? (
                    <Image 
                      src={product.imagen} 
                      alt={product.nombre} 
                      width={250} 
                      height={250} 
                      className={`object-contain max-h-full transition-transform duration-500 group-hover:scale-110 ${product.agotado ? 'opacity-50 grayscale' : ''}`}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-800 rounded-xl text-slate-500">
                      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="px-5 pt-5 flex flex-col border-t border-white/5">
                <div className="text-xs font-medium text-primary mb-2 tracking-wide uppercase">{product.marca}</div>
                <h3 className="font-semibold text-slate-200 leading-snug mb-3 line-clamp-2 hover:text-emerald-400 transition-colors">
                  {product.nombre}
                </h3>
              </div>
            </Link>
            
            <div className="px-5 pb-5 mt-auto">
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold font-sans text-white border-b-2 border-transparent">
                    {product.precioVenta.toFixed(2)}€
                  </div>
                  
                  {product.agotado ? (
                    <button disabled className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-800 text-slate-600 cursor-not-allowed">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                    </button>
                  ) : (
                    <AddToCartButton product={product} />
                  )}
                </div>
              </div>
          </div>
        ))}
        {products.length === 0 && (
          <div className="col-span-full py-20 text-center text-slate-400 glass rounded-3xl">
            <svg className="w-16 h-16 mx-auto mb-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
            <p className="text-xl">Catálogo vacío.</p>
            <p className="text-sm mt-2">Asegúrate de ejecutar el Scraper y sembrar la base de datos.</p>
          </div>
        )}
      </div>
    </div>
  );
}
