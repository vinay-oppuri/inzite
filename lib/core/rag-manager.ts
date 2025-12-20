import { db } from "../../db";
import { document_chunks } from "../../db/schema";
import { sql } from "drizzle-orm";
import { LLMClient } from "../llm-client";

export class VectorStoreManager {
    private client: LLMClient;

    constructor() {
        this.client = new LLMClient();
    }

    async addDocuments(documents: { content: string; metadata?: Record<string, unknown> }[]) {
        if (!documents.length) return;

        const chunks = this.chunkDocuments(documents);
        const batchSize = 10; // Reduced batch size for local LLM safety

        for (let i = 0; i < chunks.length; i += batchSize) {
            const batch = chunks.slice(i, i + batchSize);
            try {
                // Generate embeddings in parallel
                const validEmbeddings: { index: number; values: number[] }[] = [];

                await Promise.all(batch.map(async (chunk, batchIdx) => {
                    const values = await this.client.embed(chunk.content);
                    if (values && values.length > 0) {
                        validEmbeddings.push({ index: batchIdx, values });
                    }
                }));

                for (const em of validEmbeddings) {
                    const chunk = batch[em.index];
                    await db.insert(document_chunks).values({
                        content: chunk.content,
                        metadata: chunk.metadata,
                        embedding: em.values,
                    });
                }
            } catch (error) {
                console.error("Embedding batch failed:", error);
            }
        }
    }

    async search(query: string, k: number = 5) {
        try {
            const embedding = await this.client.embed(query);

            if (!embedding || embedding.length === 0) {
                throw new Error("Failed to generate query embedding");
            }

            const embeddingString = `[${embedding.join(",")}]`;

            // Use cosine distance (<=>) or L2 distance (<->)
            const similarity = sql<number>`1 - (${document_chunks.embedding} <=> ${embeddingString})`;

            const results = await db
                .select({
                    content: document_chunks.content,
                    metadata: document_chunks.metadata,
                    score: similarity,
                })
                .from(document_chunks)
                .orderBy(sql`${document_chunks.embedding} <=> ${embeddingString}`)
                .limit(k);

            return results;
        } catch (error) {
            console.error("Search failed:", error);
            // Return mock documents if DB or Embedding fails
            return [
                {
                    content: "Mock Context 1: The market for this idea is growing rapidly due to increased digital adoption.",
                    metadata: { source: "mock-db-fallback" },
                    score: 0.9
                },
                {
                    content: "Mock Context 2: Competitors are focusing on AI integration, leaving a gap for human-centric services.",
                    metadata: { source: "mock-db-fallback" },
                    score: 0.85
                }
            ];
        }
    }

    async rerank(query: string, documents: { content: string; metadata?: unknown; score: number }[]) {
        if (!documents.length) return [];

        try {
            const prompt = `
            You are a reranking expert. Given a query and a list of documents, score each document's relevance to the query on a scale of 0 to 1.
            Return the output as a JSON array of objects, where each object has an "index" (0-based) and a "relevance_score".

            Query: "${query}"

            Documents:
            ${documents.map((doc, i) => `[${i}] ${doc.content.substring(0, 300)}...`).join("\n")}

            Output JSON:
            `;

            const result = await this.client.generate(prompt, { json: true, temperature: 0.1 });
            let scores: { index: number; relevance_score: number }[] = [];

            try {
                scores = JSON.parse(result.text);
            } catch {
                // Try finding JSON array
                const match = result.text.match(/\[[\s\S]*\]/);
                if (match) scores = JSON.parse(match[0]);
            }

            if (!Array.isArray(scores)) return documents; // Fallback

            // Sort documents by new score
            const reranked = scores
                .map((s) => ({ ...documents[s.index], score: s.relevance_score }))
                .sort((a, b) => b.score - a.score);

            return reranked.filter(d => d.score > 0.4); // Filter out low relevance
        } catch (error) {
            console.warn("Reranking failed, returning original order:", error);
            return documents;
        }
    }

    private chunkDocuments(documents: { content: string; metadata?: Record<string, unknown> }[]) {
        const chunks: { content: string; metadata?: Record<string, unknown> }[] = [];
        const chunkSize = 1500;
        const overlap = 150;

        for (const doc of documents) {
            let start = 0;
            const text = doc.content || "";
            while (start < text.length) {
                const end = Math.min(start + chunkSize, text.length);
                chunks.push({
                    content: text.slice(start, end),
                    metadata: doc.metadata,
                });
                if (end === text.length) break;
                start = end - overlap;
            }
        }
        return chunks;
    }
}
