const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const p = await prisma.product.findFirst({
      where: { nombre: { contains: 'Zumo Nectar Naranja Bio' } }
    });
    
    if (!p) {
      console.log("PRODUCT NOT FOUND");
      return;
    }

    console.log("--- PRODUCT STATUS ---");
    console.log(`Nombre: ${p.nombre}`);
    console.log(`ID: ${p.id}`);
    console.log(`VideoUrl: ${p.videoUrl || 'NULL'}`);
    console.log(`Captions Found: ${p.captions ? 'YES' : 'NO'}`);
    if (p.captions) {
        console.log("Captions Content:", JSON.stringify(p.captions, null, 2));
    }
    console.log(`UpdatedAt: ${p.updatedAt.toISOString()}`);
    
  } catch (e) {
    console.error("DB Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}

check();
