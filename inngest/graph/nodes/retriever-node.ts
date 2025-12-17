import { AgentState } from "../state";
import { VectorStoreManager } from "../../../lib/core/rag-manager";

const ragManager = new VectorStoreManager();

export async function retrieverNode(state: AgentState): Promise<Partial<AgentState>> {
    console.log("🔍 [RetrieverNode] Retrieving documents...");
    const query = state.user_input;

    // Retrieve top 20 documents to allow for reranking
    const retrievedDocs = await ragManager.search(query, 20);

    return { retrieved_docs: retrievedDocs };
}
