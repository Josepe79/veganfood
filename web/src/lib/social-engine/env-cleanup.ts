import path from "path";
import fs from "fs";

/**
 * Detecta y limpia la ruta del binario de FFmpeg para entornos cloud.
 * PRIORIZA el binario del sistema para asegurar soporte completo de filtros.
 */
export function getFfmpegPath(staticPath: string): string {
  const { execSync } = require("child_process");

  // 1. PRIORIDAD: Intentar llamar a "ffmpeg" directamente (si está en el PATH funciona)
  try {
    const versionOut = execSync("ffmpeg -version").toString();
    if (versionOut.includes("ffmpeg version")) {
      console.log(`[FFmpeg] !!! Binario de SISTEMA detectado vía ejecución directa.`);
      return "ffmpeg"; // Si funciona a secas, fluent-ffmpeg lo usará bien
    }
  } catch (e) {}

  // 2. Intentar localizarlo vía "which"
  try {
    const systemPath = execSync("which ffmpeg").toString().trim();
    if (systemPath && fs.existsSync(systemPath)) {
      console.log(`[FFmpeg] !!! Binario de SISTEMA detectado vía 'which': ${systemPath}`);
      return systemPath;
    }
  } catch (e) {}

  // 3. Rutas manuales comunes en Railway/Linux
  const manualPaths = ["/usr/bin/ffmpeg", "/usr/local/bin/ffmpeg", "/nix/var/nix/profiles/default/bin/ffmpeg"];
  for (const p of manualPaths) {
    if (fs.existsSync(p)) {
      console.log(`[FFmpeg] !!! Binario de SISTEMA detectado vía RUTA MANUAL: ${p}`);
      return p;
    }
  }

  // 4. FALLBACK: Binario estático de node_modules (si todo lo demás falla)
  let cleanPath = staticPath;
  if (staticPath.includes("app.asar")) {
    cleanPath = staticPath.replace("app.asar", "app.asar.unpacked");
  }

  if (fs.existsSync(cleanPath)) {
    console.log(`[FFmpeg] Usando binario ESTATICO (fallback): ${cleanPath}`);
    return cleanPath;
  }

  // Fallback final: Devolver lo que diga el instalador
  return staticPath;
}

/**
 * Elimina comillas y saltos de línea accidentales de las variables de entorno
 */
export function cleanEnvVar(val: string | undefined): string {
  if (!val) return "";
  return val.replace(/^["']|["']$/g, "").trim();
}
