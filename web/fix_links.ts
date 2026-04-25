import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function fix() {
    console.log("Iniciando saneamiento de enlaces...");
    const products = await prisma.product.findMany({
        where: {
            OR: [
                { competenciaUrl: "" },
                { competenciaUrl: null }
            ],
            precioCompetencia: { not: null }
        }
    });

    console.log(`Arreglando ${products.length} productos con enlaces vacíos...`);

    for (const p of products) {
        // En lugar de un enlace roto o vacío, generamos una búsqueda en Google Shopping como fallback útil
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(p.nombre + ' ' + p.marca)}&tbm=shop`;
        await prisma.product.update({
            where: { id: p.id },
            data: { competenciaUrl: searchUrl }
        });
    }

    console.log("¡Saneamiento completado con éxito!");
    await prisma.$disconnect();
}

fix();
