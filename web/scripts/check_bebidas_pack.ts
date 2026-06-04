import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Buscar los 3 productos específicos
  const productos = await prisma.product.findMany({
    where: {
      OR: [
        { nombre: { contains: "Diat Radisson", mode: "insensitive" } },
        { nombre: { contains: "Amandin", mode: "insensitive" } },
        { nombre: { contains: "Natumi", mode: "insensitive" } },
      ]
    },
    select: {
      id: true, nombre: true, formato: true,
      precioOriginal: true, precioVenta: true, margen: true, marca: true
    }
  });

  console.log(`\n📋 ${productos.length} productos encontrados:\n${"─".repeat(80)}`);
  for (const p of productos) {
    const m = (p.margen * 100).toFixed(1);
    const alerta = p.margen < 0 ? "🔴 MARGEN NEGATIVO" : "🟢";
    console.log(`\n📦 ${p.nombre}`);
    console.log(`   ID: ${p.id}`);
    console.log(`   Formato: ${p.formato ?? "—"}`);
    console.log(`   Coste B2B: ${p.precioOriginal.toFixed(2)}€  |  PVP: ${p.precioVenta.toFixed(2)}€  |  Margen: ${m}% ${alerta}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
