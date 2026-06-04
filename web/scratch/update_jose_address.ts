import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

// Cargar .env manualmente
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
            const key = match[1];
            let value = match[2] || '';
            if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
            if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
            process.env[key] = value;
        }
    });
}

const prisma = new PrismaClient();

async function main() {
    const orderId = "cmpnb0k1x00001hyje7808fdr";
    const direccionCompleta = "Pino Carrasco, 8, Bajo D, 28600 Navalcarnero, Madrid";

    console.log(`🔄 Actualizando dirección del pedido ${orderId}...`);
    const result = await prisma.order.update({
        where: { id: orderId },
        data: { address: direccionCompleta }
    });

    console.log(`✅ Pedido actualizado correctamente para ${result.customerName}.`);
    console.log(`🏠 Nueva dirección: ${result.address}`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
