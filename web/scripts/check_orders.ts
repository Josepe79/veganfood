import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const orders = await prisma.order.findMany({
    include: {
      items: {
        include: { product: { select: { nombre: true, ean: true } } }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  if (orders.length === 0) {
    console.log("❌ No hay pedidos en la base de datos.");
    return;
  }

  console.log(`\n📦 TOTAL PEDIDOS: ${orders.length}\n${"─".repeat(80)}`);

  for (const o of orders) {
    console.log(`\n🆔 ID:         ${o.id}`);
    console.log(`📅 Fecha:      ${o.createdAt.toLocaleString("es-ES")}`);
    console.log(`👤 Cliente:    ${o.customerName}`);
    console.log(`📧 Email:      ${o.customerEmail}`);
    console.log(`📞 Teléfono:   ${o.customerPhone ?? "—"}`);
    console.log(`🏠 Dirección:  ${o.address ?? "—"}`);
    console.log(`💶 Total:      ${o.totalAmount.toFixed(2)}€`);
    console.log(`🔖 Estado:     ${o.status}`);
    console.log(`💳 RevolutID:  ${o.revolutOrderId ?? "⚠️  SIN ID (nunca llegó el webhook)"}`);
    console.log(`🚚 Tracking:   ${o.trackingNumber ?? "—"}`);
    console.log(`🛍️  Productos:`);
    for (const item of o.items) {
      console.log(`   • ${item.product.nombre} (EAN: ${item.product.ean ?? "—"}) x${item.quantity} — ${(item.price * item.quantity).toFixed(2)}€`);
    }
    console.log("─".repeat(80));
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
