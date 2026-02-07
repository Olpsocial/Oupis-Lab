
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { message } = await req.json();
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                { error: "Missing API Key" },
                { status: 500 }
            );
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        // Use gemini-2.0-flash as 1.5 is unavailable.
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const systemPrompt = `
      You are a helpful assistant for "Nhà Kim Hương", a decor and handmade gift shop.
      Shop Address: 246 Tân Hương, Tân Quý, Tân Phú.
      
      Rules:
      1. If the user asks for the shop's address, provide the address: "246 Tân Hương, Tân Quý, Tân Phú". AND append the text "[SHOW_MAP]" to the end of your response.
      2. If the user mentions or asks about "Mẹt tre" (bamboo trays), suggest that they are perfect for decorating on the living room wall ("trang trí tường phòng khách") to bring a cozy, traditional vibe.
      3. Keep responses warm, friendly, and concise (Vietnamese language).
      4. For other queries, answer helpfully based on general knowledge of handmade/decor items or say you will connect them to a human staff.
    `;

        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: systemPrompt }],
                },
                {
                    role: "model",
                    parts: [{ text: "Chào bạn! Mình là trợ lý ảo của Nhà Kim Hương. Mình đã hiểu các quy tắc và sẵn sàng hỗ trợ bạn." }],
                },
            ],
            generationConfig: {
                maxOutputTokens: 500,
            },
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ reply: text });
    } catch (error: any) {
        console.error("Gemini API Error:", error);
        return NextResponse.json(
            { error: error.message || "Unknown error occurred" },
            { status: 500 }
        );
    }
}
