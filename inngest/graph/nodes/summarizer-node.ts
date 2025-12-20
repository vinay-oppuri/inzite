import { AgentState } from "../state";
import { LLMClient } from "../../../lib/llm-client";


export async function summarizerNode(state: AgentState): Promise<Partial<AgentState>> {
    const client = new LLMClient();
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
        You are an expert technical researcher. Summarize the following research documents into a comprehensive, deeply detailed summary.
        
        CRITICAL INSTRUCTIONS:
        - Do NOT over-simplify. Preserve technical specifications, pricing models, and specific feature details.
        - Capture ALL key facts, trends, and quantitative data (numbers, percentages).
        - Structure the summary with clear headings and bullet points.
        - The goal is to provide a "deep dive" analysis, not a high-level overview.

        Documents:
        ${contextText.substring(0, 100000)} 
        `;

        const result = await client.generate(prompt);
        return { summary: result.text };
    } catch (error) {
        console.warn("Summarization failed, using raw context:", error);
        return { summary: contextText.substring(0, 10000) };
    }
}
