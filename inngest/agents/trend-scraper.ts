import { inngest } from "../client";
import { webSearch, generateWithLLM } from "../../lib/agent-utils";


export const trendScraperHandler = async ({ event, step }: { event: any, step: any }) => {
    const { topic } = event.data;

    if (!topic) {
        return { error: "Topic is required" };
    }

    // 1. Broad Search & News
    const broadTrends = await step.run("broad-search", async () => {
        const query = `developer surveys and trends 2025 for ${topic}`;
        const results = await webSearch(query, 5);

        // Fetch news if API key exists
        let news: any[] = [];
        if (process.env.NEWS_API_KEY) {
            try {
                const newsRes = await fetch(`https://newsapi.org/v2/everything?q=${topic}&sortBy=publishedAt&pageSize=5&language=en&apiKey=${process.env.NEWS_API_KEY}`);
                const newsData = await newsRes.json();
                news = newsData.articles?.map((a: any) => ({ title: a.title, url: a.url, content: a.description })) || [];
            } catch (e) {
                console.error("News API failed", e);
            }
        }

        return [...results, ...news];
    });

    // 2. Deep Dive
    const deepDive = await step.run("deep-dive", async () => {
        const query = `major developer pain points and challenges in ${topic}`;
        return await webSearch(query, 5);
    });

    // 3. Community Pulse (Reddit via Search as fallback/proxy)
    const communityPulse = await step.run("community-pulse", async () => {
        // Using web search to find reddit threads as a robust fallback
        const query = `site:reddit.com ${topic} discussions pain points`;
        return await webSearch(query, 5);
    });

    // 4. Summarize
    const summary = await step.run("summarize-trends", async () => {
        let contextText = "";
        [...broadTrends, ...deepDive, ...communityPulse].forEach((doc: any) => {
            contextText += `Source: ${doc.url}\nTitle: ${doc.title}\nContent: ${doc.content?.slice(0, 1000)}\n\n`;
        });

        const prompt = `
    You are an AI research analyst. Your goal is to find trends on: "${topic}"

    TREND DATA:
        You are a Senior Market Trend Analyst.
        Analyze the provided search data to identify impactful trends relevant to the concept: "${topic}".
        
        Search Data:
        ${contextText}
        
        Be EXTREMELY DETAILED. Avoid generic statements. Provide concrete examples and evidence.
        
        Return a JSON object with this schema:
        {
            "trends": [
                {
                    "name": "Trend Name",
                    "description": "Detailed multi-paragraph explanation of the trend, why it matters, and its growth trajectory.",
                    "impact": "High/Medium/Low",
                    "evidence": ["Specific example or statistic 1", "Specific example or statistic 2", "..."]
                }
            ],
            "summary": "A comprehensive 300+ word synthesis of where the market is heading over the next 3-5 years."
        }
        `;

        const schema = {
            type: "OBJECT",
            properties: {
                trends: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            trend_name: { type: "STRING", description: "Name of the emerging trend." },
                            short_summary: { type: "STRING", description: "Brief summary of the trend." },
                            relevance_score: { type: "INTEGER", description: "Relevance score (0-100)." },
                            supporting_sources: { type: "ARRAY", items: { type: "STRING" }, description: "List of supporting source URLs." },
                        },
                        required: ["trend_name", "short_summary", "relevance_score", "supporting_sources"],
                    },
                },
            },
            required: ["trends"],
        };

        const fallbackData = {
            trends: [
                {
                    trend_name: "AI-Driven Personalization (Mock)",
                    short_summary: "This is a mock trend returned because the LLM call failed. It represents the growing demand for hyper-personalized experiences.",
                    relevance_score: 95,
                    supporting_sources: ["https://example.com/mock-trend-source"]
                },
                {
                    trend_name: "Sustainable Tech Solutions (Mock)",
                    short_summary: "Mock trend indicating a shift towards eco-friendly technology and green energy solutions in the industry.",
                    relevance_score: 88,
                    supporting_sources: ["https://example.com/green-tech"]
                }
            ]
        };

        return await generateWithLLM(prompt, schema, "GOOGLE_KEY_TREND", fallbackData);
    });

    return {
        success: true,
        summary,
    };
};

export const trendScraperAgent = inngest.createFunction(
    { id: "trend-scraper-agent" },
    { event: "agent/trend-scraper" },
    trendScraperHandler
);
