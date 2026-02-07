
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';

async function testGeminiSDK() {
    try {
        console.log("🚀 Testing Gemini connection with SDK...");

        // Load API Key
        const envPath = path.resolve(process.cwd(), '.env.local');
        if (!fs.existsSync(envPath)) {
            console.error("❌ .env.local file not found!");
            return;
        }

        const envContent = fs.readFileSync(envPath, 'utf-8');
        const match = envContent.match(/GEMINI_API_KEY=(.*)/);

        if (!match || !match[1]) {
            console.error("❌ GEMINI_API_KEY not found in .env.local");
            return;
        }

        let apiKey = match[1].trim();
        if (apiKey.startsWith('"') && apiKey.endsWith('"')) apiKey = apiKey.slice(1, -1);

        console.log(`🔑 Key loaded: ${apiKey.substring(0, 5)}...`);

        // Initialize SDK
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        console.log("📡 Sending message to Gemini...");
        const result = await model.generateContent("Hello! Are you working?");
        const response = await result.response;
        const text = response.text();

        console.log("✅ SDK Connection Successful!");
        console.log("💬 Response:", text);

    } catch (error) {
        console.error("❌ SDK Test Failed:");
        console.error(error);
    }
}

testGeminiSDK();
