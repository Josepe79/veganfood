import path from "path";
import fs from "fs";

/**
 * Detecta y limpia la ruta del binario de FFmpeg para entornos cloud.
 * PRIORIZA el binario del sistema (instalado vía nixpacks/apt) para asegurar soporte completo de filtros.
 */
export function getFfmpegPath(defaultPath: string): string {
  // 1. PRIORIDAD ABSOLUTA: Buscar binario del sistema (instalo vía nixpacks en Railway)
  try {
    const { execSync } = require("child_process");
    // 'which' es estándar en Linux para encontrar la ruta de un ejecutable
    const systemPath = execSync("which ffmpeg").toString().trim();
    
    if (systemPath && fs.existsSync(systemPath)) {
      console.log(`[FFmpeg] !!! Binario del SISTEMA detectado y PRIORIZADO: ${systemPath}`);
      return systemPath;
    }
  } catch (e) {
    // Si falla 'which' (común en Windows o si no está instalado), seguimos al siguiente paso
  }

  // 2. PRIORIDAD SECUNDARIA: Saneamiento del binario estático de node_modules
  let cleanPath = defaultPath;
  
  // En algunos entornos de electron/cloud, la ruta puede estar dentro de un asar
  if (defaultPath.includes("app.asar")) {
    cleanPath = defaultPath.replace("app.asar", "app.asar.unpacked");
  }

  // Verificamos si la ruta estática existe
  if (fs.existsSync(cleanPath)) {
    console.log(`[FFmpeg] Usando binario ESTATICO (fallback): ${cleanPath}`);
    return cleanPath;
  }

  // 3. FALLBACK FINAL: Intentar ruta relativa directa si todo lo demás falla
  const localFallback = path.join(/*turbopackIgnore: true*/ process.cwd(), "node_modules", "ffmpeg-static", "ffmpeg");
  if (fs.existsSync(localFallback)) {
    return localFallback;
  }

  return defaultPath;
}

/**
 * Elimina comillas y saltos de línea accidentales de las variables de entorno
 */
export function cleanEnvVar(val: string | undefined): string {
  if (!val) return "";
  return val.replace(/^["']|["']$/g, "").trim();
}
