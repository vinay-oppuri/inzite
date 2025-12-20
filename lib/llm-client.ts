import { GoogleGenerativeAI } from "@google/generative-ai";

export class LLMClient {
    private apiKey: string;
    private baseURL: string;
    private model: string;
    private genAI: GoogleGenerativeAI;

    constructor() {
        this.apiKey = process.env.GROQ_API_KEY || "";
        this.baseURL = "https://api.groq.com/openai/v1/chat/completions";
        // Default to a solid model on Groq (Updated to latest supported model)
        this.model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

        // Initialize Gemini for Embeddings (Groq doesn't support them yet)
        // Ensure GOOGLE_API_KEY is available in .env
        this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");
    }

    async generate(prompt: string, config?: { json?: boolean; temperature?: number; maxRetries?: number }): Promise<{ text: string }> {
        if (!this.apiKey) {
            throw new Error("GROQ_API_KEY is missing in environment variables.");
        }

        console.log(`⚡ [Groq] Generating with model: ${this.model}`);

        const maxRetries = config?.maxRetries ?? 1; // Default to 1 retry as requested
        let attempts = 0;

        while (attempts <= maxRetries) {
            attempts++;
            try {
                const body: any = {
                    model: this.model,
                    messages: [
                        { role: "user", content: prompt }
                    ],
                    temperature: config?.temperature || 0.7,
                    stream: false
                };

                if (config?.json) {
                    body.response_format = { type: "json_object" };
                }

                const response = await fetch(this.baseURL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${this.apiKey}`
                    },
                    body: JSON.stringify(body),
                });

                if (!response.ok) {
                    const errorText = await response.text();

                    // Specific handling for Quota (429) - Fail fast if requested
                    if (response.status === 429) {
                        console.warn(`⏳ [Groq] Rate limit hit (Attempt ${attempts}/${maxRetries + 1}).`);
                        if (attempts > maxRetries) {
                            throw new Error(`Groq Quota Exceeded: ${errorText}`);
                        }
                        // Exponential backoff: 2s, 4s...
                        const waitTime = Math.pow(2, attempts) * 1000;
                        await new Promise(resolve => setTimeout(resolve, waitTime));
                        continue;
                    }

                    throw new Error(`Groq API error: ${response.status} ${response.statusText} - ${errorText}`);
                }

                const data = await response.json();
                return { text: data.choices[0].message.content };

            } catch (error: any) {
                console.error(`❌ [Groq] Generation failed (Attempt ${attempts}):`, error);

                if (attempts > maxRetries) {
                    // If it's a critical error (like auth) don't retry, just throw
                    throw error;
                }
                // Wait briefly before non-429 retry
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        throw new Error("Max retries exceeded");
    }

    async embed(text: string): Promise<number[]> {
        // Fallback to Gemini for embeddings
        try {
            const embeddingModel = this.genAI.getGenerativeModel({ model: "text-embedding-004" });
            const result = await embeddingModel.embedContent(text);
            return result.embedding.values;
        } catch (error) {
            console.error("❌ [Gemini] Embedding failed:", error);
            return [];
        }
    }
}
