import { inngest } from "../client";
import { webSearch, searchArxiv, scrapeUrl, generateWithGemini } from "../../lib/agent-utils";

export const techPaperMinerHandler = async ({ event, step }: { event: any, step: any }) => {
    const { topic } = event.data;

    if (!topic) {
        return { error: "Topic is required" };
    }

    // 1. Broad Discovery (Tavily)
    const broadDiscovery = await step.run("broad-discovery", async () => {
        const query = `latest research papers and technical blogs about ${topic}`;
        return await webSearch(query, 5);
    });

    // 2. Academic Search (arXiv)
    const academicSearch = await step.run("academic-search", async () => {
        // Limit query length for arXiv
        const query = topic.slice(0, 300);
        return await searchArxiv(query, 3);
    });

    // 3. Scrape Details (from Tavily results)
    const scrapedDetails = await step.run("scrape-details", async () => {
        // Filter for non-PDF links from broad discovery
        const urlsToScrape = broadDiscovery
            .filter((r: any) => r.url && !r.url.endsWith(".pdf"))
            .slice(0, 2)
            .map((r: any) => r.url);

        const contents = await Promise.all(urlsToScrape.map((url: string) => scrapeUrl(url)));
        return contents.map((content, index) => ({
            url: urlsToScrape[index],
            content,
        }));
    });

    // 4. Summarize
    const summary = await step.run("summarize-papers", async () => {
        let contextText = "";
        // Add broad discovery context
        broadDiscovery.forEach((doc: any) => {
            contextText += `Source: ${doc.url}\nTitle: ${doc.title}\nSnippet: ${doc.content}\n\n`;
        });
        // Add academic search context
        academicSearch.forEach((doc: any) => {
            contextText += `Source: ${doc.url}\nTitle: ${doc.title}\nAuthors: ${doc.authors?.join(", ")}\nAbstract: ${doc.content}\n\n`;
        });
        // Add scraped details context
        scrapedDetails.forEach((item: any) => {
            contextText += `Source: ${item.url}\nContent: ${item.content.slice(0, 1500)}\n\n`;
        });

        const prompt = `
        You are an AI research assistant. Your goal is to find key technical papers, articles, and libraries related to:
        "${topic}"

        RESEARCH DATA:
        ${contextText}

        Analyze the abstracts, snippets, and scraped text.
        Select the most important 3-5 papers/articles/libraries.
        Return the result as a JSON object matching the schema.
      `;

        const schema = {
            type: "OBJECT",
            properties: {
                papers: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            title: { type: "STRING", description: "The full title of the paper." },
                            authors: { type: "ARRAY", items: { type: "STRING" }, description: "List of authors." },
                            summary: { type: "STRING", description: "Concise summary." },
                            source_url: { type: "STRING", description: "URL to the paper." },
                            key_findings: { type: "ARRAY", items: { type: "STRING" }, description: "Key findings." },
                        },
                        required: ["title", "authors", "summary", "source_url", "key_findings"],
                    },
                },
            },
            required: ["papers"],
        };

        const fallbackData = {
            papers: [
                {
                    title: "Mock Technical Paper: Advances in Agentic AI",
                    authors: ["Jane Doe", "John Smith"],
                    summary: "This is a mock abstract returned due to an LLM error. It discusses the theoretical foundations of autonomous agents.",
                    key_findings: ["Agents can plan recursively", "Tool use improves accuracy"],
                    source_url: "https://arxiv.org/abs/mock-paper-1"
                },
                {
                    title: "Optimizing LLM Context Windows (Mock)",
                    authors: ["Alice Johnson"],
                    summary: "Mock paper about efficient context management in large language models.",
                    key_findings: ["Sliding windows reduce cost", "Summary tokens preserve context"],
                    source_url: "https://arxiv.org/abs/mock-paper-2"
                }
            ]
        };

        return await generateWithGemini(prompt, schema, "GOOGLE_KEY_PAPER", fallbackData);
    });

    return {
        success: true,
        summary,
    };
};

export const techPaperMinerAgent = inngest.createFunction(
    { id: "tech-paper-miner-agent" },
    { event: "agent/tech-paper-miner" },
    techPaperMinerHandler
);
