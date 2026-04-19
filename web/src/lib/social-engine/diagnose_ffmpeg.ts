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

    // 3. Verificar binario NUCLEAR (Manual)
    try {
        const manualPath = path.join(process.cwd(), "bin", "ffmpeg");
        results.nuclear = { path: manualPath };
        if (fs.existsSync(manualPath)) {
            const version = execSync(`${manualPath} -version`).toString().split("\n")[0];
            results.nuclear.version = version;
            const filters = execSync(`${manualPath} -filters`).toString();
            results.nuclear.hasDrawtext = filters.includes("drawtext");
        } else {
            results.nuclear.exists = false;
        }
    } catch (e: any) {
        results.nuclear.error = e.message;
    }

    return results;
}

// Para ejecución directa vía tsx
if (require.main === module) {
    console.log(JSON.stringify(runFfmpegDiagnosis(), null, 2));
}
