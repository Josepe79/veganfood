import SocialPost from "social-media-api";
import { cleanEnvVar } from "./env-cleanup";

export async function publishRecipeToSocial(imageUrl: string, caption: string) {
  const API_KEY = cleanEnvVar(process.env.AYRSHARE_API_KEY);
  if (!API_KEY) throw new Error("Ayrshare API Key no configurada.");
  
  const social = new SocialPost(API_KEY);

  const postData = {
    post: caption,
    platforms: ["facebook", "instagram"], // Para fotos, FB e IG.
    mediaUrls: [imageUrl]
  };

  try {
    const response = await social.post(postData);
    return response;
  } catch (error) {
    console.error("Error posting Recipe to Ayrshare:", error);
    throw error;
  }
}
