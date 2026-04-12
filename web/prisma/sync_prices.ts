import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    const SERPAPI_KEY = process.env.SERPAPI_KEY;

    if (!SERPAPI_KEY) {
        console.error("⛔ ERROR CRÍITICO: SERPAPI_KEY no detectada.");
        console.log("-> Regístrate en https://serpapi.com/ para obtener tu API Key gratuita e incrústala en el archivo de entorno web/.env");
        process.exit(1);
    }

    console.log("🚀 Iniciando Motor de Inteligencia Competitiva (Google Shopping vía SerpAPI)...");
    
    // Filtramos aquellos productos cuyo EAN pueda servir a modo de clave universal, e ignoramos vacíos.
    const products = await prisma.product.findMany({
        where: { 
            agotado: false,
            AND: [
               { ean: { not: null } },
               { ean: { not: "" } }
            ]
        },
        select: { id: true, ean: true, nombre: true }
    });

    console.log(`Detectados ${products.length} productos trackeables mediante EAN.`);

    for (let i = 0; i < products.length; i++) {
        const prod = products[i];
        try {
            console.log(`[${i+1}/${products.length}] Escaneando EAN: ${prod.ean} (${prod.nombre.substring(0,30)}...)`);
            
            const url = `https://serpapi.com/search.json?engine=google_shopping&q=${prod.ean}&hl=es&gl=es&tbs=mr:1,sales:1&api_key=${SERPAPI_KEY}`;
            const res = await fetch(url);
            const data = await res.json();
            
            if (data.shopping_results && data.shopping_results.length > 0) {
                // Ordenamos explícitamente para asegurar que atrapamos el más competitivo (barato) reportado por Shopping
                const cheapest = data.shopping_results.sort((a: any, b: any) => parseFloat(a.extracted_price || 9999) - parseFloat(b.extracted_price || 9999))[0];
                
                const cleanPrice = parseFloat(cheapest.extracted_price || "0");
                const competitorName = cheapest.source;
                const link = cheapest.link || "";
                
                if (cleanPrice > 0) {
                     await prisma.product.update({
                         where: { id: prod.id },
                         data: { 
                             precioCompetencia: cleanPrice,
                             competenciaUrl: competitorName 
                         }
                     });
                     console.log(`   └─ 🎯 Competidor Extremo: ${competitorName} lo tiene a ${cleanPrice}€`);
                } else {
                     console.log(`   └─ 🟡 Formato de bloque irregular. Saltando métrica.`);
                }
            } else {
                console.log(`   └─ 🔕 Faltan referencias nativas en Google Shopping para este EAN.`);
            }
            
            await delay(1200); 

        } catch(error) {
            console.log(`   └─ ❌ Fallo transversal consultando EAN ${prod.ean}: ${error}`);
        }
    }
    
    console.log("🏁 Mapeo de Inteligencia B2C procesado integralmente con éxito.");
    process.exit(0);
}

main();
