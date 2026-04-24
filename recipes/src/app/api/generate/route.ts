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
    
    // 1. Obtener ingredientes reales de la tienda
    const products = await prisma.product.findMany({
      where: { agotado: false },
      take: 20,
      select: { id: true, nombre: true, marca: true }
    });

    // Intentar con cada modelo hasta que uno funcione (Llamada REST Directa para evitar 404 del SDK)
    const models = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-pro"];
    let lastGoogleError = "";

    for (const modelName of models) {
      try {
        console.log(`[Chef IA] Intentando llamada REST v1 con modelo: ${modelName}`);
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${cleanKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: `
                    Eres un chef vegano estrella Michelin. Crea 3 recetas exclusivas para mi blog "PlatosVeganos.es".
                    Tu objetivo es inspirar al usuario a cocinar usando los ingredientes de nuestra tienda.
                    Debes usar obligatoriamente alguno de estos productos reales de mi catálogo:
                    ${JSON.stringify(products)}

                    Instrucciones:
                    1. Las recetas deben ser realistas y deliciosas.
                    2. NUNCA menciones "Packs" o "Lotes" de productos, solo ingredientes individuales.
                    3. Devuelve un JSON estrictamente con este formato (array de objetos):
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
                    
                    Responde SOLO el JSON, sin bloques de código.
                  `
                }]
              }]
            })
          }
        );

        if (!response.ok) {
          const errData = await response.json();
          lastGoogleError = errData.error?.message || "Error desconocido";
          throw new Error(lastGoogleError);
        }

        const resJson = await response.json();
        const rawText = resJson.candidates[0].content.parts[0].text;
        const text = rawText.replace(/```json|```/g, "").trim();
        data = JSON.parse(text);
        if (data) break;
      } catch (err: any) {
        lastGoogleError = err.message;
        console.warn(`[Chef IA] Fallo con ${modelName}:`, err.message);
      }
    }

    if (!data) throw new Error(`Google API dice: ${lastGoogleError}`);

    const newRecipes = data;

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
