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


// --- TỐI ƯU HIỆU SUẤT (CACHE & KEYWORD) ---
const CACHE = new Map<string, string>();
const QUICK_ANSWERS: Record<string, string> = {
    "địa chỉ": "### ĐỊA CHỈ TIỆM NHÀ KIM HƯƠNG:\n- **246 Tân Hương, Tân Quý, Tân Phú, TP.HCM**\n- Mời bạn ghé xem trực tiếp nhé! (Mở cửa: 7h00 - 23h00) [SHOW_MAP]",
    "ở đâu": "### ĐỊA CHỈ TIỆM NHÀ KIM HƯƠNG:\n- **246 Tân Hương, Tân Quý, Tân Phú, TP.HCM**\n- Mời bạn ghé xem trực tiếp nhé! (Mở cửa: 7h00 - 23h00) [SHOW_MAP]",
    "số điện thoại": "### HOTLINE LIÊN HỆ:\n- **0938.123.456** (Có Zalo)\n- Bạn có thể gọi hoặc nhắn tin Zalo để được tư vấn nhanh nhất ạ!",
    "hotline": "### HOTLINE LIÊN HỆ:\n- **0938.123.456** (Có Zalo)\n- Bạn có thể gọi hoặc nhắn tin Zalo để được tư vấn nhanh nhất ạ!",
    "zalo": "### KẾT BẠN ZALO:\n- **0938.123.456** (Nhà Kim Hương)\n- Gửi ảnh mẫu qua Zalo để tiệm báo giá chi tiết nha!",
    "ngân hàng": "### THÔNG TIN CHUYỂN KHOẢN:\n- **Vietcombank** - 9999888877 - NGUYEN VAN A\n- (Nội dung: Tên + SĐT)\n- Vui lòng xác nhận với Tiệm trước khi chuyển khoản nhé!",
    "stk": "### THÔNG TIN CHUYỂN KHOẢN:\n- **Vietcombank** - 9999888877 - NGUYEN VAN A\n- (Nội dung: Tên + SĐT)\n- Vui lòng xác nhận với Tiệm trước khi chuyển khoản nhé!"
};

