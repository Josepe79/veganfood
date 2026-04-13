import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const dryRun = process.argv.includes('--dry-run');
const limit = process.argv.includes('--test') ? 5 : undefined;

async function rewriteProduct(product: any): Promise<{ descripcion: string; needsReview: boolean } | null> {
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `Eres un copywriter experto en e-commerce de alimentación vegana y ecológica para la tienda VeganFood.es. 
Tu objetivo es transformar descripciones técnicas B2B en fichas de producto inspiradoras, cercanas y que conviertan.
Respondes EXCLUSIVAMENTE con HTML semántico, sin markdown, sin explicaciones adicionales.`
                },
                {
                    role: "user",
                    content: `Reescribe la ficha de este producto siguiendo estas reglas:

REGLAS CRÍTICAS:
1. LIMPIEZA TOTAL: Elimina cualquier mención a "Feliubadaló", "mayorista", "distribución", "tiendas", "canal profesional", "B2B" o "precios profesionales".
2. TONO: Inspirador, saludable, experto y cercano. Usa el "tú".
3. IDIOMA: Español (España).
4. FORMATO: HTML semántico puro (h3, p, ul, li, table). Sin markdown.
5. ESTRUCTURA OBLIGATORIA (usa exactamente estos encabezados H3):
   <h3>[Nombre del Producto] — [Beneficio corto y sugerente]</h3>
   <h3>¿Por qué es para ti?</h3>
   <p>Párrafo de gancho: cómo mejora la vida o dieta del cliente.</p>
   <h3>Lo que nos enamora</h3>
   <ul>
     <li>Punto 1: Calidad o sabor destacado</li>
     <li>Punto 2: Aspecto ético, ecológico o saludable</li>
     <li>Punto 3: Dato curioso o diferencial de marca</li>
   </ul>
   <h3>Tip VeganFood</h3>
   <p>Sugerencia de uso, receta rápida o maridaje.</p>
   <h3>Información Técnica y Nutricional</h3>
   [Tabla HTML con ingredientes y valores nutricionales si están disponibles en el original]

6. VERIFICACIÓN VEGANA: Si detectas ingredientes de origen animal (leche, huevo, miel, gelatina animal, caseína, etc.), añade exactamente esta cadena al final: CHECK_VEGAN_FLAG

DATOS DEL PRODUCTO:
Nombre: ${product.nombre}
Marca: ${product.marca}
Descripción original: ${product.descripcion || 'Sin descripción'}
Ingredientes originales: ${product.ingredientes || 'Ver descripción'}`
                }
            ],
            max_tokens: 1200,
            temperature: 0.7
        });

        const text = completion.choices[0]?.message?.content || '';
        const needsReview = text.includes('CHECK_VEGAN_FLAG');
        const cleanHtml = text.replace('CHECK_VEGAN_FLAG', '').trim();

        return { descripcion: cleanHtml, needsReview };

    } catch (error: any) {
        console.error(`   ❌ Error en OpenAI: ${error.message}`);
        return null;
    }
}

async function main() {
    if (!process.env.OPENAI_API_KEY) {
        console.error("⛔ Falta OPENAI_API_KEY en el .env");
        process.exit(1);
    }

    const mode = dryRun ? '(DRY RUN - sin guardar)' : limit ? `(PRUEBA ${limit} productos)` : '(PRODUCCIÓN COMPLETA)';
    console.log(`🚀 Motor de Reescritura VeganFood ${mode}`);

    const products = await prisma.product.findMany({
        ...(limit ? { take: limit } : {}),
        where: {
            descripcion: { not: null },
            NOT: { descripcion: { startsWith: '<' } } // Saltar los ya procesados
        },
        select: { id: true, nombre: true, marca: true, descripcion: true, ingredientes: true },
        orderBy: { nombre: 'asc' }
    });

    console.log(`📦 ${products.length} productos a transformar.`);
    
    let procesados = 0;
    let paraRevisar = 0;
    let errores = 0;

    for (let i = 0; i < products.length; i++) {
        const product = products[i];
        process.stdout.write(`[${i + 1}/${products.length}] ${product.nombre.substring(0, 45)}...`);

        const result = await rewriteProduct(product);

        if (result) {
            if (!dryRun) {
                await prisma.product.update({
                    where: { id: product.id },
                    data: {
                        descripcion: result.descripcion,
                        needsReview: result.needsReview
                    }
                });
            }
            procesados++;
            if (result.needsReview) paraRevisar++;
            console.log(result.needsReview ? ' ⚠️ [REVISAR VEGANISMO]' : ' ✅');
        } else {
            errores++;
            console.log(' ❌');
        }

        // Delay entre llamadas para respetar rate limits
        await new Promise(r => setTimeout(r, 500));
    }

    console.log(`\n🏁 Proceso finalizado.`);
    console.log(`   ✅ Procesados: ${procesados}`);
    console.log(`   ⚠️  Para revisar (posibles no-veganos): ${paraRevisar}`);
    console.log(`   ❌ Errores: ${errores}`);
}

main().finally(() => prisma.$disconnect());
