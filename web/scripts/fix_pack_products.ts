import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const fixes = [
    {
      id: "cmny6fahj01pj2oo5ahofqzx3",
      descripcion: "Te Chai Curcuma Yogi Tea (6 cajas → precio por unidad)",
      data: {
        nombre: "Te Chai Curcuma SinGluten Bio Vegan 1 caja x17 infusiones Yogi Tea",
        formato: "1 caja (17 bolsitas)",
        precioOriginal: parseFloat((16.62 / 6).toFixed(2)), // 2.77€
        margen: parseFloat(((4.10 - 16.62/6) / (16.62/6)).toFixed(4)), // ~48%
        precioVenta: 4.10
      }
    },
    {
      id: "cmny69ik500tb2oo5tqfx1an5",
      descripcion: "Whafeel Wafers Espelta Coco (20 unidades → precio por unidad)",
      data: {
        nombre: "Wafer Espelta Coco Eco 30g Solnatural",
        formato: "30g (unidad)",
        precioOriginal: parseFloat((13.40 / 20).toFixed(2)), // 0.67€
        margen: parseFloat(((0.99 - 13.40/20) / (13.40/20)).toFixed(4)), // ~47.8%
        precioVenta: 0.99
      }
    }
  ];

  for (const fix of fixes) {
    const updated = await prisma.product.update({
      where: { id: fix.id },
      data: fix.data
    });

    const margenPct = (updated.margen * 100).toFixed(1);
    console.log(`\n✅ ${fix.descripcion}`);
    console.log(`   Nombre:       ${updated.nombre}`);
    console.log(`   Formato:      ${updated.formato}`);
    console.log(`   Coste B2B:    ${updated.precioOriginal.toFixed(2)}€`);
    console.log(`   Precio venta: ${updated.precioVenta.toFixed(2)}€`);
    console.log(`   Margen real:  ${margenPct}% 🟢`);
  }

  console.log("\n✅ Todos los productos corregidos a precio unitario.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
