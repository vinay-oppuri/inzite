import { AgentState } from "../state";
import { competitorScoutAgent } from "../../agents/competitor-scout";
import { trendScraperAgent } from "../../agents/trend-scraper";
import { techPaperMinerAgent } from "../../agents/tech-paper-miner";

export async function agentNode(state: AgentState, step: any): Promise<Partial<AgentState>> {
    console.log("🤖 [AgentNode] Executing agents...");
    const selectedAgents = state.plan?.selected_agents || [];
    const query = state.user_input;

    const promises = [];

    if (selectedAgents.includes("CompetitorScout") || selectedAgents.includes("competitor_scout")) {
        promises.push(
            step.invoke("invoke-competitor-scout", {
                function: competitorScoutAgent,
                data: { description: query },
            })
        );
    }

    if (selectedAgents.includes("TrendScraper") || selectedAgents.includes("trend_scraper")) {
        promises.push(
            step.invoke("invoke-trend-scraper", {
                function: trendScraperAgent,
                data: { topic: query },
            })
        );
    }

    if (selectedAgents.includes("TechPaperMiner") || selectedAgents.includes("tech_paper_miner")) {
        promises.push(
            step.invoke("invoke-tech-paper-miner", {
                function: techPaperMinerAgent,
                data: { topic: query },
            })
        );
    }

    const agentOutputs = await Promise.all(promises);
    return { agent_outputs: agentOutputs };
}
