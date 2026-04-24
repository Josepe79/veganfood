import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const total = await prisma.product.count({
        where: { descripcion: { not: null } }
    });

    const rewritten = await prisma.product.count({
        where: {
            descripcion: { startsWith: '<h3>' }
        }
    });

    console.log(`\n========================================`);
    console.log(`📊 ESTADO DE LA REESCRITURA B2C`);
    console.log(`========================================`);
    console.log(`Total de productos con descripción: ${total}`);
    console.log(`Fichas reescritas con IA (B2C): ${rewritten}`);
    console.log(`Porcentaje completado: ${((rewritten / total) * 100).toFixed(2)}%`);
    console.log(`========================================\n`);
}

main().finally(() => prisma.$disconnect());
