import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "ffmpeg-static";
import path from "path";
import fs from "fs";

// Configuramos fluent-ffmpeg para usar el binario estático
if (ffmpegInstaller) {
  ffmpeg.setFfmpegPath(ffmpegInstaller);
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
  const outputDir = path.join(process.cwd(), "public", "temp-videos");
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
      // 1. Fondo de video optimizado (480x854) con desenfoque suave
      {
        filter: "scale", options: "480:854:force_original_aspect_ratio=increase,crop=480:854,boxblur=10:5",
        inputs: "0:v", outputs: "bg"
      },
      // 2. Producto frontal dimensionado para 480p
      {
        filter: "scale", options: "400:-1",
        inputs: "0:v", outputs: "fg"
      },
      // 3. Superposición video final centrada
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

    command.complexFilter(filters, musicPath ? ["vout", "aout"] : ["vout"]);

    if (!musicPath) {
      command.outputOptions(["-map 1:a"]);
    }

    command
      .outputOptions([
        "-c:v libx264",
        "-preset superfast", // Balance ideal entre velocidad y calidad en Railway
        "-pix_fmt yuv420p",
        "-r 24", // 24fps es suficiente para estos vídeos y ahorra ciclos de CPU
        "-t 12" // Reducimos a 12s para maxima rapidez de entrega
      ])
      .on("start", (cmd) => console.log("[FFmpeg] Iniciando render optimizado:", cmd))
      .on("end", () => {
          console.log("[FFmpeg] Renderizado completado con éxito.");
          resolve(outputPath);
      })
      .on("error", (err) => {
          console.error("[FFmpeg] Error crítico en renderizado:", err);
          reject(err);
      })
      .save(outputPath);
  });
}
