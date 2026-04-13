import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

async function listModels() {
  try {
    const result = await genAI.listModels();
    for (const model of result.models) {
      console.log(model.name);
    }
  } catch (e) {
    console.error("API error:", e);
  }
}

listModels().then(() => process.exit(0));
