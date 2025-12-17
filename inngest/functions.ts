import { inngest } from "./client";
import { competitorScoutAgent } from "./agents/competitor-scout";
import { trendScraperAgent } from "./agents/trend-scraper";
import { techPaperMinerAgent } from "./agents/tech-paper-miner";
import { researchWorkflow } from "./workflows/research-workflow";

export const helloWorld = inngest.createFunction(
    { id: "hello-world" },
    { event: "test/hello.world" },
    async ({ event, step }) => {
        await step.sleep("wait-a-moment", "1s");
        return { event, body: "Hello, World!" };
    }
);

export { competitorScoutAgent, trendScraperAgent, techPaperMinerAgent, researchWorkflow };
