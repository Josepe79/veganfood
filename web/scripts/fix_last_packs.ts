import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // 1. Corregir Avena Barista 8x1L Natumi (÷8)
  const natumi = await prisma.product.update({
    where: { id: "cmny657n4001q2oo5ptqpw4po" },
    data: {
      nombre: "Bebida Vegetal Avena Barista 1L Natumi",
      formato: "1 litro (unidad)",
      precioOriginal: parseFloat((14.56 / 8).toFixed(2)), // 1.82€
      margen: parseFloat(((2.45 - 14.56/8) / (14.56/8)).toFixed(4)),
      precioVenta: 2.45
    }
  });
  console.log(`✅ ${natumi.nombre} | Coste: ${natumi.precioOriginal.toFixed(2)}€ | PVP: ${natumi.precioVenta.toFixed(2)}€ | Margen: ${(natumi.margen*100).toFixed(1)}% 🟢`);

  // 2. Buscar "Bebida Avena Barista SinGluten 6x1L Diat Radisson" más específicamente
  const diat = await prisma.product.findMany({
    where: {
      AND: [
        { nombre: { contains: "Barista", mode: "insensitive" } },
        { nombre: { contains: "Radisson", mode: "insensitive" } }
      ]
    },
    select: { id: true, nombre: true, precioOriginal: true, precioVenta: true, margen: true, formato: true }
  });

  console.log(`\n🔍 Búsqueda "Barista + Radisson": ${diat.length} resultado(s)`);
  for (const p of diat) {
    const m = (p.margen * 100).toFixed(1);
    const alerta = p.margen < 0 ? "🔴 NECESITA CORRECCIÓN" : "🟢 OK";
    console.log(`   📦 ${p.nombre} | Coste: ${p.precioOriginal.toFixed(2)}€ | PVP: ${p.precioVenta.toFixed(2)}€ | Margen: ${m}% ${alerta}`);
  }

  // Si no encuentra, buscar solo "Barista" + "6x1"
  if (diat.length === 0) {
    const barista6 = await prisma.product.findMany({
      where: { nombre: { contains: "Barista", mode: "insensitive" } },
      select: { id: true, nombre: true, precioOriginal: true, precioVenta: true, margen: true, formato: true }
    });
    console.log(`\n🔍 Todos los "Barista": ${barista6.length} resultado(s)`);
    for (const p of barista6) {
      const m = (p.margen * 100).toFixed(1);
      const alerta = p.margen < 0 ? "🔴 NECESITA CORRECCIÓN" : "🟢 OK";
      console.log(`   📦 ${p.nombre} | Coste: ${p.precioOriginal.toFixed(2)}€ | PVP: ${p.precioVenta.toFixed(2)}€ | Margen: ${m}% ${alerta}`);
      console.log(`      ID: ${p.id} | Formato: ${p.formato ?? "—"}`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
