import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Bebida Avena Barista SinGluten 6x1L Diat Radisson
  // Coste pack 6ud: 14.34€ → por unidad: 14.34/6 = 2.39€
  // PVP actual: 2.99€ → margen: 25.1%
  const updated = await prisma.product.updateMany({
    where: { nombre: "Bebida Avena Barista SinGluten 6x1L Diat Radisson" },
    data: {
      nombre: "Bebida Avena Barista SinGluten 1L Diat Radisson",
      formato: "1 litro (unidad)",
      precioOriginal: parseFloat((14.34 / 6).toFixed(2)),
      margen: parseFloat(((2.99 - 14.34/6) / (14.34/6)).toFixed(4)),
      precioVenta: 2.99
    }
  });

  console.log(`✅ ${updated.count} producto(s) actualizados: Bebida Avena Barista SinGluten 1L Diat Radisson`);
  console.log(`   Coste: 14.34€÷6 = 2.39€/ud | PVP: 2.99€ | Margen: 25.1% 🟢`);

}

main().catch(console.error).finally(() => prisma.$disconnect());
