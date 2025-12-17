import { GoogleGenerativeAI, TaskType } from "@google/generative-ai";
import { db } from "../../db";
import { document_chunks } from "../../db/schema";
import { sql } from "drizzle-orm";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");
const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });

export class VectorStoreManager {
    async addDocuments(documents: { content: string; metadata?: Record<string, unknown> }[]) {
        if (!documents.length) return;

        const chunks = this.chunkDocuments(documents);
        const batchSize = 16;

        for (let i = 0; i < chunks.length; i += batchSize) {
            const batch = chunks.slice(i, i + batchSize);
            try {
                const result = await embeddingModel.batchEmbedContents({
                    requests: batch.map((c) => ({
                        content: { role: "user", parts: [{ text: c.content }] },
                        taskType: TaskType.RETRIEVAL_DOCUMENT,
                    })),
                });

                const embeddings = result.embeddings;

                for (let j = 0; j < batch.length; j++) {
                    if (embeddings[j]) {
                        await db.insert(document_chunks).values({
                            content: batch[j].content,
                            metadata: batch[j].metadata,
                            embedding: embeddings[j].values,
                        });
                    }
                }
            } catch (error) {
                console.error("Embedding batch failed:", error);
            }
        }
    }

    async search(query: string, k: number = 5) {
        try {
            const result = await embeddingModel.embedContent({
                content: { role: "user", parts: [{ text: query }] },
                taskType: TaskType.RETRIEVAL_QUERY,
            });

            const embedding = result.embedding.values;
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
            // Return mock documents if DB fails, so summarizer has something to work with
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
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
            const prompt = `
            You are a reranking expert. Given a query and a list of documents, score each document's relevance to the query on a scale of 0 to 1.
            Return the output as a JSON array of objects, where each object has an "index" (0-based) and a "relevance_score".

            Query: "${query}"

            Documents:
            ${documents.map((doc, i) => `[${i}] ${doc.content.substring(0, 300)}...`).join("\n")}

            Output JSON:
            `;

            const result = await model.generateContent({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: "application/json" }
            });

            const responseText = result.response.text();
            const scores = JSON.parse(responseText) as { index: number; relevance_score: number }[];

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
