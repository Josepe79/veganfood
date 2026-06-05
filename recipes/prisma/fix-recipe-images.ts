import { PrismaClient } from '@prisma/client';
import { getBestImageForRecipe } from '../src/lib/imageRepository';

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Iniciando Re-asignación Semántica de Imágenes para Recetas...");
  
  const recipes = await prisma.recipe.findMany({
    where: {
      NOT: {
        imagen: {
          startsWith: 'data:image'
        }
      }
    },
    select: { id: true, nombre: true, ingredientes: true, imagen: true }
  });

  console.log(`📦 Analizando ${recipes.length} recetas...`);
  let actualizadas = 0;

  const hfToken = process.env.HF_TOKEN;
  if (!hfToken) {
    console.error("❌ Falta HF_TOKEN en el entorno.");
    process.exit(1);
  }

  for (const recipe of recipes) {
    const prompt = `A professional food photography top-down view of ${recipe.nombre}, vegan food, highly detailed, photorealistic, 4k resolution`;
    
    try {
      console.log(`⏳ Generando imagen en Hugging Face (FLUX.1) para: ${recipe.nombre}...`);
      const response = await fetch("https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${hfToken}`
        },
        body: JSON.stringify({
          inputs: prompt
        })
      });

      if (!response.ok) {
        console.error(`❌ Error de Hugging Face para ${recipe.nombre}:`, await response.text());
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
      console.log(`✅ [${recipe.nombre}] -> Imagen Hugging Face guardada en DB.`);
      actualizadas++;
    } catch (err) {
      console.error(`❌ Fallo de red con ${recipe.nombre}:`, err);
    }
  }


  console.log(`\n🎉 ¡Proceso completado! Se han actualizado ${actualizadas} recetas con imágenes semánticas.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
