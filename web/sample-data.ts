import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function sample() {
    const products = await prisma.product.findMany({
        take: 3,
        select: { nombre: true, descripcion: true, ingredientes: true }
    });
    console.log(JSON.stringify(products, null, 2));
}

sample().then(() => process.exit(0));
