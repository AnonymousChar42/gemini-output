import { GoogleGenAI, Type } from "@google/genai";
import { WishResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateHolidayWish = async (userWish: string): Promise<WishResponse> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `The user's wish is: "${userWish}". You are a magical Christmas spirit.`,
      config: {
        systemInstruction: `You are a warm, magical Christmas spirit inside a digital snow globe. 
        Your task is to receive a user's wish and respond with a very short, poetic, or encouraging fortune (max 20 words).
        Also, choose a hex color code that represents the "mood" of the response (e.g., warm gold, icy blue, energetic red).
        
        Return JSON.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            message: { type: Type.STRING, description: "The magical response message." },
            mood: { type: Type.STRING, enum: ['magical', 'funny', 'heartwarming'], description: "The mood of the response." },
            color: { type: Type.STRING, description: "Hex color code suitable for the response (e.g. #FFD700)." }
          },
          required: ["message", "mood", "color"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as WishResponse;
    }
    
    throw new Error("No response text");
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      message: "The stars sparkle with your silent wish.",
      mood: "magical",
      color: "#FFD700"
    };
  }
};