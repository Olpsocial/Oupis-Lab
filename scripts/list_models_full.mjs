
import fs from 'fs';
import path from 'path';

async function listAllModels() {
    try {
        const envPath = path.resolve(process.cwd(), '.env.local');
        const envContent = fs.readFileSync(envPath, 'utf-8');
        const match = envContent.match(/GEMINI_API_KEY=(.*)/);
        let apiKey = match[1].trim();
        if (apiKey.startsWith('"')) apiKey = apiKey.slice(1, -1);

        const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const listRes = await fetch(listUrl);
        if (listRes.ok) {
            const listData = await listRes.json();
            const models = listData.models.map(m => m.name.replace('models/', ''));
            console.log("✅ ALL Available Models:\n", models.join('\n'));
        } else {
            console.error("❌ Failed to list models:", listRes.status);
        }
    } catch (e) { console.error(e); }
}

listAllModels();
