import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

/**
 * API Unificada de Gestión de Productos (Admin)
 */
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { productIds, productId, action, newPrice } = body;

        // Si es una acción masiva, usamos productIds, si es individual, usamos productId
        const ids = productId ? [productId] : productIds;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ status: "error", message: "ID de producto no válido" }, { status: 400 });
        }

        console.log(`[API PRODUCT] Acción: ${action} sobre ${ids.length} productos`);

        switch (action) {
            case "HIDE":
                await prisma.product.updateMany({
                    where: { id: { in: ids } },
                    data: { oculto: true }
                });
                break;

            case "RECOVER":
                await prisma.product.updateMany({
                    where: { id: { in: ids } },
                    data: { oculto: false }
                });
                break;

            case "UPDATE_PRICE":
                if (typeof newPrice !== "number") {
                    return NextResponse.json({ status: "error", message: "Precio no válido" }, { status: 400 });
                }
                await prisma.product.update({
                    where: { id: ids[0] },
                    data: { precioVenta: newPrice }
                });
                break;
            
            case "DELETE_CATALOG": // Para purga del catálogo (físico o lógico)
                // En este sistema DELETE usualmente es HIDE, pero si el usuario quiere purga física:
                await prisma.product.deleteMany({
                    where: { id: { in: ids } }
                });
                break;

            default:
                return NextResponse.json({ status: "error", message: "Acción no reconocida" }, { status: 400 });
        }

        // Revalidación segura (silenciamos errores para no romper la respuesta)
        try {
            revalidatePath("/admin");
            revalidatePath("/");
        } catch (e) {
            console.error("[API PRODUCT] Revalidación fallida:", e);
        }

        return NextResponse.json({ 
            status: "success", 
            message: `Acción ${action} completada correctamente` 
        });

    } catch (e: any) {
        console.error("[API PRODUCT] Error fatal:", e);
        return NextResponse.json({ 
            status: "error", 
            message: e.message || "Error interno del servidor" 
        }, { status: 500 });
    }
}
