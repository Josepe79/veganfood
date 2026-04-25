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
      // Galería Extendida para evitar repeticiones (20 IDs distintos)
      const imagePool = [
        'photo-1499636136210-6f4ee915583e', 'photo-1606313564200-e75d5e30476c', 'photo-1533134242443-d4fd215305ad',
        'photo-1540914124281-342729441458', 'photo-1565557623262-b51c2513a641', 'photo-1512621776951-a57141f2eefd',
        'photo-1546069901-ba9599a7e63c', 'photo-1590005354167-6da97870c912', 'photo-1544943961-bb95965da056',
        'photo-1547592166-23ac45744acd', 'photo-1504674900247-0877df9cc836', 'photo-1490645935967-10de6ba17061',
        'photo-1540189549336-e6e99c3679fe', 'photo-1473093295043-cdd812d0e601', 'photo-1476718406336-bb5a9690ee2a',
        'photo-1482049016688-2d3e1b311543', 'photo-1484723091739-30a097e8f929', 'photo-1543353071-873f17a7a088',
        'photo-1505576399279-565b52d4ac71', 'photo-1511690656952-34342bb7c2f2'
      ];

      const randomIdx = Math.floor(Math.random() * imagePool.length);
      const photoId = imagePool[randomIdx];
      const imageUrl = `https://images.unsplash.com/${photoId}?q=80&w=2000&auto=format&fit=crop&sig=${Math.floor(Math.random() * 9999)}`;

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
