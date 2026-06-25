import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPT = `あなたは「夏休みのダラダラ防止ツール」のAIアシスタントです。
ユーザーの要望（予算、移動、気分など）に合わせて、重い腰を上げたくなるようなプランを提案します。`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const formattedMessages = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: formattedMessages,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            planName: { type: Type.STRING, description: "キャッチーなプラン名" },
            estimatedTimeHours: { type: Type.NUMBER, description: "想定時間（時間単位の数値）" },
            tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "関連タグ（例: #リラックス）" },
            action: { type: Type.STRING, description: "具体的に何をするか（100文字程度、すぐ行動に移せる内容）" },
            message: { type: Type.STRING, description: "AIからの激励メッセージ（ユーモアのある一言）" }
          },
          required: ["planName", "estimatedTimeHours", "tags", "action", "message"]
        }
      }
    });

    const jsonStr = (response.text || "{}").trim();
    const data = JSON.parse(jsonStr);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
