import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = 'force-dynamic';

/**
 * Streaming Proxy: Sirve videos generados dinámicamente que el servidor 
 * estático de Next.js no puede ver en tiempo real.
 */
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const fileName = searchParams.get("file");

    if (!fileName) {
        return new NextResponse("Falta el nombre del archivo", { status: 400 });
    }

    // Carpeta centralizada para videos (usamos tmp por ser área de escritura permitida)
    const videoDir = path.join(process.cwd(), "tmp", "video-out");
    const filePath = path.join(videoDir, fileName);

    // Seguridad: Evitar Directory Traversal
    if (!filePath.startsWith(videoDir)) {
        return new NextResponse("Acceso denegado", { status: 403 });
    }

    if (!fs.existsSync(filePath)) {
        console.error(`[Stream API] Archivo no encontrado: ${filePath}`);
        return new NextResponse("Video no encontrado en el servidor", { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    
    // Devolvemos el chorro de datos con el MIME type correcto
    return new NextResponse(fileBuffer, {
        headers: {
            "Content-Type": "video/mp4",
            "Content-Disposition": `inline; filename="${fileName}"`,
            "Cache-Control": "no-cache"
        }
    });
}
