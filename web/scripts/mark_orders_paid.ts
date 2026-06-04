import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Pedidos confirmados como pagados por Revolut
// AJUSTA: si Eva solo tiene 1 cobro, comenta la segunda línea de Eva
const PAID_ORDER_IDS = [
  "cmp85tft2000065h3ysypic9m",  // Belen Hostalet — 13.96€ — 16/5
  "cmp9wjolp000d65h31skjl0f1",  // Eva Domínguez — 18.06€ — 17/5 (1er pedido)
  "cmp9wefi3000965h3gvff34zj",  // Eva Domínguez — 18.06€ — 17/5 (2º pedido) ← comenta si solo 1 cobro
  "cmpb4ieyj000h65h3pcdw1ccs",  // Luz Dary — 35.57€ — 18/5
];

async function main() {
  console.log(`\n🔄 Marcando ${PAID_ORDER_IDS.length} pedidos como PAID...\n`);

  for (const id of PAID_ORDER_IDS) {
    const order = await prisma.order.update({
      where: { id },
      data: { status: "PAID" },
      include: { items: { include: { product: { select: { nombre: true } } } } }
    });

    console.log(`✅ ${order.customerName} — ${order.totalAmount.toFixed(2)}€ → PAID`);
    console.log(`   📧 ${order.customerEmail} | 📞 ${order.customerPhone}`);
    console.log(`   🏠 ${order.address}`);
    for (const item of order.items) {
      console.log(`   • ${item.product.nombre} x${item.quantity}`);
    }
    console.log();
  }

  console.log("✅ Todos los pedidos actualizados. Ya aparecen en el panel admin para gestionar en Feliubadaló.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
