import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Datos correctos: solo dividimos el coste B2B (que era del pack),
// el PVP ya estaba puesto por unidad. Los Cuisine son productos individuales → restaurar.
const fixes = [
  // Ecomil bebidas: coste=pack/6, PVP=precio unitario original
  { id: "cmny673ds00du2oo5kc1gs64v", nombre: "Bebida Vegetal Avena SinAzucar Bio 1L Ecomil",         formato: "1 litro (unidad)", costePack: 10.56, unidades: 6, pvp: 2.59 },
  { id: "cmny673j800dv2oo5rhec8cl1", nombre: "Bebida Vegetal Espelta Arroz Avellana Avena Bio 1L Ecomil", formato: "1 litro (unidad)", costePack: 13.74, unidades: 6, pvp: 3.36 },
  { id: "cmny674h000e12oo51tm07w4n", nombre: "Bebida Vegetal Coconut Nature Bio 500ml Ecomil",      formato: "500ml (unidad)",    costePack: 8.94,  unidades: 6, pvp: 2.19 },
  { id: "cmny6759200e62oo5079rjry3", nombre: "Bebida Vegetal Almendra Nature Keto Bio 1L Ecomil",    formato: "1 litro (unidad)", costePack: 11.77, unidades: 6, pvp: 3.15 },
  { id: "cmny6eqac01lx2oo5m76ifv0x", nombre: "Bebida Vegetal Almendra Barista SinGluten Bio Vegan 1L Ecomil", formato: "1 litro (unidad)", costePack: 11.82, unidades: 6, pvp: 2.89 },
  { id: "cmny6gxan01zv2oo58ln5ges3", nombre: "Bebida Vegetal Cañamo SinGluten Bio Vegan 1L Ecomil", formato: "1 litro (unidad)", costePack: 12.31, unidades: 6, pvp: 3.35 },
  { id: "cmny69qfm00up2oo5hxeqc8vq", nombre: "Bebida Vegetal Almendra Coco SinGluten Bio Vegan 1L Ecomil", formato: "1 litro (unidad)", costePack: 13.50, unidades: 6, pvp: 3.29 },
  { id: "cmny674yb00e42oo566e3hf70", nombre: "Bebida Vegetal Barista Coconut Bio 1L Ecomil",         formato: "1 litro (unidad)", costePack: 11.02, unidades: 6, pvp: 2.99 },
  { id: "cmny6gxxl01zz2oo50pujsgv8", nombre: "Bebida Vegetal Almendra SinGluten Bio 1L Ecomil",      formato: "1 litro (unidad)", costePack: 13.44, unidades: 6, pvp: 3.29 },
  // Cuisine Ecomil: son productos individuales → restaurar precios originales
  { id: "cmny673uo00dx2oo592tmj8j9", nombre: "Cuisine Coco Bio 1L Ecomil",                           formato: "1 litro (unidad)", costePack: 4.97,  unidades: 1, pvp: 6.75 },
  { id: "cmny6felt01q82oo51qdq81ym", nombre: "Cuisine Anacardo Nature SinGluten Bio Vegan 200ml Ecomil", formato: "200ml (unidad)", costePack: 1.69, unidades: 1, pvp: 2.29 },
  { id: "cmny6fer701q92oo5eaw3wbeb", nombre: "Cuisine Thai Coco SinGluten Bio Vegan 200ml Ecomil",   formato: "200ml (unidad)",  costePack: 1.62,  unidades: 1, pvp: 2.19 },
  { id: "cmny6feg801q72oo5lxlzkinr", nombre: "Cuisine Bechamel Almendras SinGluten Bio Vegan 200ml Ecomil", formato: "200ml (unidad)", costePack: 1.63, unidades: 1, pvp: 2.21 },
];

async function main() {
  console.log(`\n🔧 Corrigiendo ${fixes.length} productos Ecomil...\n${"─".repeat(70)}`);
  for (const f of fixes) {
    const coste = parseFloat((f.costePack / f.unidades).toFixed(2));
    const margen = parseFloat(((f.pvp - coste) / coste).toFixed(4));
    await prisma.product.update({
      where: { id: f.id },
      data: { nombre: f.nombre, formato: f.formato, precioOriginal: coste, precioVenta: f.pvp, margen }
    });
    console.log(`✅ ${f.nombre}`);
    console.log(`   Coste: ${coste.toFixed(2)}€ | PVP: ${f.pvp.toFixed(2)}€ | Margen: ${(margen*100).toFixed(1)}% 🟢`);
  }
  console.log(`\n✅ Todos corregidos.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
