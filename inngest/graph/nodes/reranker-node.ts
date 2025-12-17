import { AgentState } from "../state";
import { VectorStoreManager } from "../../../lib/core/rag-manager";

const ragManager = new VectorStoreManager();

export async function rerankerNode(state: AgentState): Promise<Partial<AgentState>> {
    console.log("⚖️ [RerankerNode] Reranking documents...");
    const query = state.user_input;
    const docs = state.retrieved_docs || [];

    if (docs.length === 0) {
        return { reranked_docs: [] };
    }

    // Rerank and filter
    const rerankedDocs = await ragManager.rerank(query, docs);

    return { reranked_docs: rerankedDocs };
}
