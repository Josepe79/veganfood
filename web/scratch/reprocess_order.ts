import fs from 'fs';
import path from 'path';
import { prisma } from '../src/lib/prisma';
import { sendOrderConfirmationEmail, sendAdminNewOrderEmail } from '../src/lib/mailer';
import { createPacklinkDraft } from '../src/lib/packlink';

// Cargar .env manualmente antes de que Prisma o cualquier modulo se inicialice
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

const orderId = "cmpnb0k1x00001hyje7808fdr";

async function main() {
    console.log(`🔍 Buscando pedido ${orderId} en la base de datos...`);
    
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            items: {
                include: {
                    product: { select: { nombre: true } }
                }
            }
        }
    });

    if (!order) {
        console.error("❌ Pedido no encontrado en la base de datos.");
        return;
    }

    console.log("✅ Pedido encontrado:");
    console.log(`- Cliente: ${order.customerName} (${order.customerEmail})`);
    console.log(`- Total: ${order.totalAmount}€`);
    console.log(`- Estado actual: ${order.status}`);
    console.log(`- Revolut Order ID: ${order.revolutOrderId}`);

    // 1. Enviar email de confirmación al cliente
    console.log("\n📧 Enviando email de confirmación al cliente...");
    const clientEmailSuccess = await sendOrderConfirmationEmail(
        order.customerEmail,
        order.id,
        order.customerName,
        order.totalAmount
    );
    console.log(clientEmailSuccess ? "✅ Email al cliente enviado." : "❌ Falló el email al cliente.");

    // 2. Enviar email de notificación al admin
    console.log("\n📧 Enviando email de notificación al administrador...");
    const itemsForAdmin = order.items.map(item => ({
        productName: item.product.nombre,
        quantity: item.quantity,
        price: item.price
    }));
    const adminEmailSuccess = await sendAdminNewOrderEmail(
        order.id,
        order.customerName,
        order.customerEmail,
        order.customerPhone,
        order.address,
        order.totalAmount,
        itemsForAdmin
    );
    console.log(adminEmailSuccess ? "✅ Email al admin enviado." : "❌ Falló el email al admin.");

    // 3. Crear borrador en Packlink
    console.log("\n📦 Creando borrador en Packlink...");
    const packlinkDetails = {
        orderId: order.id,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        address: order.address,
        totalAmount: order.totalAmount
    };
    const packlinkResult = await createPacklinkDraft(packlinkDetails);
    if (packlinkResult) {
        console.log(`✅ Borrador de Packlink creado con referencia: ${packlinkResult.reference}`);
    } else {
        console.log("❌ Falló la creación del borrador en Packlink.");
    }

    // Opcional: Asegurarse de que el estado en la base de datos está como PROCESSING (ya está) o actualizarlo a PAID si es necesario.
    // Como el administrador ya está procesando la compra a Feliubadaló, mantenerlo en PROCESSING es lo correcto para la logística.
    console.log("\n🏁 Reprocesamiento completado.");
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
