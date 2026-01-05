
import { GoogleGenAI } from "@google/genai";
import { GameResult } from "../types";

export const getCognitiveInsight = async (result: GameResult): Promise<string> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    console.warn("API_KEY is not defined in process.env");
    return "优秀的表现！这种高强度的切换练习能有效重塑大脑的注意回路。";
  }

  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze these Stroop Test results and provide a short, professional "Neuro-Insight" in Chinese. 
      Game Mode: ${result.mode} (Note: MASTER mode tests task-switching flexibility).
      Results: Accuracy ${result.accuracy}%, Avg Response Time ${result.avgResponseTime}ms, 
      Congruent trials RT ${result.congruentRt}ms, Incongruent trials RT ${result.incongruentRt}ms. 
      The gap between congruent and incongruent is the 'Stroop Interference'.
      Explain how well their brain is filtering distractions or switching tasks. 
      Keep it under 3 sentences and very encouraging.`,
      config: {
        temperature: 0.7,
      },
    });

    return response.text || "你的神经调节能力正在显著增强，继续保持挑战！";
  } catch (error) {
    console.error("Gemini insight error:", error);
    return "优秀的表现！持续挑战自己以获得更好的专注力。";
  }
};
