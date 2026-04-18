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
 * Detecta y limpia la ruta del binario de FFmpeg para entornos cloud
 */
export function getFfmpegPath(defaultPath: string): string {
  // PRIORIDAD 1: Buscar binario del sistema (instalado vía nixpacks/apt)
  // En Linux/Railway suele estar en /usr/bin/ffmpeg o simplemente accesible en el PATH
  try {
    const { execSync } = require("child_process");
    const systemPath = execSync("which ffmpeg").toString().trim();
    if (systemPath && fs.existsSync(systemPath)) {
      console.log(`[FFmpeg] !!! Binario del SISTEMA detectado: ${systemPath}`);
      return systemPath;
    }
  } catch (e) {
    // Si falla 'which ffmpeg', simplemente seguimos
  }

  // PRIORIDAD 2: Binario estático de node_modules
  let cleanPath = defaultPath;
  if (defaultPath.includes("app.asar")) {
    cleanPath = defaultPath.replace("app.asar", "app.asar.unpacked");
  }
  
  if (fs.existsSync(cleanPath)) {
    console.log(`[FFmpeg] Usando binario ESTATICO: ${cleanPath}`);
    return cleanPath;
  }

  return defaultPath;
}
