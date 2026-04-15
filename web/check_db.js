const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const match = await prisma.product.findFirst({
    where: { nombre: { contains: 'Chocolate Blanco Eco Vegan' } }
  });
  console.log(match);
  const count = await prisma.product.count();
  console.log('Total products:', count);
}
main().catch(console.error).finally(() => prisma.$disconnect());
