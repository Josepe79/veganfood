import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const recipes = await prisma.recipe.findMany();
  console.log(`Actualizando imágenes para ${recipes.length} recetas...`);

  for (const recipe of recipes) {
    const keyword = recipe.nombre.split(" ").pop() || "vegan";
    const imageUrl = `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2000&auto=format&fit=crop&sig=${Math.floor(Math.random() * 1000)}&search=${encodeURIComponent(keyword)}`;
    
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
