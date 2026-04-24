import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    // 1. Obtener ingredientes reales de la tienda
    const products = await prisma.product.findMany({
      where: { agotado: false },
      take: 20,
      select: { id: true, nombre: true, marca: true }
    });

    const prompt = `
      Eres un chef vegano estrella Michelin. Crea 3 recetas exclusivas para mi blog "PlatosVeganos.es".
      Debes usar obligatoriamente alguno de estos productos reales de mi catálogo:
      ${JSON.stringify(products)}

      Devuelve un JSON estrictamente con este formato (array de objetos):
      [{
        "nombre": "Nombre sugerente",
        "slug": "url-unica",
        "descripcion": "Intro gourmet",
        "prepTime": 20,
        "cookTime": 15,
        "dificultad": "Facil",
        "instrucciones": ["paso 1", "paso 2"],
        "ingredientes": [{"name": "Producto", "amount": "1 ud", "productId": "id_del_json_si_corresponde"}]
      }]
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, "").trim();
    const newRecipes = JSON.parse(text);

    for (const r of newRecipes) {
      await prisma.recipe.upsert({
        where: { slug: r.slug },
        update: {},
        create: {
          ...r,
          instrucciones: JSON.stringify(r.instrucciones),
          ingredientes: JSON.stringify(r.ingredientes),
          publicado: true,
          imagen: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2070&auto=format&fit=crop"
        }
      });
    }

    return new Response(JSON.stringify({ success: true, count: newRecipes.length }), { status: 200 });
  } catch (error: any) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
