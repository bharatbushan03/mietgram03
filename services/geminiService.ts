
import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

/**
 * Generate a creative Instagram-style caption for MIET students.
 */
export async function generateSmartCaption(prompt: string): Promise<string> {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a trendy, youthful Instagram caption for an MIET Jammu student.
      Subject: ${prompt}. 
      Include 2-3 MIET specific hashtags.`,
    });
    return response.text?.trim() || "Campus vibes! 📚 #MIETJammu";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Campus life! ✨ #MIET";
  }
}

/**
 * Explore real campus events and news using Google Search.
 */
export async function searchCampusEvents(): Promise<{ text: string, sources: any[] }> {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Find recent news, events, or student activities at MIET Jammu (Model Institute of Engineering and Technology). Summarize them for a college social media feed.",
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    
    return {
      text: response.text || "Checking campus news...",
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  } catch (error) {
    return { text: "Keep up with MIET Jammu official announcements!", sources: [] };
  }
}

/**
 * Suggest MIET campus locations using Google Maps.
 */
export async function getCampusLocations(lat?: number, lng?: number): Promise<{ name: string; uri: string }[]> {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "List specific locations within MIET Jammu campus (e.g., Canteen, Library, Block A, Central Garden).",
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: lat && lng ? { latitude: lat, longitude: lng } : { latitude: 32.6565, longitude: 74.8080 } // MIET Jammu approx
          }
        }
      },
    });

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    return chunks.map((c: any) => ({
      name: c.maps?.title || "MIET Campus",
      uri: c.maps?.uri || "#"
    })).slice(0, 5);
  } catch (error) {
    return [
      { name: "MIET Library", uri: "#" },
      { name: "MIET Canteen", uri: "#" },
      { name: "MIET Block A", uri: "#" }
    ];
  }
}
