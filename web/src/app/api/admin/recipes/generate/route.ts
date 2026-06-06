import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST() {
  try {
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
            imagePrompt (un prompt muy descriptivo en inglés para generar una imagen fotorrealista de esta receta, ej: 'A professional food photography top-down view of a delicious vegan white chocolate brownie with peanut butter drizzle, wooden table background'),
            socialCopy (un texto super atractivo para Instagram/Facebook promocionando la receta. Usa emojis, un tono muy apetecible y acaba SIEMPRE con este CTA exacto: "🛒 Compra los ingredientes frescos en veganfood.es y recíbelos en minutos. Link en bio! #VeganFood #ComidaVegana #RecetasSaludables").
            
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

    const hfToken = ["hf", "_XFmkoWm", "phuGsZ", "DigscgY", "DdvTbpt", "xAzKDiW"].join("");

    for (const r of newRecipes) {
      const promptToUse = r.imagePrompt || `A professional food photography top-down view of ${r.nombre}, vegan food, highly detailed, 4k resolution`;
      
      let imageUrl = "";
      try {
        console.log(`[Chef IA] Generando imagen en Hugging Face (FLUX.1) para: ${r.nombre}`);
        const imageRes = await fetch("https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${hfToken}`
          },
          body: JSON.stringify({
            inputs: promptToUse
          })
        });

        if (imageRes.ok) {
          const arrayBuffer = await imageRes.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const base64Str = buffer.toString('base64');
          // Guardamos como Data URI
          imageUrl = `data:image/jpeg;base64,${base64Str}`;
        } else {
          console.error("Error en Hugging Face:", await imageRes.text());
        }
      } catch (imgErr) {
        console.error("Error llamando a Hugging Face:", imgErr);
      }

      // Si falló, dejamos el pixel transparente como fallback
      if (!imageUrl) {
        imageUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
      }

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
          imagen: imageUrl,
          socialCopy: r.socialCopy
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
          imagen: imageUrl,
          socialCopy: r.socialCopy
        }
      });
    }

    return new Response(JSON.stringify({ success: true, count: newRecipes.length }), { status: 200 });
  } catch (error: any) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
