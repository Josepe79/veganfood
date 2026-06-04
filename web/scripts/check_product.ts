import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const p = await prisma.product.findFirst({ where: { nombre: { contains: "Avena Barista" } } });
  console.log(JSON.stringify(p, null, 2));
  await prisma.$disconnect();
}
main().catch(console.error);

