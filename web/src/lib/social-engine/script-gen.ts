import { GoogleGenerativeAI } from "@google/generative-ai";
import { cleanEnvVar } from "./env-cleanup";

export interface SocialScript {
  hook: string;
  mid: string;
  cta: string;
  overlays: { text: string; time: number }[];
  captions: {
    igTikTok: string;
    ytShorts: { title: string; desc: string };
    whatsapp: string;
  };
}

export async function generateSocialScript(productName: string, brand: string, description: string): Promise<SocialScript> {
  const genAI = new GoogleGenerativeAI(cleanEnvVar(process.env.GEMINI_API_KEY));
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

  const prompt = `
    Eres un Social Media Manager experto en el sector foodie y plant-based. Tu misión es generar los textos (captions) para los vídeos promocionales de veganfood.es.

    DATOS DEL PRODUCTO:
    - Nombre: ${productName}
    - Marca: ${brand}
    - Descripción: ${description}
    - Enlace: https://veganfood.es/product/

    CONTEXTO DE MARCA:
    - Identidad: Tono fresco y ético.
    - REQUISITO OBLIGATORIO: Mencionar siempre "VeganFood.es" al menos una vez en el guion de voz.
    - REQUISITO OBLIGATORIO: Los textos de "overlays" deben ser muy cortos (máx 25 caracteres) para que quepan bien en pantalla.

    FORMATO DE RESPUESTA (JSON POST-PROCESABLE):
    {
      "hook": "Gancho inicial (Voz)",
      "mid": "Beneficio principal (Voz)",
      "cta": "Cierre con marca VeganFood.es (Voz)",
      "overlays": [
        {"text": "GANCHO CORTO", "time": 0},
        {"text": "BENEFICIO CORTO", "time": 4},
        {"text": "VeganFood.es", "time": 8}
      ],
      "captions": {
        "igTikTok": "Texto para redes...",
        "ytShorts": { "title": "...", "desc": "..." },
        "whatsapp": "..."
      }
    }

    Respuesta SOLO el JSON.
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
      ],
      captions: {
        igTikTok: `¿Buscabas el ${productName} definitivo? 🌱 Descubre la mejor calidad de ${brand}. Corre que vuela. 🏃💨 Consíguelo en el link de la bio.`,
        ytShorts: {
          title: `${productName} - Lo mejor en alimentación vegana`,
          desc: `Explora las propiedades de ${productName} de ${brand}. Selección exclusiva de VeganFood.es para una dieta saludable.`
        },
        whatsapp: `¡Hola! 👋 Mira lo que acaba de aterrizar en VeganFood.es: ${productName} de ${brand}. Haz tu pedido hoy antes de las 14h y lo recibes mañana. 🚛 Pídelo aquí: https://veganfood.es/`
      }
    };
  }
}
