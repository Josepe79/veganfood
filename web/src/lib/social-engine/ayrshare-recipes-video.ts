import SocialPost from "social-media-api";
import { cleanEnvVar } from "./env-cleanup";

export async function publishRecipeVideoToSocial(videoUrl: string, caption: string) {
  const API_KEY = cleanEnvVar(process.env.AYRSHARE_API_KEY);
  if (!API_KEY) throw new Error("Ayrshare API Key no configurada.");
  
  const social = new SocialPost(API_KEY);

  const postData = {
    post: caption,
    platforms: ["tiktok", "youtube", "instagram"], // Para videos
    mediaUrls: [videoUrl],
    instagramOptions: {
      reels: true,
      shareReelsFeed: true
    },
    youTubeOptions: {
      title: caption.substring(0, 90) + "...", // YouTube requiere un título corto
      shorts: true
    },
    isPortraitVideo: true
  };

  try {
    const response = await social.post(postData);
    return response;
  } catch (error) {
    console.error("Error posting Recipe Video to Ayrshare:", error);
    throw error;
  }
}
