import fs from "fs";
import path from "path";

/**
 * Limpia una variable de entorno de residuos comunes al copiar/pegar desde .env
 */
export function cleanEnvVar(val: string | undefined): string {
    // ... (logic existing) ...
    if (!val) return "";
    let clean = val.trim();
    clean = clean.replace(/^["']|["']$/g, "");
    const firstPart = clean.split(/[\n\r\s]/)[0];
    if (firstPart.includes("=")) {
        return firstPart.split("=")[1].trim();
    }
    return firstPart.trim();
}

/**
 * Intenta localizar el binario de FFmpeg de forma robusta
 */
export function getFfmpegPath(staticPath: string | null): string {
    // 1. Intentar el binario global del sistema (Lo más fiable en Linux/Railway)
    const systemPaths = ["/usr/bin/ffmpeg", "/usr/local/bin/ffmpeg", "ffmpeg"];
    for (const p of systemPaths) {
        try {
            // Un simple check de existencia no basta para "ffmpeg" a secas, 
            // pero si es una ruta absoluta sí.
            if (p.startsWith("/") && fs.existsSync(p)) return p;
        } catch(e) {}
    }

    // 2. Intentar el estático detectado, pero saneando la ruta
    if (staticPath) {
        // Si la ruta detectada empieza por /ROOT/ (común en errores de build), 
        // intentamos transformarla a /app/ o relativa
        let cleanStatic = staticPath.replace(/^["']|["']$/g, "").trim();
        if (cleanStatic.startsWith("/ROOT/")) {
            cleanStatic = cleanStatic.replace("/ROOT/", "/app/");
        }
        
        if (fs.existsSync(cleanStatic)) return cleanStatic;
        
        // Intentar relativa al proceso actual
        const relativePath = path.join(process.cwd(), "node_modules", "ffmpeg-static", "ffmpeg");
        if (fs.existsSync(relativePath)) return relativePath;
    }

    // 3. Fallback final: devolver lo que dio el instalador o simplemente "ffmpeg"
    return staticPath || "ffmpeg";
}
