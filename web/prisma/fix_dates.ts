import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Ajustando el reloj interno de los productos...");
    
    // Calcular una fecha de hace 14 días
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 14);

    // Actualizar todos los productos para que consten como creados hace 14 días
    const updateResult = await prisma.product.updateMany({
        where: {},
        data: {
            createdAt: pastDate
        }
    });

    console.log(`¡Lista la máquina del tiempo! Se han retrasado ${updateResult.count} productos a hace 14 días.`);
    console.log(`Ahora el filtro "Novedades" (últimos 7 días) mostrará 0 hasta que el proveedor añada algo nuevo.`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
