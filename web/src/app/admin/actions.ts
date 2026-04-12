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
