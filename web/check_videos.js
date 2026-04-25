const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const total = await prisma.product.count();
    const withVideo = await prisma.product.count({
      where: { videoUrl: { not: null } }
    });
    
    const recentVideos = await prisma.product.findMany({
      where: { videoUrl: { not: null } },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      select: {
        nombre: true,
        videoUrl: true,
        updatedAt: true
      }
    });

    console.log("--- VIDEO STATS ---");
    console.log(`Total Products: ${total}`);
    console.log(`Products with Video: ${withVideo}`);
    console.log("\nRecently Generated Videos:");
    recentVideos.forEach(v => {
      console.log(`- ${v.nombre} (${v.updatedAt.toISOString()}): ${v.videoUrl}`);
    });
    
  } catch (e) {
    console.error("DB Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}

check();
