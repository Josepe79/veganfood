import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
        return NextResponse.json({ error: "Missing product ID" }, { status: 400 });
    }

    try {
        const product = await prisma.product.findUnique({
            where: { id },
            select: { videoUrl: true, captions: true }
        });

        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        let status = "DRAFTING";
        let errorMessage = null;
        let finalVideoUrl = product.videoUrl;

        if (product.videoUrl) {
            if (product.videoUrl.startsWith("STATUS:RENDERING")) {
                status = "RENDERING";
                finalVideoUrl = null; // No es una URL válida aún
            } else if (product.videoUrl.startsWith("STATUS:ERROR:")) {
                status = "ERROR";
                errorMessage = product.videoUrl.replace("STATUS:ERROR:", "");
                finalVideoUrl = null;
            } else {
                status = "COMPLETED";
            }
        } else if (product.captions) {
            // Retrocompatibilidad: Si tiene captions pero no videoUrl, asumimos que está en renderizado si fue reciente
            status = "RENDERING";
        }

        return NextResponse.json({ 
            ready: status === "COMPLETED", 
            status,
            errorMessage,
            videoUrl: finalVideoUrl, 
            captions: product.captions 
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
