import { PrismaClient } from '@prisma/client';
import { prepareSocialMediaVideo } from './src/app/admin/actions';

const prisma = new PrismaClient();

async function main() {
    console.log("Iniciando prueba local de generación de video...");
    // Coger cualquier producto
    const product = await prisma.product.findFirst();
    if (!product) {
        console.error("No hay productos en la base de datos local para probar.");
        return;
    }
    
    console.log(`Simulando peticion para: ${product.nombre} (ID: ${product.id})`);
    try {
        const res = await prepareSocialMediaVideo(product.id);
        console.log("Resultado del prepareSocialMediaVideo:", res);
    } catch (e) {
        console.error("EXCEPCION MORTAL CAPTURADA LOCALMENTE:", e);
    }
}

main().finally(() => prisma.$disconnect());
