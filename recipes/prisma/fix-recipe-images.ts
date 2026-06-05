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
    // Extraer palabras clave simples (eliminando preposiciones y conectores)
    const stopWords = ['de', 'y', 'con', 'en', 'al', 'la', 'el', 'las', 'los', 'un', 'una', 'para', 'estilo', 'vegana', 'vegano'];
    const words = recipe.nombre.toLowerCase().split(' ').filter(w => !stopWords.includes(w) && w.length > 3).slice(0, 3);
    const keywords = ['vegan', ...words].join(',');
    
    const encodedKeywords = encodeURIComponent(keywords);
    const lockId = Math.floor(Math.random() * 10000);
    const newImageUrl = `https://loremflickr.com/1200/800/${encodedKeywords}?lock=${lockId}`;
    
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
