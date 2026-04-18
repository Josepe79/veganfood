
import { execSync } from "child_process";
import ffmpegInstaller from "ffmpeg-static";
import fs from "fs";

/**
 * Script de diagnóstico para verificar el entorno de FFmpeg en Railway
 */
function diagnose() {
    console.log("--- DIAGNÓSTICO FFMPEG ---");
    
    // 1. Verificar binario del sistema
    try {
        const which = execSync("which ffmpeg").toString().trim();
        console.log("Sistema 'which ffmpeg':", which);
        if (which) {
            const filters = execSync("ffmpeg -filters").toString();
            console.log("Sistema tiene 'drawtext':", filters.includes("drawtext"));
        }
    } catch (e) {
        console.log("Sistema no tiene ffmpeg en PATH");
    }

    // 2. Verificar binario estático
    try {
        const staticPath = (ffmpegInstaller as any)?.default || ffmpegInstaller;
        console.log("Binario estático path:", staticPath);
        if (fs.existsSync(staticPath)) {
            const filters = execSync(`${staticPath} -filters`).toString();
            console.log("Estático tiene 'drawtext':", filters.includes("drawtext"));
        }
    } catch (e) {
        console.log("Error probando binario estático:", e.message);
    }

    console.log("--- FIN ---");
}

diagnose();
