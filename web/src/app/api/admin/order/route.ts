import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { sendOrderPreparingEmail, sendOrderShippedEmail } from "@/lib/mailer";

/**
 * API Unificada de Gestión de Pedidos (Admin)
 */
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { orderId, action, trackingNumber } = body;

        console.log(`[API ORDER] Acción: ${action} sobre Pedido: ${orderId || 'Múltiples'}`);

        switch (action) {
            case "MARK_PURCHASED":
                // 1. Buscamos pedidos que estén en espera de compra (PENDING o PAID)
                const ordersToProcess = await prisma.order.findMany({
                    where: { status: { in: ["PENDING", "PAID"] } }
                });

                if (ordersToProcess.length === 0) {
                    return NextResponse.json({ status: "success", message: "No hay pedidos pendientes de procesar" });
                }

                // 2. Cambiamos estado de forma masiva
                await prisma.order.updateMany({
                    where: { id: { in: ordersToProcess.map(o => o.id) } },
                    data: { status: "PROCESSING" }
                });

                // 3. Disparamos correos de "En Preparación" (asíncrono)
                ordersToProcess.forEach(order => {
                    sendOrderPreparingEmail(order.customerEmail, order.id, order.customerName)
                        .catch(err => console.error(`[API ORDER] Error email preparación ${order.id}:`, err));
                });
                break;

            case "SHIP":
                if (!orderId || !trackingNumber) {
                    return NextResponse.json({ status: "error", message: "Faltan datos de envío" }, { status: 400 });
                }
                const shippedOrder = await prisma.order.update({
                    where: { id: orderId },
                    data: {
                        status: "SHIPPED",
                        trackingNumber: trackingNumber
                    }
                });
                // Enviamos confirmación de envío con tracking
                await sendOrderShippedEmail(shippedOrder.customerEmail, shippedOrder.id, shippedOrder.customerName, trackingNumber);
                break;

            case "DELETE":
                if (!orderId) {
                    return NextResponse.json({ status: "error", message: "Falta ID de pedido" }, { status: 400 });
                }
                await prisma.order.delete({
                    where: { id: orderId }
                });
                break;

            default:
                return NextResponse.json({ status: "error", message: "Acción no reconocida" }, { status: 400 });
        }

        try {
            revalidatePath("/admin");
        } catch (e) {
            console.error("[API ORDER] Revalidación fallida:", e);
        }

        return NextResponse.json({ 
            status: "success", 
            message: `Operación ${action} completada con éxito` 
        });

    } catch (e: any) {
        console.error("[API ORDER] Error fatal:", e);
        return NextResponse.json({ 
            status: "error", 
            message: e.message || "Error interno del servidor" 
        }, { status: 500 });
    }
}
