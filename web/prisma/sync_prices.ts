import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    const SERPAPI_KEY = process.env.SERPAPI_KEY;
    const promotedOnly = process.argv.includes('--promoted-only');
    const newOnly = process.argv.includes('--new-only');

    if (!SERPAPI_KEY) {
        console.error("⛔ ERROR CRÍTICO: SERPAPI_KEY no detectada.");
        process.exit(1);
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    console.log(`🚀 Iniciando Motor de Inteligencia Competitiva ${newOnly ? '(SOLO NOVEDADES) ' : promotedOnly ? '(SOLO PROMOCIONES) ' : '(Full Scan - máx 250 créditos)'}...`);
    
    const query: any = { 
        take: 250, // Limitamos al plan gratuito de SerpAPI
        where: { 
            agotado: false,
            AND: [
               { ean: { not: null } },
               { ean: { not: "" } }
            ],
            // Si hay flag específico, lo usamos. Si no, escaneamos ambos grupos prioritarios y creaciones recientes.
            OR: newOnly ? [{ isNuevo: true }, { createdAt: { gte: sevenDaysAgo } }] : promotedOnly ? [{ enPromocion: true }] : [
                { isNuevo: true },
                { enPromocion: true },
                { createdAt: { gte: sevenDaysAgo } }
            ]
        },
        select: { id: true, ean: true, nombre: true, precioVenta: true }
    };

    const products = await prisma.product.findMany(query);
    console.log(`Detectados ${products.length} productos a escanear (límite 250 créditos).`);

    let competitivosEncontrados = 0;
    let sinDato = 0;

    for (let i = 0; i < products.length; i++) {
        const prod = products[i];
        try {
            console.log(`[${i+1}/${products.length}] Escaneando EAN: ${prod.ean} (${prod.nombre.substring(0,30)}...)`);
            
            const url = `https://serpapi.com/search.json?engine=google_shopping&q=${prod.ean}&hl=es&gl=es&tbs=mr:1,sales:1&api_key=${SERPAPI_KEY}`;
            const res = await fetch(url);
            const data = await res.json();

            // Detectar si la API ha agotado los créditos
            if (data.error && data.error.includes('rate')) {
                console.log('⛔ Créditos SerpAPI agotados. Deteniendo...');
                break;
            }
            
            if (data.shopping_results && data.shopping_results.length > 0) {
                const cheapest = data.shopping_results.sort((a: any, b: any) => parseFloat(a.extracted_price || 9999) - parseFloat(b.extracted_price || 9999))[0];
                
                const cleanPrice = parseFloat(cheapest.extracted_price || "0");
                const competitorName = cheapest.source;
                const link = cheapest.product_link || cheapest.link || "";
                
                if (cleanPrice > 0) {
                    const somosMasBaratos = prod.precioVenta <= cleanPrice;

                    await prisma.product.update({
                        where: { id: prod.id },
                        data: { 
                            precioCompetencia: cleanPrice,
                            competenciaUrl: link,
                            competenciaNombre: competitorName
                            // El usuario marcará manualmente los destacados desde el panel
                        }
                    });
                    
                    if (somosMasBaratos) {
                        competitivosEncontrados++;
                        console.log(`   └─ ✅ COMPETITIVO: Nosotros ${prod.precioVenta.toFixed(2)}€ vs ${competitorName} ${cleanPrice.toFixed(2)}€`);
                    } else {
                        console.log(`   └─ 📊 ${competitorName} más barato: ${cleanPrice.toFixed(2)}€ vs nuestros ${prod.precioVenta.toFixed(2)}€`);
                    }
                } else {
                    sinDato++;
                    console.log(`   └─ 🟡 Precio no extraíble.`);
                }
            } else {
                sinDato++;
                console.log(`   └─ 🔕 Sin resultados en Google Shopping.`);
            }
            
            await delay(1200); 

        } catch(error) {
            console.log(`   └─ ❌ Error consultando EAN ${prod.ean}: ${error}`);
        }
    }
    
    console.log(`\n🏁 Escaneo completado.`);
    console.log(`   ✅ Productos marcados como DESTACADOS (competitivos): ${competitivosEncontrados}`);
    console.log(`   🔕 Sin dato de competencia: ${sinDato}`);
    process.exit(0);
}

main();
