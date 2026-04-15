import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const promotedCount = await prisma.product.count({
            where: { enPromocion: true }
        });

        const latestPromoted = await prisma.product.findMany({
            where: { enPromocion: true },
            select: { id: true, nombre: true },
            orderBy: { updatedAt: 'desc' },
            take: 5
        });

        return NextResponse.json({
            status: "ok",
            timestamp: new Date().toISOString(),
            promotedProductsCount: promotedCount,
            latestPromoted
        });
    } catch (e: any) {
        return NextResponse.json({ status: "error", message: e.message }, { status: 500 });
    }
}
