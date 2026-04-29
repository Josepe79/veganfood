import { PrismaClient } from '@prisma/client';
import { getBestImageForRecipe } from '../src/lib/imageRepository';

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Iniciando Re-asignación Semántica de Imágenes para Recetas...");
  
  const recipes = await prisma.recipe.findMany({
    select: { id: true, nombre: true, ingredientes: true, imagen: true }
  });

  console.log(`📦 Analizando ${recipes.length} recetas...`);
  let actualizadas = 0;

  for (const recipe of recipes) {
    const newImageUrl = getBestImageForRecipe(recipe.nombre, recipe.ingredientes);
    
    // Si la imagen sugerida (ignorando el parámetro aleatorio de la URL) es distinta de la base
    const baseNewImage = newImageUrl.split('?')[0];
    const baseOldImage = recipe.imagen ? recipe.imagen.split('?')[0] : '';

    if (baseNewImage !== baseOldImage) {
      await prisma.recipe.update({
        where: { id: recipe.id },
        data: { imagen: newImageUrl }
      });
      console.log(`✅ [${recipe.nombre}] -> Nueva imagen asignada.`);
      actualizadas++;
    } else {
      console.log(`➖ [${recipe.nombre}] -> Imagen mantenida (ya era correcta).`);
    }
  }

  console.log(`\n🎉 ¡Proceso completado! Se han actualizado ${actualizadas} recetas con imágenes semánticas.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
