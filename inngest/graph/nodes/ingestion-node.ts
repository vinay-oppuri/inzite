import { AgentState } from "../state";
import { VectorStoreManager } from "../../../lib/core/rag-manager";

const ragManager = new VectorStoreManager();

export async function ingestionNode(state: AgentState): Promise<Partial<AgentState>> {
    console.log("💾 [IngestionNode] Storing raw documents...");
    const agentOutputs = state.agent_outputs || [];
    const documents = [];

    for (const res of agentOutputs) {
        const result = res as any;
        if (result?.analysis) {
            documents.push({ content: JSON.stringify(result.analysis), metadata: { source: "competitor-scout" } });
        }
        if (result?.summary) {
            documents.push({ content: JSON.stringify(result.summary), metadata: { source: "trend-or-paper" } });
        }
        if (result?.searchResults) {
            result.searchResults.forEach((r: any) => documents.push({ content: r.content, metadata: { source: r.url } }));
        }
    }

    await ragManager.addDocuments(documents);
    return { raw_docs_count: documents.length };
}
