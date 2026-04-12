import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOrderConfirmationEmail } from "@/lib/mailer";
import { createPacklinkDraft } from "@/lib/packlink";

export async function POST(req: Request) {
  try {
    const rawBody = await req.json();
    const eventType = rawBody.event;
    const revolutOrderId = rawBody.order_id;
    
    // Revolut sends various events. We only care when the order is successfully paid.
    if (eventType === "ORDER_COMPLETED") {
      const order = await prisma.order.findFirst({
        where: { revolutOrderId }
      });

      if (order) {
        // Marcamos el pedido como PAGADO y oficial para activar logística JIT
        await prisma.order.update({
          where: { id: order.id },
          data: { status: "PAID" }
        });
        console.log(`✅ Orden ${order.id} marcada como PAGADA exitosamente.`);

        // Disparamos correo asíncrono al cliente (sin bloquear la API)
        sendOrderConfirmationEmail(order.customerEmail, order.id, order.customerName, order.totalAmount)
            .catch(err => console.error("Error disparando promise de email transaccional:", err));

        // Transmitimos Payload a Packlink silenciosamente (Opción A JIT)
        const packlinkDetails = {
           orderId: order.id,
           customerName: order.customerName,
           customerEmail: order.customerEmail,
           customerPhone: order.customerPhone,
           address: order.address,
           totalAmount: order.totalAmount
        };
        createPacklinkDraft(packlinkDetails)
            .catch(err => console.error("Error mutando hacia Packlink REST API:", err));
      }
    }

    // Revolut expects a 200 OK so it doesn't retry
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Revolut Webhook Error:", error);
    return NextResponse.json({ error: "Webhook Error" }, { status: 500 });
  }
}
