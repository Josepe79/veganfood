import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Regla: costeOriginal = coste_pack / unidades_en_pack
// Formato: [id, nombre_nuevo, unidades_pack, pvp_actual]
const fixes = [
  {
    id: "cmny6e6d701ie2oo5upshzlkh",
    nombre: "Bebida Vegetal Avena y Algas Bio 1L Natumi",
    formato: "1 litro (unidad)",
    unidades: 6,
    costePack: 11.10,
    pvp: 2.45
  },
  {
    id: "cmny6gl8c01xr2oo5cl7e34ox",
    nombre: "Bebida Vegetal Arroz SinGluten Bio Vegan 1L Natumi",
    formato: "1 litro (unidad)",
    unidades: 6,
    costePack: 9.84,
    pvp: 2.20
  },
  {
    id: "cmny6gle001xs2oo553j71cf1",
    nombre: "Bebida Vegetal Soja Bio Vegan 1L Natumi",
    formato: "1 litro (unidad)",
    unidades: 8,
    costePack: 11.36,
    pvp: 1.89
  },
  {
    id: "cmny6glp801xu2oo58ehtp4uy",
    nombre: "Bebida Vegetal Avena Bio Vegan 1L Natumi",
    formato: "1 litro (unidad)",
    unidades: 6,
    costePack: 9.84,
    pvp: 2.20
  },
  {
    id: "cmny6g6b201v32oo5sgc9f98x",
    nombre: "Bebida Vegetal Arroz y Coco SinGluten Bio Vegan 1L Natumi",
    formato: "1 litro (unidad)",
    unidades: 8,
    costePack: 16.56,
    pvp: 2.80
  },
];

// También buscar los 3 productos específicos del usuario por nombre parcial
const specificNames = [
  "Diat Radisson",
  "Avena Barista 0 Azucares",
  "Avena Barista 8x1L",
];

async function main() {
  console.log(`\n🔧 Corrigiendo ${fixes.length} productos Natumi...\n${"─".repeat(70)}`);

  for (const fix of fixes) {
    const costeUnitario = parseFloat((fix.costePack / fix.unidades).toFixed(2));
    const margen = parseFloat(((fix.pvp - costeUnitario) / costeUnitario).toFixed(4));

    const updated = await prisma.product.update({
      where: { id: fix.id },
      data: {
        nombre: fix.nombre,
        formato: fix.formato,
        precioOriginal: costeUnitario,
        margen,
        precioVenta: fix.pvp
      }
    });

    console.log(`✅ ${updated.nombre}`);
    console.log(`   Coste: ${fix.costePack}€ pack÷${fix.unidades} = ${costeUnitario}€/ud | PVP: ${fix.pvp}€ | Margen: ${(margen*100).toFixed(1)}% 🟢\n`);
  }

  // Buscar y mostrar los 3 específicos del usuario (por si están en la parte truncada)
  console.log(`\n🔍 Buscando los 3 productos específicos mencionados...\n${"─".repeat(70)}`);
  for (const name of specificNames) {
    const p = await prisma.product.findFirst({
      where: { nombre: { contains: name, mode: "insensitive" } },
      select: { id: true, nombre: true, formato: true, precioOriginal: true, precioVenta: true, margen: true }
    });
    if (p) {
      const m = (p.margen * 100).toFixed(1);
      const alerta = p.margen < 0 ? "🔴 NECESITA CORRECCIÓN" : "🟢 OK";
      console.log(`📦 ${p.nombre}`);
      console.log(`   ID: ${p.id} | Coste: ${p.precioOriginal.toFixed(2)}€ | PVP: ${p.precioVenta.toFixed(2)}€ | Margen: ${m}% ${alerta}\n`);
    } else {
      console.log(`❓ No encontrado: "${name}"`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
