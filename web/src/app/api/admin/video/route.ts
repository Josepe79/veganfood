import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { generateVideoMetadata, backgroundRenderTask } from "@/app/admin/actions";

export const dynamic = 'force-dynamic';

/**
 * API para Disparar Generación de Vídeo IA (Multifase)
 */
export async function POST(req: Request) {
    try {
        const { productId } = await req.json();

        if (!productId) {
            return NextResponse.json({ status: "error", message: "ID de producto no válido" }, { status: 400 });
        }

        // FASE 1: Generación Síncrona (Esperamos a que el Guion y la Voz estén listos)
        // Esto garantiza que la conexión no se cierre antes de guardar algo en DB.
        console.log(`[API VIDEO] Iniciando Fase 1 para ${productId}...`);
        const { script, voicePath, product } = await generateVideoMetadata(productId);

        // FASE 2: Renderizado Asíncrono (FFmpeg ocurre en segundo plano)
        backgroundRenderTask(productId, script, voicePath, product).catch(err => {
            console.error(`[API VIDEO] Fallo en Fase 2 para ${productId}:`, err);
        });

        console.log(`[API VIDEO] Fase 1 completada. Renderizado en curso para: ${product.nombre}`);

        return NextResponse.json({ 
            status: "success", 
            message: "Guion generado. Renderizando vídeo en segundo plano..." 
        });

    } catch (e: any) {
        console.error("[API VIDEO] Error fatal:", e);
        return NextResponse.json({ 
            status: "error", 
            message: e.message || "Error interno del servidor" 
        }, { status: 500 });
    }
}
