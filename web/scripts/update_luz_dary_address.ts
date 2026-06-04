import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const direccionCompleta = "Calle Jaime Janer N54 3C, 36900 Marín, Pontevedra";
  
  // Actualizar todos los pedidos de Luz Dary con la dirección completa
  const result = await prisma.order.updateMany({
    where: { customerEmail: "luzdarymarreromartinez@gmail.com" },
    data: { address: direccionCompleta }
  });

  console.log(`✅ ${result.count} pedido(s) de Luz Dary actualizados con dirección completa:`);
  console.log(`   ${direccionCompleta}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
