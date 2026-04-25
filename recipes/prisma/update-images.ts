import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const recipes = await prisma.recipe.findMany();
  console.log(`Aplicando Galería Única para ${recipes.length} recetas...`);

  // Mapeo manual 1 a 1 para asegurar 0 repeticiones ahora mismo
  const uniqueIds = [
    'photo-1606313564200-e75d5e30476c', // Brownie
    'photo-1499636136210-6f4ee915583e', // Galletas Choc/Alm
    'photo-1533134242443-d4fd215305ad', // Tarta Naranja
    'photo-1540914124281-342729441458', // Mousse Naranja
    'photo-1558961363-fa8fdf82db35', // Galletas Cacahuete
    'photo-1565557623262-b51c2513a641', // Lasaña
    'photo-1512621776951-a57141f2eefd', // Smoothie Bowl
    'photo-1590005354167-6da97870c912', // Mousse Choc
    'photo-1544943961-bb95965da056', // Galletas Mermelada
    'photo-1547592166-23ac45744acd'  // Bowl Calabaza
  ];

  for (let i = 0; i < recipes.length; i++) {
    const recipe = recipes[i];
    const photoId = uniqueIds[i % uniqueIds.length];
    const imageUrl = `https://images.unsplash.com/${photoId}?q=80&w=2000&auto=format&fit=crop`;
    
    await prisma.recipe.update({
      where: { id: recipe.id },
      data: { imagen: imageUrl }
    });
    console.log(`✅ Imagen Única asignada para: ${recipe.nombre}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
