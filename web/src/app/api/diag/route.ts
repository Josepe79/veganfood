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

        const lastDebugLog = ""; 
        // Intentar leer el log de debug si existe
        let debugLogTail = "Log file not found or empty";
        try {
            const fs = require('fs');
            const path = require('path');
            const logPath = path.join(process.cwd(), "actions_debug.log");
            if (fs.existsSync(logPath)) {
                debugLogTail = fs.readFileSync(logPath, 'utf8').split('\n').slice(-10).join('\n');
            }
        } catch (e) {}

        return NextResponse.json({
            status: "ok",
            timestamp: new Date().toISOString(),
            promotedProductsCount: promotedCount,
            latestPromoted,
            debugLogTail
        });
    } catch (e: any) {
        return NextResponse.json({ status: "error", message: e.message }, { status: 500 });
    }
}
