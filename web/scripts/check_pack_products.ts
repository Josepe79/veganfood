import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Buscar productos cuyo nombre o formato sugiera que son packs/cajas
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { nombre: { contains: "x1L", mode: "insensitive" } },
        { nombre: { contains: "x1l", mode: "insensitive" } },
        { nombre: { contains: "x 1L", mode: "insensitive" } },
        { nombre: { contains: "x500", mode: "insensitive" } },
        { nombre: { contains: "x 500", mode: "insensitive" } },
        { nombre: { contains: "x200", mode: "insensitive" } },
        { nombre: { contains: "x250", mode: "insensitive" } },
        { nombre: { contains: "x400", mode: "insensitive" } },
        { nombre: { contains: "pack", mode: "insensitive" } },
        { nombre: { contains: "caja", mode: "insensitive" } },
        { formato: { contains: "unidades", mode: "insensitive" } },
        { formato: { contains: "x1", mode: "insensitive" } },
      ],
      oculto: false
    },
    select: {
      id: true,
      nombre: true,
      formato: true,
      precioOriginal: true,
      precioVenta: true,
      margen: true,
      marca: true,
    },
    orderBy: { nombre: "asc" }
  });

  if (products.length === 0) {
    console.log("✅ No se encontraron productos con formato de pack.");
    return;
  }

  console.log(`\n⚠️  ${products.length} productos con posible formato de PACK:\n${"─".repeat(90)}`);
  
  for (const p of products) {
    const margenPct = (p.margen * 100).toFixed(1);
    const margenAlerta = p.margen < 0 ? "🔴 MARGEN NEGATIVO" : p.margen < 0.15 ? "🟡 margen bajo" : "🟢";
    console.log(`\n📦 ${p.nombre}`);
    console.log(`   Marca:    ${p.marca}`);
    console.log(`   Formato:  ${p.formato ?? "—"}`);
    console.log(`   Coste B2B: ${p.precioOriginal.toFixed(2)}€  |  PVP: ${p.precioVenta.toFixed(2)}€  |  Margen: ${margenPct}% ${margenAlerta}`);
    console.log(`   ID: ${p.id}`);
  }
  console.log("\n" + "─".repeat(90));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
