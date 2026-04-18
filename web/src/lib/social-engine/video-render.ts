import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "ffmpeg-static";
import path from "path";
import fs from "fs";

import { getFfmpegPath } from "./env-cleanup";

// Configuramos fluent-ffmpeg para usar el binario estático con detección de ESM/CJS
const initialStaticPath = (ffmpegInstaller as any)?.default || ffmpegInstaller;
const ffmpegPath = getFfmpegPath(initialStaticPath);

if (ffmpegPath) {
  ffmpeg.setFfmpegPath(ffmpegPath);
  console.log(`[FFmpeg] Ruta del binario FINAL detectada: ${ffmpegPath}`);
}

export interface VideoAsset {
  productImage: string;
  voiceAudio: string;
  musicAudio?: string;
  overlays: { text: string; time: number }[];
  outputName: string;
}

/**
 * Genera un video vertical optimizado (480x854) para redes sociales
 */
export async function renderSocialVideo(assets: VideoAsset): Promise<string> {
  const outputDir = path.join(process.cwd(), "tmp", "video-out");
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  
  const outputPath = path.join(outputDir, assets.outputName);
  
  // Si no hay música proporcionada, intentamos coger una aleatoria de la carpeta stock
  let musicPath = assets.musicAudio;
  if (!musicPath) {
    const stockDir = path.join(process.cwd(), "public", "audio", "stock");
    if (fs.existsSync(stockDir)) {
      const files = fs.readdirSync(stockDir).filter(f => f.endsWith(".mp3"));
      if (files.length > 0) {
        musicPath = path.join(stockDir, files[Math.floor(Math.random() * files.length)]);
      }
    }
  }

  return new Promise((resolve, reject) => {
    let command = ffmpeg(assets.productImage);
    command.input(assets.voiceAudio);
    
    if (musicPath) {
      command.input(musicPath);
    }

    const filters: any[] = [
      // 1. Fondo optimizado (480x854) con desenfoque
      {
        filter: "scale", options: "480:854:force_original_aspect_ratio=increase,crop=480:854,boxblur=10:5",
        inputs: "0:v", outputs: "bg"
      },
      // 2. Imagen frontal (centrada)
      {
        filter: "scale", options: "400:-2", // -2 asegura que la altura sea par para libx264
        inputs: "0:v", outputs: "fg"
      },
      // 3. Overlay final
      {
        filter: "overlay", options: "(W-w)/2:(H-h)/2",
        inputs: ["bg", "fg"], outputs: "vout"
      }
    ];

    if (musicPath) {
      filters.push(
        { filter: "volume", options: "1.5", inputs: "1:a", outputs: "v_voice" },
        { filter: "volume", options: "0.2", inputs: "2:a", outputs: "v_music" },
        { filter: "amix", options: "inputs=2:duration=first", inputs: ["v_voice", "v_music"], outputs: "aout" }
      );
    }

    // 4. Subtítulos (Drawtext)
    // Usamos la fuente Geist que encontramos en node_modules
    const fontPath = path.join(process.cwd(), "node_modules", "next", "dist", "compiled", "@vercel", "og", "Geist-Regular.ttf");
    const safeFontPath = fontPath.replace(/\\/g, "/").replace(/:/g, "\\:");
    
    // Necesitamos encadenar los textos sobre la salida de video 'vout'
    let lastOutput = "vout";
        // ESCAPE ROBUSTO PARA FFMPEG DRAWTEXT:
        // 1. Quitar comillas simples si ya existen para evitar duplicados
        // 2. Escapar comillas simples internas: ' -> '\''
        // 3. Escapar dos puntos: : -> \:
        const escapedText = ov.text
            .replace(/'/g, "'\\''")
            .replace(/:/g, "\\:");

        // Construimos las opciones manualmente para evitar que fluent-ffmpeg las ensucie
        const drawtextOpts = [
            `fontfile=${fs.existsSync(fontPath) ? safeFontPath : "Arial"}`,
            `text='${escapedText}'`,
            `fontcolor=white`,
            `fontsize=36`,
            `box=1`,
            `boxcolor=black@0.6`,
            `boxborderw=10`,
            `x=(w-text_w)/2`,
            `y=h-150`,
            `enable=between(t,${startTime},${endTime})`
        ].join(":");

        filters.push({
            filter: "drawtext",
            options: drawtextOpts,
            inputs: lastOutput,
            outputs: nextOutput
        });
        lastOutput = nextOutput;
    });

    command.complexFilter(filters, musicPath ? [lastOutput, "aout"] : [lastOutput]);

    if (!musicPath) {
      command.outputOptions(["-map 1:a"]);
    }

    // KILL SWITCH: Si en 120 segundos no ha terminado, matamos el proceso
    const timeout = setTimeout(() => {
        console.error("[FFmpeg] !!! TIMEOUT de 120s alcanzado. Matando proceso.");
        (command as any).kill("SIGKILL");
        reject(new Error("Timeout de renderizado (120s)"));
    }, 120000);

    command
      .outputOptions([
        "-c:v libx264",
        "-c:a aac",       // FORZAR AAC: Crucial para compatibilidad en navegadores
        "-preset superfast",
        "-pix_fmt yuv420p",
        "-r 24",
        "-t 12",
        "-movflags +faststart" // Optimiza la reproducción inicial en web
      ])
      .on("start", (cmd) => {
          console.log("[FFmpeg] Ejecutando comando:", cmd);
      })
      .on("end", () => {
          clearTimeout(timeout);
          console.log("[FFmpeg] Renderizado exitoso.");
          resolve(outputPath);
      })
      .on("error", (err) => {
          clearTimeout(timeout);
          console.error("[FFmpeg] Error detectado:", err);
          reject(err);
      })
      .save(outputPath);
  });
}
