import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
    try {
        console.log('Testing Gemini API...');
        console.log('API Key exists:', !!process.env.GEMINI_API_KEY);

        // Try the simplest model name
        const models = ['gemini-pro', 'gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-1.5-flash-latest', 'models/gemini-pro', 'models/gemini-1.5-flash'];

        for (const modelName of models) {
            try {
                console.log(`\nTrying model: ${modelName}`);
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent('Say hello');
                console.log(`✅ ${modelName} WORKS!`);
                console.log('Response:', result.response.text());
                break;
            } catch (error) {
                console.log(`❌ ${modelName} failed:`, error.message);
            }
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

listModels();
