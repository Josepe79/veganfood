import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Iniciando Re-asignación Semántica de Imágenes para Recetas...");
  
  const recipes = await prisma.recipe.findMany({
    select: { id: true, nombre: true, ingredientes: true, imagen: true }
  });

  console.log(`📦 Analizando ${recipes.length} recetas...`);
  let actualizadas = 0;

  for (const recipe of recipes) {
    const prompt = `${recipe.nombre}, vegan food, professional food photography, top-down view, highly detailed, 4k resolution`;
    const encodedPrompt = encodeURIComponent(prompt);
    const newImageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1200&height=800&nologo=true`;
    
    await prisma.recipe.update({
      where: { id: recipe.id },
      data: { imagen: newImageUrl }
    });
    console.log(`✅ [${recipe.nombre}] -> Imagen generativa asignada.`);
    actualizadas++;
  }

  console.log(`\n🎉 ¡Proceso completado! Se han actualizado ${actualizadas} recetas con imágenes semánticas.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
