import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY ausente no .env");
}

export const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export function getGeminiModel(model = "gemini-1.5-flash") {
  return gemini.getGenerativeModel({ model });
}
