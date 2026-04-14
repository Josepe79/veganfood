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
    let command = ffmpeg(assets.productImage)
      // Crear fondo desenfocado (Blurred background)
      .complexFilter([
        // 1. Reescalar y desenfocar la imagen original para el fondo 1080x1920
        {
          filter: "scale", options: "1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=20:10",
          inputs: "0:v", outputs: "bg"
        },
        // 2. Escalar imagen del producto para el frente
        {
          filter: "scale", options: "800:-1",
          inputs: "0:v", outputs: "fg"
        },
        // 3. Superponer frente sobre fondo
        {
          filter: "overlay", options: "(W-w)/2:(H-h)/2",
          inputs: ["bg", "fg"], outputs: "canvas"
        },
        // 4. Añadir textos dinámicos (Subtítulos basados en el guion)
        ...assets.overlays.map((ov, index) => ({
          filter: "drawtext",
          options: {
            text: ov.text,
            fontsize: 60,
            fontcolor: "white",
            shadowcolor: "black",
            shadowx: 3, shadowy: 3,
            x: "(w-text_w)/2",
            y: "h-300",
            enable: `between(t,${ov.time},${ov.time + 4})`
          },
          inputs: index === 0 ? "canvas" : `text${index - 1}`,
          outputs: `text${index}`
        }))
      ], assets.overlays.length > 0 ? `text${assets.overlays.length - 1}` : "canvas");

    // Añadir Audio (Voz + Música)
    command = command.input(assets.voiceAudio);
    
    if (musicPath) {
      command = command.input(musicPath);
      // Mezclar audio: Voz (volumen alto) + Música (volumen bajo)
      command = command.complexFilter([
        { filter: "volume", options: "1.5", inputs: "1:a", outputs: "v_voice" },
        { filter: "volume", options: "0.2", inputs: "2:a", outputs: "v_music" },
        { filter: "amix", options: "inputs=2:duration=first", inputs: ["v_voice", "v_music"] }
      ]);
    } else {
      command = command.audioChannels(2).audioCodec("aac");
    }

    command
      .outputOptions([
        "-c:v libx264",
        "-pix_fmt yuv420p",
        "-r 30",
        "-t 15" // Máximo 15 segundos para estos reels rápidos
      ])
      .on("start", (cmd) => console.log("Empezando renderizado FFmpeg:", cmd))
      .on("end", () => resolve(outputPath))
      .on("error", (err) => reject(err))
      .save(outputPath);
  });
}
