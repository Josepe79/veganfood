import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const BLACKLIST_PHRASES = [
  /En Feliubadal ofrece.*/gi,
  /En Feliubadal se encuentra.*/gi,
  /En Feliubadal.*al mejor precio.*/gi,
  /excelente opcin para que tiendas y establecimientos.*/gi,
  /posicionǭndolo como.*punto de venta.*/gi,
  /punto de venta/gi,
  /canal profesional/gi,
  /precios profesionales/gi,
  /tiendas especializadas/gi,
  /Feliubadal/gi,
  /Feliubadalo/gi,
  /alta rotacin/gi,
  /distribucin/gi
];

async function main() {
  console.log("🚀 Iniciando Sanitizacin Masiva Anti-B2B...");
  
  const products = await prisma.product.findMany({
    where: { descripcion: { not: null } },
    select: { id: true, nombre: true, descripcion: true }
  });

  console.log(`📦 Analizando ${products.length} productos...`);
  let limpiados = 0;

  for (const product of products) {
    let newDesc = product.descripcion || "";
    let changed = false;

    for (const phrase of BLACKLIST_PHRASES) {
      if (phrase.test(newDesc)) {
        newDesc = newDesc.replace(phrase, "");
        changed = true;
      }
    }

    if (changed) {
      // Limpiar espacios dobles o saltos de lnea hurfanos al final
      newDesc = newDesc.trim().replace(/\n\s*\n/g, '\n\n');
      
      await prisma.product.update({
        where: { id: product.id },
        data: { descripcion: newDesc }
      });
      limpiados++;
    }
  }

  console.log(`✅ ¡Limpieza completada! Se han saneado ${limpiados} fichas de producto.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
