import { NextResponse } from 'next/server';
import { NGROK_URL } from '@/services/aiService';

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Gọi đến Ngrok từ phía Server (Bỏ qua lỗi CORS của trình duyệt)
        const response = await fetch(`${NGROK_URL}/api/generate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true", // Bỏ qua trang cảnh báo của Ngrok
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" // Giả danh trình duyệt thật
            },
            body: JSON.stringify({
                model: "deepseek-r1:8b", // Model mặc định
                prompt: body.prompt,
                system: body.system,
                stream: false,
                options: body.options
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("AI Proxy Error:", response.status, errorText);
            // Trả về lỗi chi tiết để debug ở Client
            return NextResponse.json({
                error: `Upstream Error ${response.status}: ${errorText.substring(0, 200)}...`,
                fullError: errorText
            }, { status: 500 });
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error: any) {
        console.error("AI Proxy Exception:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
