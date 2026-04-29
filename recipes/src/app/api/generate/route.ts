import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getBestImageForRecipe } from "@/lib/imageRepository";

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

    // 2. Llamada a OpenAI (Fallback definitivo ante los fallos de Gemini)
    const openaiKey = process.env.OPENAI_API_KEY || "";
    if (!openaiKey) {
        return new Response(JSON.stringify({ error: "Falta OPENAI_API_KEY para el Plan B." }), { status: 500 });
    }

    console.log("[Chef IA] Iniciando generación con OpenAI (Plan B)...");
    
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{
          role: "system",
          content: "Eres un chef vegano experto. Responde siempre con JSON puro."
        }, {
          role: "user",
          content: `
            Crea 3 recetas veganas gourmet usando alguno de estos productos:
            ${JSON.stringify(products)}

            Devuelve un JSON (array de objetos) con:
            nombre, slug, descripcion, prepTime (int), cookTime (int), dificultad (Facil/Media), 
            instrucciones (array strings), ingredientes (array de {name, amount, productId}),
            imageKeyword (un término en inglés para buscar una foto apetitosa en Unsplash).
            
            NO menciones "Packs". Responde SOLO el JSON.
          `
        }],
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(`OpenAI Error: ${err.error?.message || "Desconocido"}`);
    }

    const resJson = await response.json();
    const data = JSON.parse(resJson.choices[0].message.content);
    
    // Lógica robusta para encontrar el array de recetas
    let recipesToInsert = [];
    if (Array.isArray(data)) {
      recipesToInsert = data;
    } else {
      const arrayKey = Object.keys(data).find(key => Array.isArray(data[key]));
      recipesToInsert = arrayKey ? data[arrayKey] : [data];
    }

    const newRecipes = recipesToInsert.filter((r: any) => r.slug);

    for (const r of newRecipes) {
      const imageUrl = getBestImageForRecipe(r.nombre, JSON.stringify(r.ingredientes));

      await prisma.recipe.upsert({
        where: { slug: r.slug },
        update: {
          nombre: r.nombre,
          descripcion: r.descripcion,
          prepTime: r.prepTime,
          cookTime: r.cookTime,
          dificultad: r.dificultad,
          instrucciones: JSON.stringify(r.instrucciones),
          ingredientes: JSON.stringify(r.ingredientes),
          imagen: imageUrl
        },
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
          imagen: imageUrl
        }
      });
    }

    return new Response(JSON.stringify({ success: true, count: newRecipes.length }), { status: 200 });

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
