import { inngest } from "../client";
import { webSearch, scrapeUrl, generateWithLLM } from "../../lib/agent-utils";


export const competitorScoutHandler = async ({ event, step }: { event: any, step: any }) => {
    const { description } = event.data;

    if (!description) {
        return { error: "Description is required" };
    }

    // 1. Search Phase
    const searchResults = await step.run("search-competitors", async () => {
        const query = `top competitors for ${description}`;
        return await webSearch(query, 5);
    });

    // 2. Scrape Phase (Top 3)
    const scrapedContent = await step.run("scrape-websites", async () => {
        const urls = searchResults.slice(0, 3).map((r: any) => r.url);
        const contents = await Promise.all(urls.map((url: string) => scrapeUrl(url)));
        return contents.map((content, index) => ({
            url: urls[index],
            content,
        }));
    });

    // 3. Analysis Phase
    const analysis = await step.run("analyze-competitors", async () => {
        let contextText = "";
        // Add search results context
        searchResults.forEach((res: any) => {
            contextText += `Source: ${res.url}\nTitle: ${res.title}\nSnippet: ${res.content}\n\n`;
        });
        // Add scraped content context
        scrapedContent.forEach((item: any) => {
            contextText += `Source: ${item.url}\nContent: ${item.content.slice(0, 2000)}\n\n`;
        });

        const prompt = `
        You are an expert Competitive Intelligence Analyst.
        Conduct a DEEP and COMPREHENSIVE analysis of the following competitors based on the provided search results.
        
        Search Results:
        ${JSON.stringify(searchResults, null, 2)}
        
        You MUST generate a detailed report. Do not summarize briefly; be verbose and specific.
        
        Required Output format (JSON):
        {
            "competitors": [
                {
                    "name": "Competitor Name",
                    "url": "Website URL",
                    "description": "Detailed multi-paragraph description of what they do, their target market, and their unique value proposition.",
                    "strengths": ["Detailed strength 1 with evidence", "Detailed strength 2 with evidence", ...],
                    "weaknesses": ["Detailed weakness 1 with evidence", "Detailed weakness 2 with evidence", ...],
                    "pricing": "Comprehensive pricing structure, including tiers, free plans, and enterprise options if available.",
                    "features": ["Feature 1: Description of utility", "Feature 2: Description of utility", ...]
                }
            ],
            "market_summary": "A comprehensive 3-5 paragraph overview of the competitive landscape, identifying gaps and saturation points."
        }
        `;

        const schema = {
            type: "OBJECT",
            properties: {
                competitors: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            name: { type: "STRING", description: "The name of the competitor company." },
                            domain: { type: "STRING", description: "The market or domain they operate in." },
                            summary: { type: "STRING", description: "A brief summary of what the competitor does." },
                            website: { type: "STRING", description: "The competitor's main website URL." },
                            reason_for_similarity: { type: "STRING", description: "Why this company is a competitor." },
                            estimated_similarity_score: { type: "INTEGER", description: "A 0-100 score of how similar they are." },
                            key_features: { type: "ARRAY", items: { type: "STRING" }, description: "A list of key features." },
                            pricing_model: { type: "STRING", description: "The competitor's pricing model." },
                            target_audience: { type: "STRING", description: "The primary target audience." },
                        },
                        required: ["name", "domain", "summary", "reason_for_similarity", "estimated_similarity_score"],
                    },
                },
            },
            required: ["competitors"],
        };

        const fallbackData = {
            competitors: [
                {
                    name: "Mock Competitor A",
                    domain: "Direct Competitor",
                    summary: "This is a mock competitor profile returned due to an LLM error. They offer a similar product with basic features.",
                    reason_for_similarity: "Targeting the same customer segment with overlapping functionality.",
                    estimated_similarity_score: 85,
                    key_features: ["Basic Feature 1", "Basic Feature 2"],
                    pricing_model: "Freemium",
                    target_audience: "Small Businesses",
                    website: "https://example.com/competitor-a"
                },
                {
                    name: "Mock Competitor B",
                    domain: "Indirect Competitor",
                    summary: "Another mock competitor. They solve the same problem but with a different approach.",
                    reason_for_similarity: "Solves the core problem using a manual service model.",
                    estimated_similarity_score: 60,
                    key_features: ["Service Feature 1"],
                    pricing_model: "Subscription",
                    target_audience: "Enterprise",
                    website: "https://example.com/competitor-b"
                }
            ]
        };

        return await generateWithLLM(prompt, schema, "GOOGLE_KEY_COMPETITOR", fallbackData);
    });

    return {
        success: true,
        analysis,
        searchResults,
    };
};

export const competitorScoutAgent = inngest.createFunction(
    { id: "competitor-scout-agent" },
    { event: "agent/competitor-scout" },
    competitorScoutHandler
);
