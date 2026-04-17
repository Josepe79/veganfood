import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { backgroundRenderTask } from "@/app/admin/actions";

export const dynamic = 'force-dynamic';

/**
 * API para Disparar Generación de Vídeo IA
 */
export async function POST(req: Request) {
    try {
        const { productId } = await req.json();

        if (!productId) {
            return NextResponse.json({ status: "error", message: "ID de producto no válido" }, { status: 400 });
        }

        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product) {
            return NextResponse.json({ status: "error", message: "Producto no encontrado" }, { status: 404 });
        }

        // Disparamos el trabajo pesado en segundo plano sin esperar a que termine
        // Usamos .catch para registrar errores sin bloquear la respuesta HTTP
        backgroundRenderTask(productId).catch(err => {
            console.error(`[API VIDEO] Fallo en worker asíncrono para \${productId}:`, err);
        });

        console.log(`[API VIDEO] Generación iniciada asíncronamente para: \${product.nombre}`);

        return NextResponse.json({ 
            status: "success", 
            message: "Generación de vídeo iniciada en segundo plano" 
        });

    } catch (e: any) {
        console.error("[API VIDEO] Error fatal:", e);
        return NextResponse.json({ 
            status: "error", 
            message: e.message || "Error interno del servidor" 
        }, { status: 500 });
    }
}
