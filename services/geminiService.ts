
import { GoogleGenAI } from "@google/genai";
import { GameResult } from "../types";

export const getCognitiveInsight = async (result: GameResult): Promise<string> => {
  // 优先尝试从 process.env 获取，这是由 vite.config.ts 注入的
  const apiKey = (process.env as any).API_KEY;
  
  if (!apiKey) {
    console.warn("API_KEY 环境变量未设置，跳过 AI 分析环节");
    return "优秀的表现！这种高强度的任务切换练习能有效重塑大脑的执行控制回路。";
  }

  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `分析斯特鲁普(Stroop)测试结果并提供中文反馈。
      模式: ${result.mode}
      数据: 正确率 ${result.accuracy}%, 平均耗时 ${result.avgResponseTime}ms, 
      一致性RT ${result.congruentRt}ms, 非一致性RT ${result.incongruentRt}ms。
      请以专业神经科学的角度简短点评其专注力和干扰过滤表现，控制在50字以内。`,
    });

    return response.text || "你的神经调节能力正在增强，持续挑战以获得更佳的专注度！";
  } catch (error) {
    console.error("Gemini API 错误:", error);
    return "你的大脑反应速度非常稳定，继续保持这种高质量的训练！";
  }
};
