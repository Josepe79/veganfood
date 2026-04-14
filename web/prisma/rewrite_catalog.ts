import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const dryRun = process.argv.includes('--dry-run');
const limit = process.argv.includes('--test') ? 5 : undefined;

const B2B_BLACKLIST = ['feliubadaló', 'feliubadalo', 'mayorista', 'canal profesional', 'precios profesionales', 'tiendas especializadas', 'distribución', 'punto de venta', 'alta rotación'];

function isValidOutput(text: string): boolean {
    const lower = text.toLowerCase();
    // Debe contener al menos un tag HTML
    if (!text.includes('<h3>') && !text.includes('<p>')) return false;
    // No debe contener rastros B2B
    for (const word of B2B_BLACKLIST) {
        if (lower.includes(word.toLowerCase())) return false;
    }
    return true;
}

async function rewriteProduct(product: any, attempt = 1): Promise<{ descripcion: string; needsReview: boolean } | null> {
    if (attempt > 3) {
        console.log(`   ⛔ Máximo de reintentos alcanzado.`);
        return null;
    }

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `Eres un copywriter experto en e-commerce de alimentación vegana para VeganFood.es (tienda minorista B2C).
REGLA ABSOLUTA: NUNCA menciones distribuidores, mayoristas, tiendas, "Feliubadaló", "punto de venta", "alta rotación" ni nada B2B.
Hablas DIRECTO al CONSUMIDOR FINAL que compra en la web. Usa el "tú".
Respondes EXCLUSIVAMENTE con HTML semántico válido que empiece DIRECTAMENTE con <h3>. Sin markdown, sin código, sin explicaciones.`
                },
                {
                    role: "user",
                    content: `Transforma esta ficha en una descripción B2C inspiradora con esta estructura HTML EXACTA:

<h3>[Nombre del Producto] — [Beneficio corto y atractivo]</h3>
<h3>¿Por qué es para ti?</h3>
<p>Párrafo de gancho: cómo mejora tu vida o dieta.</p>
<h3>Lo que nos enamora</h3>
<ul>
  <li>Punto 1: Calidad o sabor</li>
  <li>Punto 2: Ética, ecológico o saludable</li>
  <li>Punto 3: Dato curioso o diferencial</li>
</ul>
<h3>Tip VeganFood</h3>
<p>Sugerencia de uso o receta rápida.</p>
<h3>Información Técnica y Nutricional</h3>
[Tabla HTML con ingredientes y valores nutricionales extraídos del texto original]

AVISO VEGANO: Si el texto menciona explícitamente leche, huevo, miel, gelatina animal o caseína, escribe exactamente "CHECK_VEGAN_FLAG" al final.

DATOS DEL PRODUCTO:
Nombre: ${product.nombre}
Marca: ${product.marca}
Descripción original: ${product.descripcion || 'Sin descripción'}
Ingredientes: ${product.ingredientes || 'Ver descripción'}`
                }
            ],
            max_tokens: 1200,
            temperature: 0.6
        });

        const text = completion.choices[0]?.message?.content?.trim() || '';

        if (!isValidOutput(text)) {
            console.log(`   🔁 Intento ${attempt}: respuesta inválida (B2B o sin HTML). Reintentando...`);
            await new Promise(r => setTimeout(r, 1000));
            return rewriteProduct(product, attempt + 1);
        }

        const needsReview = text.includes('CHECK_VEGAN_FLAG');
        const cleanHtml = text.replace('CHECK_VEGAN_FLAG', '').trim();
        return { descripcion: cleanHtml, needsReview };

    } catch (error: any) {
        console.error(`   ❌ Error OpenAI (intento ${attempt}): ${error.message}`);
        if (attempt < 3) {
            await new Promise(r => setTimeout(r, 2000));
            return rewriteProduct(product, attempt + 1);
        }
        return null;
    }
}

async function main() {
    if (!process.env.OPENAI_API_KEY) {
        console.error("⛔ Falta OPENAI_API_KEY en el .env");
        process.exit(1);
    }

    const mode = dryRun ? '(DRY RUN)' : limit ? `(PRUEBA ${limit})` : '(PRODUCCIÓN COMPLETA)';
    console.log(`🚀 Motor de Reescritura VeganFood v2 with Validation ${mode}`);

    const products = await prisma.product.findMany({
        ...(limit ? { take: limit } : {}),
        where: { descripcion: { not: null } },
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
                    data: { descripcion: result.descripcion, needsReview: result.needsReview }
                });
            }
            procesados++;
            if (result.needsReview) paraRevisar++;
            console.log(result.needsReview ? ' ⚠️' : ' ✅');
        } else {
            errores++;
            console.log(' ❌');
        }

        await new Promise(r => setTimeout(r, 500));
    }

    console.log(`\n🏁 Proceso v2 finalizado.`);
    console.log(`   ✅ Procesados: ${procesados}`);
    console.log(`   ⚠️  Para revisar: ${paraRevisar}`);
    console.log(`   ❌ Errores: ${errores}`);
}

main().finally(() => prisma.$disconnect());
