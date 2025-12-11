import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini Client
// Note: We use the API key from the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateNamesWithAI = async (topic: string = "nomes brasileiros comuns"): Promise<string[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Gere uma lista de 10 ${topic}. Apenas retorne os nomes.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      }
    });

    if (response.text) {
      const names = JSON.parse(response.text);
      if (Array.isArray(names)) {
        return names;
      }
    }
    return [];
  } catch (error) {
    console.error("Erro ao gerar nomes com IA:", error);
    throw error;
  }
};