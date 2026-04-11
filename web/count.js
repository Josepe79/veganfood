const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.product.count();
  console.log("TOTAL PRODUCTS IN DB ASSIGNED IN .ENV:", count);
}
main().finally(() => prisma.$disconnect());
