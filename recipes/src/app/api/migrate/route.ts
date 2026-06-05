import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const hfToken = process.env.HF_TOKEN;
  if (!hfToken) {
    return NextResponse.json({ error: "Falta HF_TOKEN en el entorno." }, { status: 500 });
  }

  try {
    const recipes = await prisma.recipe.findMany({
      where: {
        NOT: {
          imagen: {
            startsWith: 'data:image'
          }
        }
      },
      select: { id: true, nombre: true }
    });

    if (recipes.length === 0) {
      return NextResponse.json({ message: "No hay recetas pendientes de migrar." });
    }

    let actualizadas = 0;
    const errors: string[] = [];

    // Hacemos el fetch en serie para no sobrecargar la API gratuita de Hugging Face (límite de rate)
    for (const recipe of recipes) {
      const prompt = `A professional food photography top-down view of ${recipe.nombre}, vegan food, highly detailed, photorealistic, 4k resolution`;
      
      try {
        const response = await fetch("https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${hfToken}`
          },
          body: JSON.stringify({ inputs: prompt })
        });

        if (!response.ok) {
          errors.push(`Error en ${recipe.nombre}: ${await response.text()}`);
          continue;
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Str = buffer.toString('base64');
        const newImageUrl = `data:image/jpeg;base64,${base64Str}`;
        
        await prisma.recipe.update({
          where: { id: recipe.id },
          data: { imagen: newImageUrl }
        });
        
        actualizadas++;
        
        // Esperamos 2 segundos entre peticiones para no saturar la API
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (err: any) {
        errors.push(`Excepción en ${recipe.nombre}: ${err.message}`);
      }
    }

    return NextResponse.json({ 
      message: `Migración completada. ${actualizadas} actualizadas.`,
      errors 
    });
  } catch (globalErr: any) {
    return NextResponse.json({ error: globalErr.message }, { status: 500 });
  }
}
