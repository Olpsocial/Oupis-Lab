import { createClient } from '@/utils/supabase/client';

// CẤU HÌNH KẾT NỐI (QUAN TRỌNG)
// Thay cái link https://... bằng link Ngrok ông vừa có.
// Ví dụ: "https://a1b2-14-161-22-111.ngrok-free.app"
export const NGROK_URL = "https://leeann-nonoperatic-sherley.ngrok-free.dev";

interface OllamaResponse {
    model: string;
    created_at: string;
    response: string;
    done: boolean;
    context?: number[];
    total_duration?: number;
    load_duration?: number;
    prompt_eval_count?: number;
    prompt_eval_duration?: number;
    eval_count?: number;
    eval_duration?: number;
}


export async function askKimHuongAI(userQuestion: string): Promise<string> {
    try {
        console.log("⏳ Đang kết nối Supabase lấy giá mới nhất...");

        // 1. LẤY DỮ LIỆU TỪ SUPABASE
        const supabase = createClient();
        const { data: products } = await supabase
            .from('products')
            .select('name, price, type')
            .eq('is_active', true);

        // 2. TẠO DANH SÁCH SẢN PHẨM CHO AI
        let productListText = "DANH SÁCH SẢN PHẨM & GIÁ (CẬP NHẬT REAL-TIME):\n";

        if (products && products.length > 0) {
            products.forEach((p: any) => {
                const priceK = (p.price / 1000).toLocaleString('vi-VN') + "k";
                // Rút gọn loại sản phẩm
                let typeNote = "";
                if (p.type === 'diy-kit') typeNote = " [Combo Tự Làm]";
                else if (p.type === 'material') typeNote = " [Nguyên Liệu]";

                productListText += `- ${p.name}${typeNote}: ${priceK}\n`;
            });
        } else {
            productListText += "(Hệ thống đang cập nhật kho...)";
        }

        // 3. TẠO PROMPT ĐỘNG
        const DYNAMIC_SYSTEM_PROMPT = `
Bạn là nhân viên tư vấn của tiệm 'Nhà Kim Hương' - Chuyên bán Đồ trang trí Tết và Nguyên liệu Handmade (DIY).
Địa chỉ: 246 Tân Hương, Tân Quý, Tân Phú, TP.HCM.
Phong cách: Thân thiện, dễ thương, đậm chất gen Z nhưng vẫn lễ phép.

${productListText}

QUY TẮC QUAN TRỌNG:
1. TUYỆT ĐỐI CHỈ tư vấn các sản phẩm có trong danh sách trên.
2. Lấy đúng giá trong danh sách (Ví dụ: 15k, 189k). KHÔNG được tự bịa giá.
3. Nếu khách hỏi món không có, hãy trả lời khéo: "Dạ món đó bên em tạm hết, khách tham khảo mẫu khác nha!"
4. Mời khách ghé 246 Tân Hương, TP.HCM để xem mẫu.
`;

        // console.log("⏳ Đang gửi tín hiệu về Dell 7750 qua Proxy...");
        const response = await fetch("/api/ai-proxy", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                prompt: userQuestion,
                system: DYNAMIC_SYSTEM_PROMPT,
                options: {
                    temperature: 0.5, // Giảm độ sáng tạo để AI báo giá chuẩn hơn
                    top_k: 40
                }
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Server Error:", response.status, response.statusText);
            console.error("Response Body:", errorText);
            throw new Error("Lỗi kết nối Server nhà làm!");
        }

        const data = await response.json() as OllamaResponse;
        const rawText = data.response;

        // --- THUẬT TOÁN CẮT BỎ SUY NGHĨ (LOBOTOMY) ---
        // DeepSeek-R1 hay lảm nhảm trong thẻ <think>. Cần cắt bỏ để khách không thấy.
        const cleanText = rawText.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

        return cleanText;

    } catch (error) {
        console.error("❌ Mất kết nối:", error);
        return "Dạ hiện tại 'bộ não' của tiệm đang ngủ đông (Architect tắt máy rồi). Khách thông cảm nhắn tin qua Zalo nha!";
    }
}
