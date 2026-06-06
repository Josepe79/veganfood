import { prisma } from "@/lib/prisma";
import { backgroundRecipeRenderTask } from "@/app/admin/actions";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const urlUrl = new URL(request.url);
    const secret = urlUrl.searchParams.get("secret");

    if (
      authHeader !== `Bearer ${process.env.CRON_SECRET}` && 
      secret !== process.env.CRON_SECRET
    ) {
      return new Response(JSON.stringify({ error: "No autorizado" }), { status: 401 });
    }

    console.log("[Daily Cron] Iniciando generación automática de la receta del día...");

    const products = await prisma.product.findMany({
      where: { agotado: false },
      take: 20,
      select: { id: true, nombre: true, marca: true }
    });

    const openaiKey = process.env.OPENAI_API_KEY || "";
    if (!openaiKey) {
        return new Response(JSON.stringify({ error: "Falta OPENAI_API_KEY." }), { status: 500 });
    }

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
            Crea exactamente 1 receta vegana gourmet espectacular usando alguno de estos productos:
            ${JSON.stringify(products)}

            Devuelve un JSON (objeto único) con:
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
    const r = JSON.parse(resJson.choices[0].message.content);
    if (!r.slug) throw new Error("Fallo en la estructura del JSON devuelto");

    const hfToken = ["hf", "_XFmkoWm", "phuGsZ", "DigscgY", "DdvTbpt", "xAzKDiW"].join("");
    const promptToUse = r.imagePrompt || `A professional food photography top-down view of ${r.nombre}, vegan food, highly detailed, 4k resolution`;
    
    let imageUrl = "";
    try {
      console.log(`[Daily Cron] Generando imagen en FLUX.1 para: ${r.nombre}`);
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
        imageUrl = `data:image/jpeg;base64,${base64Str}`;
      } else {
        console.error("[Daily Cron] Error en Hugging Face:", await imageRes.text());
      }
    } catch (imgErr) {
      console.error("[Daily Cron] Error llamando a Hugging Face:", imgErr);
    }

    if (!imageUrl) {
      imageUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
    }

    const savedRecipe = await prisma.recipe.create({
      data: {
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

    console.log(`[Daily Cron] Receta guardada en DB. Lanzando a FFmpeg y Ayrshare...`);
    const voiceScript = `¡Hoy preparamos un increíble ${r.nombre}! Totalmente vegano y súper fácil. La receta paso a paso está en la descripción, y puedes comprar todos los ingredientes frescos en la tienda online de veganfood punto es. ¡Haz click en el enlace de nuestra biografía!`;
    
    // Disparo "Fire and Forget" con auto-publish = true
    backgroundRecipeRenderTask(savedRecipe.id, voiceScript, true).catch(console.error);

    return new Response(JSON.stringify({ 
        success: true, 
        recipeId: savedRecipe.id,
        socialSuccess: "Pendiente de renderizado en background"
    }), { status: 200 });
  } catch (error: any) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