export async function askKimHuongAI(userQuestion: string, signal?: AbortSignal): Promise<string> {
    const questionLower = userQuestion.toLowerCase();

    // 1. KIỂM TRA TỪ KHÓA (Siêu tốc - Không tốn GPU)
    for (const key in QUICK_ANSWERS) {
        if (questionLower.includes(key)) {
            console.log(`⚡ Trả lời nhanh từ khóa: "${key}"`);
            return QUICK_ANSWERS[key]; // Trả về ngay lập tức
        }
    }

    // 2. KIỂM TRA CACHE (Nếu câu hỏi lặp lại)
    if (CACHE.has(questionLower)) {
        console.log("♻️ Trả lời từ bộ nhớ đệm (Cache)");
        return CACHE.get(questionLower)!;
    }

    try {
        console.log("⏳ Đang kết nối 'Tổng đài' lấy giá mới nhất...");

        // 3. LẤY DỮ LIỆU TỪ SUPABASE
        const supabase = createClient();
        const { data: products } = await supabase
            .from('products')
            .select('name, price, type')
            .eq('is_active', true);

        // 4. TẠO DANH SÁCH SẢN PHẨM CHO AI
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

        // 5. TẠO PROMPT ĐỘNG
        const DYNAMIC_SYSTEM_PROMPT = `
Bạn là Trợ lý ảo của tiệm 'Nhà Kim Hương'.
Xưng hô: Xưng là **"Tiệm"** hoặc **"Nhà Kim Hương"**, gọi khách là **"Bạn"** hoặc **"Anh/Chị"**.
Giọng điệu: Lịch sự, chuyên nghiệp, niềm nở.
NGÔN NGỮ: Chỉ sử dụng tiếng Việt hoàn chỉnh. TUYỆT ĐỐI không dùng chữ Hán, chữ tượng hình hoặc các ký hiệu lạ ngoài bảng chữ cái tiếng Việt và Markdown.

NHIỆM VỤ:
- Tư vấn sản phẩm và báo giá chính xác theo danh sách bên dưới.
- Nếu khách hỏi món không có, gợi ý mẫu tương tự hoặc mời ghé tiệm.
- **THÔNG TIN TIỆM**: 
  - Địa chỉ: **246 Tân Hương, Tân Quý, Tân Phú (7h00 - 23h00)**. 
  - Link Maps: https://maps.app.goo.gl/QqR3S7pRhxwMRHFA7
- **QUAN TRỌNG (ĐẶT LÀM RIÊNG/CUSTOM)**:
  1. Hỏi khách có **hình ảnh, video hoặc ý tưởng** không.
  2. Lưu ý khách: **"Vì sản phẩm làm thủ công (handmade) 100% nên sẽ có nét riêng, có thể không giống tuyệt đối như mẫu khách đưa"**
  3. Mong khách thông cảm: **"Mỗi sản phẩm đều được thợ chăm chút kỹ lưỡng, tuy nhiên đôi khi sẽ có sai số nhỏ."**
  4. Gợi ý đặt trước **ít nhất 3-5 ngày** để đảm bảo chất lượng tốt nhất.
  5. Mời khách nhắn Zalo để trao đổi chi tiết hơn.

ĐỊNH DẠNG TRẢ LỜI (BẮT BUỘC):
1. **Tiêu đề**: Dùng ### để viết tiêu đề ngắn gọn.
2. **Nội dung**:
    - Nếu tư vấn sản phẩm: Dùng gạch đầu dòng (-), in đậm **Tên** - **Giá**.
    - Nếu khách đặt riêng: Nhắc về độ thủ công, thời gian đặt trước & nhắn Zalo.
3. **Phân cách**: Dùng --- để ngăn cách các phần.
4. **Kết thúc**: Lời mời lịch sự (Ví dụ: "Mời bạn ghé tiệm xem mẫu nhé!").

DANH SÁCH SẢN PHẨM & GIÁ:
${productListText}
`;

        // console.log("⏳ Đang gửi tín hiệu về Dell 7750 qua Proxy...");
        const response = await fetch("/api/ai-proxy", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            signal,
            body: JSON.stringify({
                prompt: userQuestion,
                system: DYNAMIC_SYSTEM_PROMPT,
                options: {
                    temperature: 0.5,
                    top_k: 40,
                    num_predict: 800 // Tăng lên để không bị cắt giữa chừng
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
        // 1. Xóa nội dung trong thẻ <think>...</think>
        let cleanText = rawText.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

        // 2. Xóa thẻ <think> treo nếu chưa đóng (do bị cắt token)
        cleanText = cleanText.replace(/<think>[\s\S]*/g, "").trim();

        // 3. Xóa các ký tự rác ở đầu câu (đôi khi model bị "nấc")
        cleanText = cleanText.replace(/^(cấn|ờ|à|ừm)\s*/i, "");

        // 4. LỌC BỎ CHỮ HÁN & KÝ TỰ LẠ (Fix lỗi chữ tượng hình)
        // Regex này lọc bỏ các ký tự trong dải CJK (Trung-Nhật-Hàn) Unified Ideographs
        cleanText = cleanText.replace(/[\u4E00-\u9FFF]/g, "");

        // 5. Nếu vẫn còn sót thẻ style, markdown lỗi -> dọn dẹp nhẹ
        // (Hiện tại giữ nguyên markdown để hiển thị đẹp)

        // 6. LƯU VÀO CACHE (Để dùng lại lần sau)
        CACHE.set(questionLower, cleanText);

        return cleanText;

    } catch (error) {
        console.error("❌ Mất kết nối:", error);
        return "Dạ hiện tại 'bộ não' của tiệm đang ngủ đông (Architect tắt máy rồi). Khách thông cảm nhắn tin qua Zalo nha!";
    }
}
