import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from "@google/generative-ai";

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function generateRecipes() {
  console.log('🤖 Iniciando Motor de Generación IA para PlatosVeganos.es...');

  // 1. Obtener productos clave disponibles
  const products = await prisma.product.findMany({
    where: { agotado: false },
    take: 20,
    select: { id: true, nombre: true, marca: true }
  });

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

  const prompt = `
    Eres un chef vegano experto. Crea 3 recetas gourmet pero sencillas usando AL MENOS uno de estos productos de mi tienda:
    ${JSON.stringify(products)}

    Para cada receta, devuelve un objeto JSON con este formato exacto (un array de objetos):
    [{
      "nombre": "Nombre de la receta",
      "slug": "url-amigable",
      "descripcion": "Breve descripcion sugerente",
      "prepTime": 15,
      "cookTime": 20,
      "dificultad": "Facil/Media",
      "instrucciones": ["paso 1", "paso 2", ...],
      "ingredientes": [{"name": "Nombre ingrediente", "amount": "cantidad", "productId": "id_del_producto_si_esta_en_la_lista"}]
    }]

    IMPORTANTE: 
    1. El slug debe ser único y sin espacios.
    2. Usa los productIds proporcionados para los ingredientes que coincidan.
    3. Devuelve SOLO el JSON, sin bloques de código ni texto adicional.
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, "").trim();
    const newRecipes = JSON.parse(text);

    for (const r of newRecipes) {
      await prisma.recipe.upsert({
        where: { slug: r.slug },
        update: {},
        create: {
          nombre: r.nombre,
          slug: r.slug,
          descripcion: r.descripcion,
          prepTime: r.prepTime,
          cookTime: r.cookTime,
          dificultad: r.dificultad,
          instrucciones: JSON.stringify(r.instrucciones),
          ingredientes: JSON.stringify(r.ingredientes),
          publicado: true,
          imagen: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2080&auto=format&fit=crop" // Imagen genérica placeholder
        }
      });
      console.log(`✅ Receta generada e insertada: ${r.nombre}`);
    }

  } catch (error) {
    console.error('❌ Error generando recetas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

generateRecipes();
