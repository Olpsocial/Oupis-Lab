import { createClient } from '@/utils/supabase/client';

// CẤU HÌNH KẾT NỐI (QUAN TRỌNG)
// Ưu tiên đọc từ biến môi trường (Vercel), nếu không có thì dùng link cứng (Local)
export const NGROK_URL = process.env.NGROK_URL || "https://leeann-nonoperatic-sherley.ngrok-free.dev";

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
Bạn là Trợ lý ảo của tiệm 'Nhà Kim Hương' (246 Tân Hương, Tân Quý, Tân Phú, TP.HCM).

NHIỆM VỤ:
- Tư vấn sản phẩm và báo giá chính xác theo danh sách bên dưới.
- Nếu khách hỏi món không có, gợi ý mẫu tương tự hoặc mời ghé tiệm.

ĐỊNH DẠNG TRẢ LỜI (BẮT BUỘC):
1. **Tiêu đề**: Dùng ### để viết tiêu đề ngắn gọn (Ví dụ: ### GỢI Ý CHO BẠN).
2. **Sản phẩm**: Dùng gạch đầu dòng (-). In đậm tên và giá (**Tên** - **Giá**).
3. **Phân cách**: Dùng --- để ngăn cách các phần nếu nội dung dài.
4. **Kết thúc**: Lời mời thân thiện, ngắn gọn (Ví dụ: "Ghé tiệm xem mẫu thực tế nhé!").

DANH SÁCH SẢN PHẨM & GIÁ:
${productListText}
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
