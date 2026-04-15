import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function GET() {
    try {
        const promotedCount = await prisma.product.count({
            where: { enPromocion: true }
        });

        const latestPromoted = await prisma.product.findMany({
            where: { enPromocion: true },
            select: { id: true, nombre: true, enPromocion: true },
            orderBy: { updatedAt: 'desc' },
            take: 15
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

/**
 * RESET DE EMERGENCIA: Quita todas las promociones de golpe.
 * Se llama haciendo un POST a /api/diag
 */
export async function POST() {
    try {
        const result = await prisma.product.updateMany({
            where: { enPromocion: true },
            data: { enPromocion: false }
        });

        revalidatePath("/");
        revalidatePath("/admin");

        return NextResponse.json({
            status: "success",
            message: "All promotions cleared",
            count: result.count
        });
    } catch (e: any) {
        return NextResponse.json({ status: "error", message: e.message }, { status: 500 });
    }
}
