import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const IMAGE_MAP: Record<string, string> = {
  'galleta': 'photo-1499636136210-6f4ee915583e',
  'brownie': 'photo-1606313564200-e75d5e30476c',
  'tarta': 'photo-1533134242443-d4fd215305ad',
  'mousse': 'photo-1540914124281-342729441458',
  'lasaña': 'photo-1565557623262-b51c2513a641',
  'smoothie': 'photo-1512621776951-a57141f2eefd',
  'bowl': 'photo-1546069901-ba9599a7e63c',
  'ensalada': 'photo-1512621776951-a57141f2eefd',
  'postre': 'photo-1540914124281-342729441458',
  'chocolate': 'photo-1606313564200-e75d5e30476c',
  'default': 'photo-1490645935967-10de6ba17061'
};

async function main() {
  const recipes = await prisma.recipe.findMany();
  console.log(`Actualizando con Mapeo Inteligente para ${recipes.length} recetas...`);

  for (const recipe of recipes) {
    const nombreLower = recipe.nombre.toLowerCase();
    let photoId = IMAGE_MAP['default'];

    for (const [key, id] of Object.entries(IMAGE_MAP)) {
      if (nombreLower.includes(key)) {
        photoId = id;
        break;
      }
    }

    const imageUrl = `https://images.unsplash.com/${photoId}?q=80&w=2000&auto=format&fit=crop&sig=${recipe.id.substring(0, 5)}`;
    
    await prisma.recipe.update({
      where: { id: recipe.id },
      data: { imagen: imageUrl }
    });
    console.log(`✅ Imagen coherente asignada para: ${recipe.nombre}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
