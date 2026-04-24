import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando semilla de recetas...');

  const lasagna = await prisma.recipe.upsert({
    where: { slug: 'lasana-vegana-heura' },
    update: {},
    create: {
      nombre: 'Lasaña Vegana de "No-Pollo" y Bechamel de Almendras',
      slug: 'lasana-vegana-heura',
      descripcion: 'Una lasaña cremosa, reconfortante y 100% vegetal. Usamos Heura para una textura perfecta y una bechamel casera de almendras que te sorprenderá.',
      imagen: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=2064&auto=format&fit=crop',
      prepTime: 45,
      cookTime: 20,
      dificultad: 'Media',
      publicado: true,
      instrucciones: JSON.stringify([
        "Saltea los Heura Chunks con un poco de aceite de oliva y cebolla picada hasta que estén dorados.",
        "Para la bechamel: En un cazo, mezcla harina, aceite y añade poco a poco la Bebida de Almendras hasta obtener una textura cremosa.",
        "Montaje: Capa de láminas de lasaña, capa de relleno, bechamel... y repite.",
        "Final: Cubre generosamente con el Queso Vegano rallado y hornea a 200ºC durante 20 min."
      ]),
      ingredientes: JSON.stringify([
        { name: "Heura Chunks (No-Pollo)", amount: "320g", productId: "cmny6i7c402122oo50c33h44x" },
        { name: "Queso Vegano Rallado (Violife)", amount: "150g", productId: "cmny6i7c402122oo50c33h44y" },
        { name: "Bebida de Almendras Bio", amount: "500ml", productId: "cmny6i7c402122oo50c33h44z" },
        { name: "Láminas de Lasaña Sin Huevo", amount: "12 uds" }
      ])
    }
  });

  console.log(`✅ Receta creada: ${lasagna.nombre}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
