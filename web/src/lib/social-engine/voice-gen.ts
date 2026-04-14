import OpenAI from "openai";
import fs from "fs";
import path from "path";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateSocialVoice(text: string, outputFilename: string): Promise<string> {
  try {
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "nova", // Nova es una voz femenina muy natural para redes
      input: text,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    
    // Guardamos en una carpeta temporal dentro de la web
    const tempDir = path.join(process.cwd(), "tmp");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
    
    const filePath = path.join(tempDir, outputFilename);
    await fs.promises.writeFile(filePath, buffer);
    
    return filePath;
  } catch (error) {
    console.error("Error generating voice with OpenAI:", error);
    throw error;
  }
}
