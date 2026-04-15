const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const prods = await prisma.product.findMany({
        where: {
            OR: [
                { isNuevo: true },
                { enPromocion: true }
            ]
        },
        select: { id: true, nombre: true, enPromocion: true }
    });
    console.log("Current Promocion Status:");
    console.log(prods.filter(p => p.enPromocion).map(p => `[PROMO] ${p.nombre}`));
    console.log(`Total Promoted items out of new ones: ${prods.filter(p => p.enPromocion).length}`);
    
    if (prods.length > 0) {
        // Attempt a toggle on the first promoted one, or first one
        const target = prods.find(p => p.enPromocion) || prods[0];
        console.log(`\nAttempting to toggle enPromocion for ${target.nombre} to ${!target.enPromocion}`);
        const result = await prisma.product.update({
            where: { id: target.id },
            data: { enPromocion: !target.enPromocion }
        });
        console.log(`Result: enPromocion is now ${result.enPromocion}`);

        // Revert it
        await prisma.product.update({
            where: { id: target.id },
            data: { enPromocion: target.enPromocion }
        });
        console.log("Reverted successfully.");
    }
}

check().catch(console.error).finally(() => prisma.$disconnect());
