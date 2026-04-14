import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface SocialScript {
  hook: string;
  mid: string;
  cta: string;
  overlays: { text: string; time: number }[]; // Tiempos sugeridos para FFmpeg
}

export async function generateSocialScript(productName: string, brand: string, description: string): Promise<SocialScript> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    Actúa como un experto en Marketing Viral para TikTok e Instagram especializado en productos veganos.
    Tu objetivo es escribir un guion de 15 segundos para promocionar este producto:
    Producto: ${productName}
    Marca: ${brand}
    Descripción: ${description}

    Formato de respuesta: JSON estricto con esta estructura:
    {
      "hook": "Frase de inicio potente (máx 50 carácteres)",
      "mid": "Beneficio clave (máx 80 carácteres)",
      "cta": "Llamada a la acción (máx 40 carácteres)",
      "overlays": [
        {"text": "Texto para el hook", "time": 0},
        {"text": "Texto para el beneficio", "time": 5},
        {"text": "Texto para el cierre", "time": 10}
      ]
    }
    Instrucciones:
    - Lenguaje inspirador, B2C, nada de tono mayorista.
    - Usa emojis.
    - Respuesta SOLO el JSON.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json|```/g, "").trim();
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating social script:", error);
    return {
      hook: `¿Has probado ${productName}? 🌱`,
      mid: `La mejor calidad de ${brand} directamente a tu casa.`,
      cta: `¡Consíguelo en VeganFood.es! 🛒`,
      overlays: [
        { text: productName, time: 0 },
        { text: "100% Vegano", time: 5 },
        { text: "VeganFood.es", time: 10 }
      ]
    };
  }
}
