import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const productId = "cmny65833001t2oo5zitrn1ik"; // Bebida Avena Barista

  // El coste B2B de Feliubadaló es por el pack de 6 unidades
  // Coste real por unidad individual: 9.96€ / 6 = 1.66€
  const costePorUnidad = 9.96 / 6; // 1.66€

  // Precio de venta actual (lo que realmente se cobra)
  const precioVenta = 2.99;
  const margen = (precioVenta - costePorUnidad) / costePorUnidad; // ~80%

  const updated = await prisma.product.update({
    where: { id: productId },
    data: {
      precioOriginal: parseFloat(costePorUnidad.toFixed(2)),
      margen: parseFloat(margen.toFixed(4)),
      precioVenta: precioVenta,
      // Corregimos el nombre para que sea claro que se vende por unidad de 1L
      nombre: "Bebida Vegetal Avena Barista Bio 1L Ekotrebol",
      formato: "1 litro (unidad)"
    }
  });

  console.log("✅ Producto actualizado:");
  console.log(`   Nombre:         ${updated.nombre}`);
  console.log(`   Formato:        ${updated.formato}`);
  console.log(`   Coste B2B:      ${updated.precioOriginal}€`);
  console.log(`   Precio venta:   ${updated.precioVenta}€`);
  console.log(`   Margen real:    ${(updated.margen * 100).toFixed(1)}%`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
