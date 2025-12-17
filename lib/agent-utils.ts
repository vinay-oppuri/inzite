import * as cheerio from "cheerio";
import { parseStringPromise } from "xml2js";
import { GoogleGenAI, GenerationConfig } from "@google/genai";

export interface SearchResult {
    title: string;
    url: string;
    content: string;
    authors?: string[];
    publishedDate?: string;
}

export async function webSearch(query: string, numResults: number = 5): Promise<SearchResult[]> {
    const apiKey = process.env.TAVILY_API_KEY;
    if (!apiKey) {
        console.warn("TAVILY_API_KEY is not set");
        return [];
    }

    try {
        const response = await fetch("https://api.tavily.com/search", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                api_key: apiKey,
                query,
                num_results: numResults,
            }),
        });

        if (!response.ok) {
            throw new Error(`Tavily API error: ${response.statusText}`);
        }

        const data = await response.json();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return data.results.map((r: any) => ({
            title: r.title,
            url: r.url,
            content: r.content,
        }));
    } catch {
        console.error("Web search failed:");
        return [];
    }
}

export async function scrapeUrl(url: string, maxChars: number = 8000): Promise<string> {
    try {
        const response = await fetch(url, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            },
        });

        if (!response.ok) {
            return `Failed to scrape ${url}: ${response.statusText}`;
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        // Remove scripts and styles
        $("script, style").remove();

        // Get text
        let text = $("body").text();

        // Clean up whitespace
        text = text.replace(/\s+/g, " ").trim();

        return text.slice(0, maxChars);
    } catch {
        return `Failed to scrape ${url}:`;
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extractJson<T = any>(text: string): T | null {
    try {
        // Try parsing directly
        return JSON.parse(text);
    } catch {
        // Try finding JSON block
        const match = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```([\s\S]*?)```/);
        if (match) {
            try {
                return JSON.parse(match[1]);
            } catch {
                console.error("Failed to parse extracted JSON block");
            }
        }

        // Try finding first { and last }
        const firstBrace = text.indexOf("{");
        const lastBrace = text.lastIndexOf("}");
        if (firstBrace !== -1 && lastBrace !== -1) {
            try {
                return JSON.parse(text.substring(firstBrace, lastBrace + 1));
            } catch {
                console.error("Failed to parse JSON from braces");
            }
        }

        return null;
    }
}

export async function searchArxiv(query: string, maxResults: number = 3): Promise<SearchResult[]> {
    try {
        const apiUrl = `http://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=${maxResults}&sortBy=relevance&sortOrder=descending`;
        const response = await fetch(apiUrl);
        const xml = await response.text();

        const result = await parseStringPromise(xml);
        const entries = result.feed.entry || [];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return entries.map((entry: any) => ({
            title: entry.title[0].replace(/\n/g, " ").trim(),
            url: entry.id[0],
            content: entry.summary[0].replace(/\n/g, " ").trim(),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            authors: entry.author.map((a: any) => a.name[0]),
            publishedDate: entry.published[0],
        }));
    } catch (error) {
        console.error("arXiv search failed:", error);
        return [];
    }
}

export async function generateWithGemini<T>(
    prompt: string,
    schema: unknown,
    apiKeyEnvVar: string,
    fallbackData: T,
    modelName: string = "gemini-2.5-flash"
): Promise<T> {
    const apiKey = process.env[apiKeyEnvVar];
    if (!apiKey) {
        console.warn(`API key ${apiKeyEnvVar} not found. Returning fallback data.`);
        return fallbackData;
    }

    const client = new GoogleGenAI({ apiKey });

    try {
        const result = await client.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
                temperature: 0.3,
            } as GenerationConfig,
        });

        const parsed = extractJson<T>(result.text || "");
        return parsed || fallbackData;
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.warn(`⚠️ Gemini generation failed (${modelName}). Returning fallback data.`, errorMessage);
        return fallbackData;
    }
}
