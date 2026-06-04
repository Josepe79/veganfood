import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const p = await prisma.product.findFirst({
    where: { nombre: { contains: "Matcha Reserve" } },
    select: { nombre: true, agotado: true, urlOriginal: true, precioOriginal: true }
  });
  console.log(JSON.stringify(p, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
