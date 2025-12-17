import { AgentState } from "../state";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_KEY_REPORT || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function summarizerNode(state: AgentState): Promise<Partial<AgentState>> {
    console.log("📝 [SummarizerNode] Summarizing documents...");
    const docs = state.reranked_docs || [];

    if (docs.length === 0) {
        return { summary: "No relevant documents found." };
    }

    const contextText = docs.map((d: any) => d.content).join("\n\n");

    // If context is small enough, just return it
    if (contextText.length < 10000) {
        return { summary: contextText };
    }

    // Otherwise, summarize
    try {
        const prompt = `
        Summarize the following research documents into a comprehensive and detailed summary that captures all key facts, trends, and insights.
        The summary should be structured and easy to read.
        
        Documents:
        ${contextText.substring(0, 30000)} // Limit to avoid token limits
        `;

        const result = await model.generateContent(prompt);
        return { summary: result.response.text() };
    } catch (error) {
        console.warn("Summarization failed, using raw context:", error);
        return { summary: contextText.substring(0, 10000) };
    }
}
