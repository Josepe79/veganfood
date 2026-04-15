import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

/**
 * API para Gestión del Centro de Auditoría Vegana
 * Método: POST
 * Body: { productIds: string[], action: "VALIDATE" | "HIDE" | "DELETE" }
 */
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { productIds, action } = body;

        if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
            return NextResponse.json({ status: "error", message: "No se enviaron IDs de productos válidos" }, { status: 400 });
        }

        console.log(`[API AUDIT] Acción requerida: ${action} sobre ${productIds.length} ítems`);

        switch (action) {
            case "VALIDATE":
                // Marcar como "Seguro/Ya no requiere revisión" dejando oculto como está (o forzándolo a false si prefieres que se hagan públicos enseguida)
                await prisma.product.updateMany({
                    where: { id: { in: productIds } },
                    data: { needsReview: false }
                });
                break;
            
            case "HIDE":
                // Ocultar al público y dar por completada la revisión
                await prisma.product.updateMany({
                    where: { id: { in: productIds } },
                    data: { oculto: true, needsReview: false }
                });
                break;

            case "DELETE":
                // Borrar permanentemente de la base de datos (purgar catálogo)
                await prisma.product.deleteMany({
                    where: { id: { in: productIds } }
                });
                break;

            default:
                return NextResponse.json({ status: "error", message: "Acción no reconocida" }, { status: 400 });
        }

        try {
            revalidatePath("/");
            revalidatePath("/admin");
        } catch (e) {
            console.error("[API AUDIT] Revalidación fallida (no crítica):", e);
        }

        return NextResponse.json({
            status: "success",
            message: `Acción ${action} completada con éxito`
        });
    } catch (e: any) {
        console.error("[API AUDIT] Error fatal al auditar productos:", e);
        return NextResponse.json({ status: "error", message: e.message }, { status: 500 });
    }
}
