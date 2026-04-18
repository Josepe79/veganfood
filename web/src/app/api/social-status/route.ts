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
        if (product.videoUrl) {
            status = "COMPLETED";
        } else if (product.captions) {
            status = "RENDERING";
        }

        return NextResponse.json({ 
            ready: !!product.videoUrl, 
            status,
            videoUrl: product.videoUrl, 
            captions: product.captions 
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
