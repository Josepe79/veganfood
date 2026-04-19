import path from "path";
import fs from "fs";

/**
 * Detecta y limpia la ruta del binario de FFmpeg para entornos cloud.
 * PRIORIZA el binario descargado manualmente en bin/ffmpeg para asegurar éxito 100%.
 */
export function getFfmpegPath(staticPath: string): string {
  const { execSync } = require("child_process");

  // 1. PRIORIDAD NUCLEAR: El binario que descargamos nosotros en el build
  const manualBinPath = path.join(/*turbopackIgnore: true*/ process.cwd(), "bin", "ffmpeg");
  if (fs.existsSync(manualBinPath)) {
    try {
      // Verificamos que sea ejecutable y funcione
      const out = execSync(`${manualBinPath} -version`).toString();
      if (out.includes("ffmpeg version")) {
        console.log(`[FFmpeg] !!! Binario MANUAL detectado y verificado: ${manualBinPath}`);
        return manualBinPath;
      }
    } catch (e) {
      console.warn(`[FFmpeg] Binario manual en ${manualBinPath} existe pero falló al ejecutar.`);
    }
  }

  // 2. PRIORIDAD SISTEMA: Rutas estándar de Linux
  const systemPaths = ["/usr/bin/ffmpeg", "/usr/local/bin/ffmpeg", "/nix/var/nix/profiles/default/bin/ffmpeg"];
  for (const p of systemPaths) {
    if (fs.existsSync(p)) {
      console.log(`[FFmpeg] !!! Binario del SISTEMA detectado vía RUTA FIJA: ${p}`);
      return p;
    }
  }

  // 3. Intentar llamar a "ffmpeg" directamente
  try {
    const versionOut = execSync("ffmpeg -version").toString();
    if (versionOut.includes("ffmpeg version")) {
      console.log(`[FFmpeg] !!! Binario de SISTEMA detectado vía ejecución directa.`);
      return "ffmpeg";
    }
  } catch (e) {}

  // 4. FALLBACK y SANEAMIENTO: Binario estático de node_modules
  let cleanPath = staticPath;
  if (staticPath.startsWith("/ROOT/")) {
    cleanPath = staticPath.replace("/ROOT/", "/app/");
  }
  
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

  return staticPath;
}

/**
 * Elimina comillas y saltos de línea accidentales de las variables de entorno
 */
export function cleanEnvVar(val: string | undefined): string {
  if (!val) return "";
  return val.replace(/^["']|["']$/g, "").trim();
}
