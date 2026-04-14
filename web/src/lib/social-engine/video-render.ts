import ffmpeg from "fluent-ffmpeg";
import path from "path";
import fs from "fs";

export interface VideoAsset {
  productImage: string;
  voiceAudio: string;
  musicAudio?: string;
  overlays: { text: string; time: number }[];
  outputName: string;
}

/**
 * Genera un video vertical (9:16) para TikTok/Instagram
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
      // 1. Fondo de video
      {
        filter: "scale", options: "1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=20:10",
        inputs: "0:v", outputs: "bg"
      },
      // 2. Producto frontal
      {
        filter: "scale", options: "800:-1",
        inputs: "0:v", outputs: "fg"
      },
      // 3. Superposición video final
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
      // Si no hay música extra, mapear solo voz original (entrada 1)
      command.outputOptions(["-map 1:a"]);
    }

    command
      .outputOptions([
        "-c:v libx264",
        "-preset ultrafast",
        "-pix_fmt yuv420p",
        "-r 30",
        "-t 15" // Máximo 15 segundos
      ])
      .on("start", (cmd) => console.log("Empezando renderizado FFmpeg:", cmd))
      .on("end", () => resolve(outputPath))
      .on("error", (err) => {
          console.error("Fallo grave de FFmpeg:", err);
          reject(err);
      })
      .save(outputPath);
  });
}
