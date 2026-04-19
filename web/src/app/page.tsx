import { prisma } from "../lib/prisma";
import Image from "next/image";
import { AddToCartButton } from "@/components/AddToCartButton";
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home({ searchParams }: { searchParams: Promise<{ q?: string, marca?: string, page?: string }> }) {
  try {
    const params = await searchParams;
    const q = params.q || "";
    const marca = params.marca || "";
    const page = parseInt(params.page || "1");
    const pageSize = 24;

    // Organization Schema for Google
    const orgSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "VeganFood.es",
      "alternateName": "VeganFood Spain",
      "url": "https://veganfood.es",
      "logo": "https://veganfood.es/favicon.ico",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+34-931456580",
        "contactType": "customer service",
        "areaServed": "ES",
        "availableLanguage": "Spanish"
      },
      "sameAs": [
        "https://www.instagram.com/veganfoosspain/",
        "https://www.tiktok.com/@veganfood.es",
        "https://www.youtube.com/@VeganFoodSpain"
      ]
    };

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
    const [rawProducts, totalCount] = await Promise.all([
        prisma.product.findMany({
            where: whereClause,
            select: { id: true, nombre: true, marca: true, precioVenta: true, imagen: true, ean: true, ref: true, agotado: true, enPromocion: true, isNuevo: true },
            orderBy: { nombre: 'asc' },
            skip: (page - 1) * pageSize,
            take: pageSize
        }),
        prisma.product.count({ where: whereClause })
    ]);

    const totalPages = Math.ceil(totalCount / pageSize);

    const rawNovedades = await prisma.product.findMany({
        where: { oculto: false, isNuevo: true },
        select: { id: true, nombre: true, marca: true, precioVenta: true, imagen: true, ean: true, ref: true, agotado: true, enPromocion: true, isNuevo: true },
        orderBy: { createdAt: 'desc' },
        take: 50 
    });

    const rawPromos = await prisma.product.findMany({
        where: { enPromocion: true, oculto: false },
        select: { id: true, nombre: true, marca: true, precioVenta: true, imagen: true, ean: true, ref: true, agotado: true, enPromocion: true, isNuevo: true }
    });
    
    const sanitize = (p: any) => ({
        id: String(p.id),
        nombre: String(p.nombre || "Producto"),
        marca: String(p.marca || "Vegan"),
        precioVenta: Number(p.precioVenta || 0),
        imagen: p.imagen ? String(p.imagen) : null,
        ean: p.ean ? String(p.ean) : null,
        agotado: Boolean(p.agotado),
        enPromocion: Boolean(p.enPromocion),
        isNuevo: Boolean(p.isNuevo)
    });

    const products = rawProducts.map(sanitize);
    const novedades = rawNovedades.map(sanitize).sort(() => 0.5 - Math.random()).slice(0, 8);
    const promos = rawPromos.map(sanitize).sort(() => 0.5 - Math.random());

    const uniqueBrands = await prisma.product.findMany({
        select: { marca: true },
        distinct: ['marca'],
        orderBy: { marca: 'asc' }
    });

    const gridTitle = (q || marca) ? `Resultados de búsqueda (${totalCount})` : "Catálogo Destacado";
    const gridSubtitle = q ? `Filtrando por "${q}"` : "Explora nuestra colección de proveedores top";
    
    return (
        <div className="pt-24 pb-10">
        {/* Organization SEO Schema */}
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />

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
            </form>
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
                        <div className="text-3xl font-extrabold text-white tracking-tighter">
                            {promo.precioVenta.toFixed(2)}<span className="text-xl text-purple-400">€</span>
                        </div>
                        <AddToCartButton product={promo} />
                    </div>
                    </div>
                </div>
                ))}
            </div>
            </div>
        )}

        {/* Grid Title */}
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
                        <AddToCartButton product={product as any} />
                    )}
                    </div>
                </div>
            </div>
            ))}
        </div>

        {/* Home Pagination */}
        {totalPages > 1 && (
            <div className="mt-12 flex flex-col items-center gap-4">
               <div className="flex items-center gap-2">
                   <Link href={`/?page=${page - 1}`} className={`px-6 py-3 rounded-xl border font-bold ${page <= 1 ? 'pointer-events-none opacity-20' : 'bg-slate-800 text-white hover:bg-slate-700'}`}>Anterior</Link>
                   <span className="bg-primary/20 text-primary px-4 py-3 rounded-xl font-black">{page} / {totalPages}</span>
                   <Link href={`/?page=${page + 1}`} className={`px-6 py-3 rounded-xl border font-bold ${page >= totalPages ? 'pointer-events-none opacity-20' : 'bg-primary text-white hover:bg-emerald-500'}`}>Siguiente</Link>
               </div>
            </div>
        )}

        {/* Transparency / Trust Info */}
        <div className="mt-20 glass rounded-3xl p-10 border border-slate-700/50 text-center md:text-left flex flex-col md:flex-row items-center gap-10">
            <div className="md:w-1/3 flex justify-center text-emerald-400">
                <svg className="w-32 h-32" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.954 0 0112 2.944a11.955 11.954 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <div className="md:w-2/3">
                <h2 className="text-2xl font-bold text-white mb-4">Negocio Verificado & 100% Transparente</h2>
                <p className="text-slate-300 leading-relaxed">
                   VeganFood.es es un proyecto de <strong>Jepco Consultors SL</strong> enfocado en democratizar el acceso a la alimentación plant-based. Operamos con un modelo directo de red mayorista para asegurar que recibes los productos más frescos del mercado con envíos en 24-48h. Nuestra identidad y compromiso ético es auditado diariamente por nuestra red logística.
                </p>
            </div>
        </div>
        </div>
    );
  } catch (error: any) {
    return <div className="pt-32 text-center text-red-500">{error.message}</div>;
  }
}
