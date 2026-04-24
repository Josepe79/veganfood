import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const recipes = await prisma.recipe.findMany();
  console.log(`Actualizando imágenes para ${recipes.length} recetas...`);

  for (const recipe of recipes) {
    const keyword = recipe.nombre.split(" ").pop() || "vegan-food";
    const imageUrl = `https://loremflickr.com/1200/800/vegan,${encodeURIComponent(keyword)}/all?sig=${Math.floor(Math.random() * 1000)}`;
    
    await prisma.recipe.update({
      where: { id: recipe.id },
      data: { imagen: imageUrl }
    });
    console.log(`✅ Imagen actualizada para: ${recipe.nombre}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
