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

    const videoDir = path.join(process.cwd(), "tmp", "video-out");
    const filePath = path.join(videoDir, fileName);

    if (!filePath.startsWith(videoDir)) return new NextResponse("Acceso denegado", { status: 403 });

    if (!fs.existsSync(filePath)) {
        console.error(`[Stream API] 404: ${filePath}`);
        return new NextResponse("Video no encontrado", { status: 404 });
    }

    const stats = fs.statSync(filePath);
    const fileSize = stats.size;
    const range = req.headers.get("range");

    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        if (start >= fileSize) {
            return new NextResponse(null, {
                status: 416,
                headers: { "Content-Range": `bytes */${fileSize}` }
            });
        }

        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(filePath, { start, end });
        
        // Convertimos el stream de Node a un ReadableStream de Web (necesario para NextResponse)
        const stream = new ReadableStream({
            start(controller) {
                file.on("data", (chunk) => controller.enqueue(chunk));
                file.on("end", () => controller.close());
                file.on("error", (err) => controller.error(err));
            },
            cancel() {
                file.destroy();
            }
        });

        return new NextResponse(stream, {
            status: 206,
            headers: {
                "Content-Range": `bytes ${start}-${end}/${fileSize}`,
                "Accept-Ranges": "bytes",
                "Content-Length": chunksize.toString(),
                "Content-Type": "video/mp4",
            }
        });
    } else {
        const stream = new ReadableStream({
            start(controller) {
                const file = fs.createReadStream(filePath);
                file.on("data", (chunk) => controller.enqueue(chunk));
                file.on("end", () => controller.close());
                file.on("error", (err) => controller.error(err));
            }
        });

        return new NextResponse(stream, {
            headers: {
                "Content-Length": fileSize.toString(),
                "Content-Type": "video/mp4",
            }
        });
    }
}
