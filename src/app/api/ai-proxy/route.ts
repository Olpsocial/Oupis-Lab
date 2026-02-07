import { NextResponse } from 'next/server';
import { NGROK_URL } from '@/services/aiService';

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Gọi đến Ngrok từ phía Server (Bỏ qua lỗi CORS của trình duyệt)
        const response = await fetch(`${NGROK_URL}/api/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true' // Vượt rào Ngrok warning
            },
            body: JSON.stringify({
                model: "deepseek-r1:8b",
                prompt: body.prompt,
                stream: false,
                system: body.system,
                options: body.options
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("AI Proxy Error:", response.status, errorText);
            return NextResponse.json({ error: "Lỗi kết nối từ Server đến AI" }, { status: 500 });
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error: any) {
        console.error("AI Proxy Exception:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
