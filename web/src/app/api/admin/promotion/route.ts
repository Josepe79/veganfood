import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

/**
 * API UNIVERSAL DE PROMOCIONES
 * Maneja tanto cambios individuales como masivos.
 * Método: POST
 * Body: { productId?: string, productIds?: string[], promote: boolean }
 */
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { productId, productIds, promote } = body;
        const promoteBool = Boolean(promote);

        console.log(`[API PROMO] Recibida orden: Single=${productId}, Bulk=${productIds?.length}, Value=${promoteBool}`);

        if (productId) {
            // Actualización individual
            await prisma.product.update({
                where: { id: productId },
                data: { enPromocion: promoteBool }
            });
        } else if (productIds && Array.isArray(productIds)) {
            // Actualización masiva
            await prisma.product.updateMany({
                where: { id: { in: productIds } },
                data: { enPromocion: promoteBool }
            });
        } else {
            return NextResponse.json({ status: "error", message: "Faltan IDs de producto" }, { status: 400 });
        }

        // Revalidación forzosa de caché
        try {
            revalidatePath("/");
            revalidatePath("/admin");
        } catch (e) {
            console.error("[API PROMO] Revalidación fallida (no crítica):", e);
        }

        return NextResponse.json({
            status: "success",
            message: "Promociones actualizadas correctamente",
            newValue: promoteBool
        });
    } catch (e: any) {
        console.error("[API PROMO] Error fatal:", e);
        return NextResponse.json({ status: "error", message: e.message }, { status: 500 });
    }
}
