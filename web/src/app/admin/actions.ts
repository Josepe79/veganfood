"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function marcarPedidosComoComprados() {
  try {
    await prisma.order.updateMany({
      where: {
        status: "PENDING"
      },
      data: {
        status: "PROCESSING" // Meaning B2B purchase has been executed by Admin
      }
    });

    revalidatePath("/admin");
    return { success: true };
  } catch(error: any) {
    return { success: false, error: error.message };
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
