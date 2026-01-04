import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI = null;
let model = null;

export const initializeGemini = (apiKey) => {
    try {
        genAI = new GoogleGenerativeAI(apiKey);
        model = genAI.getGenerativeModel({ model: "gemini-pro" });
        return true;
    } catch (error) {
        console.error("Error initializing Gemini:", error);
        return false;
    }
};

export const streamGeminiResponse = async (prompt, onChunk) => {
    if (!model) throw new Error("Gemini not initialized");

    try {
        const result = await model.generateContentStream(prompt);

        let fullText = "";
        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            fullText += chunkText;
            onChunk(chunkText);
        }
        return fullText;
    } catch (error) {
        console.error("Error streaming response:", error);
        throw error;
    }
};
