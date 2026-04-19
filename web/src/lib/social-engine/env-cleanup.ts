import path from "path";
import fs from "fs";

/**
 * Detecta y limpia la ruta del binario de FFmpeg para entornos cloud.
 * PRIORIZA el binario del sistema para asegurar soporte completo de filtros.
 * SANEAMIENTO: Elimina prefijos fantasma como /ROOT/ que causa ENOENT.
 */
export function getFfmpegPath(staticPath: string): string {
  const { execSync } = require("child_process");

  // 1. PRIORIDAD: Rutas estándar de Linux (más fiable que 'which')
  const systemPaths = ["/usr/bin/ffmpeg", "/usr/local/bin/ffmpeg", "/nix/var/nix/profiles/default/bin/ffmpeg"];
  for (const p of systemPaths) {
    if (fs.existsSync(p)) {
      console.log(`[FFmpeg] !!! Binario del SISTEMA detectado vía RUTA FIJA: ${p}`);
      return p;
    }
  }

  // 2. Intentar llamar a "ffmpeg" directamente (si está en el PATH funciona)
  try {
    const versionOut = execSync("ffmpeg -version").toString();
    if (versionOut.includes("ffmpeg version")) {
      console.log(`[FFmpeg] !!! Binario de SISTEMA detectado vía ejecución directa.`);
      return "ffmpeg";
    }
  } catch (e) {}

  // 3. FALLBACK y SANEAMIENTO: Binario estático de node_modules
  // IMPORTANTE: Si la ruta empieza por /ROOT/, es una ruta de build inválida en Railway runtime.
  let cleanPath = staticPath;
  if (staticPath.startsWith("/ROOT/")) {
    cleanPath = staticPath.replace("/ROOT/", "/app/"); // Intentamos el mapeo estándar a /app/
  }
  
  // Si aun así no existe, probamos ruta absoluta local al proyecto
  if (!fs.existsSync(cleanPath)) {
      const absoluteLocal = path.join(/*turbopackIgnore: true*/ process.cwd(), "node_modules", "ffmpeg-static", "ffmpeg");
      if (fs.existsSync(absoluteLocal)) {
          cleanPath = absoluteLocal;
      }
  }

  if (fs.existsSync(cleanPath)) {
    console.log(`[FFmpeg] Usando binario ESTATICO (saneado): ${cleanPath}`);
    return cleanPath;
  }

  // Fallback final: Devolver lo que diga el instalador pero avisando
  console.warn(`[FFmpeg] !!! ADVERTENCIA: No se encontró un binario válido. Usando fallback arriesgado: ${staticPath}`);
  return staticPath;
}

/**
 * Elimina comillas y saltos de línea accidentales de las variables de entorno
 */
export function cleanEnvVar(val: string | undefined): string {
  if (!val) return "";
  return val.replace(/^["']|["']$/g, "").trim();
}
