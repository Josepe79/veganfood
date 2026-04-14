import { TextToSpeechClient } from "@google-cloud/text-to-speech";
import fs from "fs";
import util from "util";
import path from "path";

// La autenticación se manejará vía Variable de Entorno o archivo google-creds.json
const client = new TextToSpeechClient();

export async function generateSocialVoice(text: string, outputFilename: string): Promise<string> {
  const request = {
    input: { text },
    voice: { languageCode: "es-ES", name: "es-ES-Neural2-F", ssmlGender: "FEMALE" as const },
    audioConfig: { audioEncoding: "MP3" as const },
  };

  try {
    const [response] = await client.synthesizeSpeech(request);
    const writeFile = util.promisify(fs.writeFile);
    
    // Guardamos en una carpeta temporal dentro de la web
    const tempDir = path.join(process.cwd(), "tmp");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
    
    const filePath = path.join(tempDir, outputFilename);
    await writeFile(filePath, response.audioContent as Uint8Array, "binary");
    
    return filePath;
  } catch (error) {
    console.error("Error generating voice:", error);
    throw error;
  }
}
