import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("🔄 Buscando productos con margen del 10% (0.10) para recalcular...");

    const products = await prisma.product.findMany({
        where: {
            margen: 0.10
        }
    });

    console.log(`📝 Encontrados ${products.length} productos con margen del 10%.`);

    if (products.length === 0) {
        console.log("✅ No hay productos pendientes de recálculo.");
        return;
    }

    let actualizados = 0;

    for (const p of products) {
        // Fórmula: PVP = (Costo B2B * 1.30 margen) * 1.10 IVA = Costo * 1.43
        const nuevoPrecioVenta = parseFloat((p.precioOriginal * 1.30 * 1.10).toFixed(2));
        
        await prisma.product.update({
            where: { id: p.id },
            data: {
                margen: 0.30,
                precioVenta: nuevoPrecioVenta
            }
        });

        actualizados++;
        if (actualizados % 100 === 0 || actualizados === products.length) {
            console.log(`   └─ Sincronizados: [${actualizados}/${products.length}] productos.`);
        }
    }

    console.log(`\n🎉 PROCESO COMPLETADO.`);
    console.log(`✅ ${actualizados} productos actualizados con éxito al margen de 30% + 10% IVA.`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
