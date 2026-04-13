"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { sendOrderPreparingEmail, sendOrderShippedEmail } from "@/lib/mailer";

export async function marcarPedidosComoComprados() {
  try {
    // 1. Buscamos pedidos que estén en espera de compra (PENDING o PAID)
    const ordersToProcess = await prisma.order.findMany({
      where: {
        status: { in: ["PENDING", "PAID"] }
      }
    });

    if (ordersToProcess.length === 0) return { success: true };

    // 2. Cambiamos estado de forma masiva
    await prisma.order.updateMany({
      where: {
        id: { in: ordersToProcess.map(o => o.id) }
      },
      data: {
        status: "PROCESSING" // En preparación
      }
    });

    // 3. Disparamos correos de "En Preparación"
    ordersToProcess.forEach(order => {
      sendOrderPreparingEmail(order.customerEmail, order.id, order.customerName)
        .catch(err => console.error(`Error enviando email preparación a ${order.id}:`, err));
    });

    revalidatePath("/admin");
    return { success: true };
  } catch(error: any) {
    return { success: false, error: error.message };
  }
}

export async function shipOrder(orderId: string, trackingNumber: string) {
    try {
        const order = await prisma.order.update({
            where: { id: orderId },
            data: {
                status: "SHIPPED",
                trackingNumber: trackingNumber
            }
        });

        // Enviamos confirmación de envío con tracking
        await sendOrderShippedEmail(order.customerEmail, order.id, order.customerName, trackingNumber);

        revalidatePath("/admin");
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function deleteOrder(orderId: string) {
  try {
    await prisma.order.delete({
      where: { id: orderId }
    });
    revalidatePath("/admin");
    return { success: true };
  } catch(error: any) {
    console.error("Error deleting order:", error);
    return { success: false, error: error.message };
  }
}

export async function hideProduct(productId: string) {
    try {
        await prisma.product.update({
            where: { id: productId },
            data: { oculto: true }
        });
        revalidatePath('/');
        revalidatePath('/admin');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function updateProductPrice(productId: string, newPrice: number) {
    try {
        await prisma.product.update({
            where: { id: productId },
            data: { precioVenta: newPrice }
        });
        revalidatePath('/');
        revalidatePath('/admin');
        return { success: true };
    } catch(e: any) {
        return { success: false, error: e.message };
    }
}

export async function hideProductsBulk(productIds: string[]) {
    try {
        await prisma.product.updateMany({
            where: { id: { in: productIds } },
            data: { oculto: true }
        });
        revalidatePath('/');
        revalidatePath('/admin');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function recoverProduct(productId: string) {
    try {
        await prisma.product.update({
            where: { id: productId },
            data: { oculto: false }
        });
        revalidatePath('/');
        revalidatePath('/admin');
        return { success: true };
    } catch(e: any) {
        return { success: false, error: e.message };
    }
}

export async function togglePromotion(productId: string, promote: boolean) {
    try {
        await prisma.product.update({
            where: { id: productId },
            data: { enPromocion: promote }
        });
        revalidatePath('/');
        revalidatePath('/admin');
        return { success: true };
    } catch(e: any) {
        return { success: false, error: e.message };
    }
}

export async function promoteProductsBulk(productIds: string[], promote: boolean = true) {
    try {
        await prisma.product.updateMany({
            where: { id: { in: productIds } },
            data: { enPromocion: promote }
        });
        revalidatePath('/');
        revalidatePath('/admin');
        return { success: true };
    } catch(e: any) {
        return { success: false, error: e.message };
    }
}
