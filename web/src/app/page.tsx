import { prisma } from "../lib/prisma";
import Image from "next/image";
import { AddToCartButton } from "@/components/AddToCartButton";
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home({ searchParams }: { searchParams: Promise<{ q?: string, marca?: string, page?: string }> }) {
  const params = await searchParams;
  const q = params.q || "";
  const marca = params.marca || "";
  const page = parseInt(params.page || "1");
  const pageSize = 24;

  // Construir consulta dinámica Prisma
  const whereClause: any = { oculto: false };
  if (q === "flash") {
    whereClause.enPromocion = true;
  } else if (q) {
    whereClause.nombre = { contains: q, mode: 'insensitive' };
  }
  
  if (marca) {
    whereClause.marca = { equals: marca };
  }

  // 1. Obtener lista de productos filtrada con paginación
  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      where: whereClause,
      orderBy: { nombre: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    prisma.product.count({ where: whereClause })
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  const novedades = await prisma.product.findMany({
    where: { oculto: false },
    orderBy: { createdAt: 'desc' },
    take: 4
  });

  const promos = await prisma.product.findMany({
    where: { enPromocion: true, oculto: false },
    orderBy: { nombre: 'asc' }
  });

  // 2. Obtener lista de marcas únicas reales de la DB para poblar el dropdown
  const uniqueBrands = await prisma.product.findMany({
    select: { marca: true },
    distinct: ['marca'],
    orderBy: { marca: 'asc' }
  });

  // Texto dinámico para el encabezado del Grid
  const gridTitle = (q || marca) ? `Resultados de búsqueda (${totalCount})` : "Catálogo Destacado";
  const gridSubtitle = q ? `Filtrando por "${q}"` : "Explora nuestra colección de proveedores top";
  
  return (
    <div className="pt-24 pb-10">
      {/* Hero Header */}
      <div className="relative glass rounded-3xl p-10 mb-12 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-primary/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="relative z-10 md:w-2/3">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-4">
            Tu despensa <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-primary">vegana</span>, directa y sin filtros.
          </h1>
          <p className="text-lg text-slate-300 mb-6 max-w-xl leading-relaxed">
            Accede a la mayor selección de productos plant-based y dietética natural de España. Sin esperas, sin sorpresas de stock y con envío express de nuestra nevera a tu cocina.
          </p>
          <div className="mb-10">
             <Link href="#novedades" className="inline-block bg-white text-slate-900 font-bold px-8 py-3 rounded-full hover:bg-emerald-400 hover:text-slate-900 transition-all shadow-lg hover:shadow-emerald-400/50 hover:-translate-y-1">
               Ver novedades de hoy
             </Link>
          </div>
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

      {/* Promociones Destacadas */}
      {!q && !marca && promos.length > 0 && (
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            <div>
              <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-500 tracking-tight">Lo que estamos probando esta semana</h2>
              <p className="text-slate-400 mt-1">Filtramos el catálogo mayorista para traerte solo lo que de verdad merece la pena.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {promos.map((promo) => (
              <div key={promo.id} className="relative group bg-gradient-to-b from-purple-900/40 to-slate-900 rounded-3xl border border-purple-500/30 overflow-hidden shadow-2xl shadow-purple-900/20 flex flex-col h-full transform transition-all duration-300 hover:-translate-y-2 hover:shadow-purple-500/20">
                <div className="absolute top-0 right-0 p-3 z-20">
                   <span className="bg-purple-500 text-white text-xs font-black uppercase px-2 py-1 rounded-md shadow-lg shadow-purple-500/50">Promo ✨</span>
                </div>
                {promo.agotado && (
                  <div className="absolute top-4 left-4 z-20 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full border border-red-500/50 text-red-400 text-xs font-bold uppercase tracking-wider">
                    Agotado
                  </div>
                )}
                
                <Link href={`/product/${promo.id}`} className="block relative h-56 w-full p-6 bg-slate-800/50 flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent z-0"></div>
                  {promo.imagen ? (
                    <Image src={promo.imagen} alt={promo.nombre} fill className="object-contain p-4 group-hover:scale-105 transition-transform duration-500 z-10 drop-shadow-xl" sizes="(max-width: 768px) 100vw, 33vw" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600 z-10 relative">
                      <p className="text-sm">Sin imagen</p>
                    </div>
                  )}
                </Link>

                <div className="p-5 flex flex-col flex-grow relative z-10">
                  <p className="text-purple-400 text-xs font-bold uppercase tracking-wider mb-2">{promo.marca}</p>
                  <Link href={`/product/${promo.id}`}>
                    <h3 className="text-lg font-bold text-white mb-2 leading-tight group-hover:text-purple-300 transition-colors line-clamp-2">{promo.nombre}</h3>
                  </Link>
                  <div className="mt-auto pt-4 flex items-end justify-between">
                    <div>

                      <p className="text-3xl font-extrabold text-white tracking-tighter">
                        {promo.precioVenta.toFixed(2)}<span className="text-xl text-purple-400">€</span>
                      </p>
                    </div>
                    <AddToCartButton product={promo} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
            <p className="text-sm mt-2">No hemos encontrado productos que coincidan con tu búsqueda.</p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-12 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <Link 
              href={`/?${new URLSearchParams({ ...Object.fromEntries(Object.entries(params)), page: (page - 1).toString() })}`}
              className={`px-6 py-3 rounded-xl border font-bold transition-all ${page <= 1 ? 'pointer-events-none opacity-20 border-white/5 bg-white/5 text-slate-600' : 'bg-slate-800 border-white/10 text-white hover:bg-slate-700 hover:border-primary/50 text-sm'}`}
            >
              Anterior
            </Link>
            
            <div className="flex gap-1">
               <span className="bg-primary/20 text-primary border border-primary/30 px-4 py-3 rounded-xl font-black text-sm">
                 Página {page} de {totalPages}
               </span>
            </div>

            <Link 
              href={`/?${new URLSearchParams({ ...Object.fromEntries(Object.entries(params)), page: (page + 1).toString() })}`}
              className={`px-6 py-3 rounded-xl border font-bold transition-all ${page >= totalPages ? 'pointer-events-none opacity-20 border-white/5 bg-white/5 text-slate-600' : 'bg-primary text-white border-primary hover:bg-emerald-500 shadow-lg shadow-emerald-500/20 text-sm'}`}
            >
              Siguiente
            </Link>
          </div>
          <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">Mostrando {products.length} de {totalCount} productos</p>
        </div>
      )}

      {/* Trust Block Icons */}
      {!q && !marca && (
        <div className="mt-24 mb-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card p-8 text-center bg-emerald-900/10 border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.05)] transform hover:-translate-y-1 transition-transform">
            <div className="w-16 h-16 mx-auto bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
               <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-3 tracking-tight">Stock Real</h3>
            <p className="text-slate-400 text-sm leading-relaxed">Sincronizados con el almacén central de nuestro origen. Lo que ves, lo tienes. Sin sorpresas de inventario, te aseguramos el envío.</p>
          </div>
          <div className="glass-card p-8 text-center bg-blue-900/10 border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.05)] transform hover:-translate-y-1 transition-transform">
            <div className="w-16 h-16 mx-auto bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
               <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-3 tracking-tight">Frescura Garantizada</h3>
            <p className="text-slate-400 text-sm leading-relaxed">Logística de rotación altísima. Tu pedido no pasa meses guardado en una estantería, llega directo con máxima fecha de caducidad.</p>
          </div>
          <div className="glass-card p-8 text-center bg-amber-900/10 border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.05)] transform hover:-translate-y-1 transition-transform">
            <div className="w-16 h-16 mx-auto bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
               <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path></svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-3 tracking-tight">100% Ético</h3>
            <p className="text-slate-400 text-sm leading-relaxed">Auditoría estricta continua. No vendemos trazas ni crueldad animal. Filtramos todos los registros por tu tranquilidad.</p>
          </div>
        </div>
      )}

      {/* Recién Llegados - Carrusel Visual de Novedades */}
      {!q && !marca && novedades.length > 0 && (
        <div id="novedades" className="mt-20 scroll-mt-24 mb-10 p-10 bg-slate-800/20 rounded-3xl border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Recién llegados a la lonja vegana ⛵</h2>
            <p className="text-slate-400 mt-2">Nuevas incorporaciones procesadas hoy en nuestra base logística.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             {novedades.map((nov) => (
                <Link href={`/product/${nov.id}`} key={nov.id} className="block group">
                  <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl overflow-hidden shadow-lg p-4 flex flex-col h-full transform transition-all hover:scale-105">
                     <div className="relative h-32 w-full bg-slate-800 rounded-xl mb-3 p-2 flex items-center justify-center">
                        {nov.imagen ? (
                          <Image src={nov.imagen} alt={nov.nombre} fill className="object-contain p-2" sizes="200px" />
                        ) : (
                          <span className="text-xs text-slate-500">Sin foto</span>
                        )}
                        <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg">New</span>
                     </div>
                     <p className="text-xs font-medium text-emerald-400 mb-1 line-clamp-1">{nov.marca}</p>
                     <h4 className="text-sm text-slate-200 line-clamp-2 leading-tight group-hover:text-emerald-300 transition-colors mb-2 flex-grow">{nov.nombre}</h4>
                     <p className="font-bold text-white">{nov.precioVenta.toFixed(2)}€</p>
                  </div>
                </Link>
             ))}
          </div>
        </div>
      )}

      {/* Cómo Lo Hacemos / Transparencia */}
      {!q && !marca && (
        <div className="mt-20 glass rounded-3xl p-10 border border-slate-700/50 text-center md:text-left flex flex-col md:flex-row items-center gap-10">
           <div className="md:w-1/3 flex justify-center">
              <div className="w-32 h-32 bg-gradient-to-br from-emerald-500/20 to-primary/20 rounded-3xl rotate-12 flex items-center justify-center border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
                 <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-emerald-400 -rotate-12"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              </div>
           </div>
           <div className="md:w-2/3">
              <h2 className="text-2xl font-bold text-white tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-white">¿Cómo lo hacemos posible?</h2>
              <p className="text-slate-300 leading-relaxed text-lg font-light">
                 Trabajamos con un modelo ético directo <strong>"Just-In-Time"</strong>. Cada mañana seleccionamos algorítmicamente los productos más competitivos de nuestro distribuidor mayorista especializado, y los procesamos en nuestra base central para enviártelo esa misma tarde. <br/><br/>
                 Esto nos permite aniquilar a los especuladores de precios, garantizarte ofertas dinámicas ultra-rentables cada 24 horas y, sobre todo, despacharte el producto con la <strong>máxima fecha de caducidad posible</strong> directamente desde la cadena de frío del proveedor origen a tu mesa.
              </p>
           </div>
        </div>
      )}

    </div>
  );
}
