import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.product.updateMany({
    where: { nombre: { contains: "Matcha Reserve", mode: "insensitive" } },
    data: { agotado: true }
  });
  console.log(`✅ ${result.count} producto(s) marcados como AGOTADO: Te Matcha Reserve 30g Matcha and CO`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
