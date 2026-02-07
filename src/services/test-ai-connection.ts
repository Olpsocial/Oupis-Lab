import { askKimHuongAI, NGROK_URL } from './aiService';

async function testConnection() {
    console.log("🚀 Bắt đầu kiểm tra kết nối AI...");

    // Test connectivity step 1: Ping Root
    console.log(`📡 Ping tới: ${NGROK_URL}`);
    try {
        const ping = await fetch(NGROK_URL, {
            headers: { "ngrok-skip-browser-warning": "true" }
        });
        const pingText = await ping.text();
        console.log(`✅ Ping Status: ${ping.status} ${ping.statusText}`);
        console.log(`📄 Root Response: ${pingText.substring(0, 100)}...`);
    } catch (e) {
        console.error("❌ Ping thất bại:", e);
        return;
    }

    console.log("\n🧪 Thử nghiệm hỏi AI: 'Tiệm có bán bánh tráng không?'");

    try {
        const answer = await askKimHuongAI("Tiệm có bán bánh tráng không?");
        console.log("\n✅ KẾT QUẢ TỪ AI:");
        console.log("--------------------------------------------------");
        console.log(answer);
        console.log("--------------------------------------------------");
        console.log("🎉 Kiểm tra hoàn tất!");
    } catch (error) {
        console.error("\n❌ Kiểm tra thất bại:", error);
    }
}

testConnection();
