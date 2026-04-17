import SocialPost from "social-media-api";

export async function publishToSocial(videoUrl: string, caption: string) {
  const API_KEY = process.env.AYRSHARE_API_KEY || "";
  if (!API_KEY) throw new Error("Ayrshare API Key no configurada.");
  
  const social = new SocialPost(API_KEY);

  const postData = {
    post: caption,
    platforms: ["tiktok", "instagram"],
    mediaUrls: [videoUrl],
    instagramOptions: {
      reels: true,
      shareReelsFeed: true
    },
    isPortraitVideo: true
  };

  try {
    const response = await social.post(postData);
    return response;
  } catch (error) {
    console.error("Error posting to Ayrshare:", error);
    throw error;
  }
}
