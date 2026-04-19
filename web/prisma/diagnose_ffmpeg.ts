import { execSync } from "child_process";
import ffmpegInstaller from "ffmpeg-static";
import fs from "fs";

/**
 * Función de diagnóstico para ser llamada desde una API o script
 */
export function runFfmpegDiagnosis() {
    const results: any = {
        timestamp: new Date().toISOString(),
        system: {},
        static: {}
    };
    
    // 1. Verificar binario del sistema
    try {
        const whichFound = execSync("which ffmpeg").toString().trim();
        results.system.path = whichFound;
        if (whichFound) {
            const version = execSync("ffmpeg -version").toString().split("\n")[0];
            results.system.version = version;
            const filters = execSync("ffmpeg -filters").toString();
            results.system.hasDrawtext = filters.includes("drawtext");
            results.system.allFilters = filters.split("\n").filter(f => f.includes("drawtext")).map(f => f.trim());
        }
    } catch (e: any) {
        results.system.error = e.message;
    }

    // 2. Verificar binario estático
    try {
        const staticPath = (ffmpegInstaller as any)?.default || ffmpegInstaller;
        results.static.path = staticPath;
        if (fs.existsSync(staticPath)) {
            const version = execSync(`${staticPath} -version`).toString().split("\n")[0];
            results.static.version = version;
            const filters = execSync(`${staticPath} -filters`).toString();
            results.static.hasDrawtext = filters.includes("drawtext");
        }
    } catch (e: any) {
        results.static.error = e.message;
    }

    return results;
}

// Para ejecución directa vía tsx
if (require.main === module) {
    console.log(JSON.stringify(runFfmpegDiagnosis(), null, 2));
}
