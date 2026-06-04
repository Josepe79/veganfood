import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOrderConfirmationEmail, sendAdminNewOrderEmail } from "@/lib/mailer";
import { createPacklinkDraft } from "@/lib/packlink";

// GET handler: Revolut o cualquier sistema puede hacer un ping de validación
export async function GET() {
  return NextResponse.json({ status: "ok", service: "VeganFood Webhook" }, { status: 200 });
}

export async function POST(req: Request) {
  let rawBody: any = {};
  try {
    const text = await req.text();
    if (text) rawBody = JSON.parse(text);
  } catch {
    // Body vacío o malformado — devolvemos 200 para no bloquear a Revolut
    return NextResponse.json({ received: true }, { status: 200 });
  }

  try {
    const eventType = rawBody.event;
    const revolutOrderId = rawBody.order_id;
    
    // Revolut sends various events. We only care when the order is successfully paid or authorised.
    if (eventType === "ORDER_COMPLETED" || eventType === "ORDER_AUTHORISED") {
      // Cargamos el pedido junto con sus items y el nombre del producto
      const order = await prisma.order.findFirst({
        where: { revolutOrderId },
        include: {
          items: {
            include: {
              product: { select: { nombre: true } }
            }
          }
        }
      });

      if (order) {
        // Marcamos el pedido como PAGADO (retenido en caso de AUTHORISED) para activar logística JIT
        await prisma.order.update({
          where: { id: order.id },
          data: { status: "PAID" }
        });
        console.log(`✅ Orden ${order.id} marcada como PAGADA/RETENIDA exitosamente.`);

        // Email de confirmación al cliente
        sendOrderConfirmationEmail(order.customerEmail, order.id, order.customerName, order.totalAmount)
            .catch(err => console.error("Error disparando promise de email transaccional:", err));

        // 🔔 Email de notificación al admin con todos los datos del cliente y productos
        const itemsForAdmin = order.items.map(item => ({
          productName: item.product.nombre,
          quantity: item.quantity,
          price: item.price
        }));
        sendAdminNewOrderEmail(
          order.id,
          order.customerName,
          order.customerEmail,
          order.customerPhone,
          order.address,
          order.totalAmount,
          itemsForAdmin
        ).catch(err => console.error("Error enviando notificación al admin:", err));

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
