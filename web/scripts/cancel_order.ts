import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const updated = await prisma.order.update({
    where: { id: "cmp8fbu7i000365h3htbyo0v8" },
    data: { status: "CANCELLED" }
  });
  console.log(`✅ Pedido de Luz Dary (16/5) cancelado: ${updated.id} → ${updated.status}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
