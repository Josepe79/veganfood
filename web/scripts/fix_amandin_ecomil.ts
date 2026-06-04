import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const targets = [
    { search: "Avena Barista 0 Azucares", unidades: 6 },
    { search: "Ecomil", unidades: 6 },
  ];

  for (const t of targets) {
    const productos = await prisma.product.findMany({
      where: { nombre: { contains: t.search, mode: "insensitive" } },
      select: { id: true, nombre: true, precioOriginal: true, precioVenta: true, margen: true, formato: true }
    });

    for (const p of productos) {
      const costeUnitario = p.precioOriginal / t.unidades;
      const pvpUnitario = parseFloat((p.precioVenta / t.unidades).toFixed(2));
      const nuevoMargen = (pvpUnitario - costeUnitario) / costeUnitario;

      console.log(`\n📦 ${p.nombre}`);
      console.log(`   ID: ${p.id}`);
      console.log(`   Coste pack: ${p.precioOriginal.toFixed(2)}€ ÷ ${t.unidades} = ${costeUnitario.toFixed(2)}€/ud`);
      console.log(`   PVP pack:   ${p.precioVenta.toFixed(2)}€ ÷ ${t.unidades} = ${pvpUnitario.toFixed(2)}€/ud → Margen: ${(nuevoMargen*100).toFixed(1)}%`);

      // Corregir a precio unitario
      await prisma.product.update({
        where: { id: p.id },
        data: {
          nombre: p.nombre.replace(/\s*\d+[xX]\d+[Ll]\s*/g, " ").replace(/\s+/g, " ").trim() + " 1L",
          formato: "1 litro (unidad)",
          precioOriginal: parseFloat(costeUnitario.toFixed(2)),
          precioVenta: pvpUnitario,
          margen: parseFloat(nuevoMargen.toFixed(4))
        }
      });
      console.log(`   ✅ Corregido a precio unitario.`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
