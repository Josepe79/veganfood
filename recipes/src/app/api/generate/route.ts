import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST() {
  try {
    // Limpieza de la API Key
    const rawKey = process.env.GEMINI_API_KEY || "";
    if (!rawKey) {
        return new Response(JSON.stringify({ error: "CRÍTICO: No se ha encontrado la variable GEMINI_API_KEY en este servicio de Railway." }), { status: 500 });
    }
    const cleanKey = rawKey.replace(/^["']|["']$/g, "").trim();
    console.log(`[Chef IA] Usando API Key (primeros 4 caracteres): ${cleanKey.substring(0, 4)}...`);
    
    const genAI = new GoogleGenerativeAI(cleanKey);
    
    // 1. Obtener ingredientes reales de la tienda
    const products = await prisma.product.findMany({
      where: { agotado: false },
      take: 20,
      select: { id: true, nombre: true, marca: true }
    });

    // Lista de modelos a intentar por orden de preferencia
    const modelNames = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-1.5-pro", "gemini-pro"];
    let model;
    let result;
    let lastError;

    // Intentar con cada modelo hasta que uno funcione
    for (const modelName of modelNames) {
      try {
        console.log(`Intentando generar con modelo: ${modelName}`);
        model = genAI.getGenerativeModel({ model: modelName });
        
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
          
          IMPORTANTE: Devuelve SOLO el JSON, sin bloques de código ni texto adicional.
        `;

        result = await model.generateContent(prompt);
        if (result) break; // Si funciona, salimos del bucle
      } catch (err: any) {
        console.warn(`Fallo con modelo ${modelName}:`, err.message);
        lastError = err;
      }
    }

    if (!result) throw lastError || new Error("No se pudo generar contenido con ningún modelo.");

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
