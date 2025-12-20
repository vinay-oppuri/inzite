import { AgentState } from "../state";
import { LLMClient } from "../../../lib/llm-client";
import { extractJson } from "../../../lib/agent-utils";


export async function plannerNode(state: AgentState): Promise<Partial<AgentState>> {
    const client = new LLMClient();
    console.log("🗺️ [PlannerNode] Generating plan...");
    const intent = state.intent || {};

    const prompt = `
    You are an intelligent **Dynamic Task Planner** for an Agentic Startup Research Assistant.
    
    Given the parsed startup intent:
    ${JSON.stringify(intent, null, 2)}
    
    Generate a **pure JSON** object with the following fields:
    
    AVAILABLE AGENTS:
    - CompetitorScout: Finds competitors and analyzes their features.
    - TrendScraper: Finds latest market trends and news.
    - TechPaperMiner: Finds technical papers and academic research.
    
    IMPORTANT:
    - You must maximize the depth of the research. 
    - **ALWAYS SELECT ALL 3 AGENTS** ("CompetitorScout", "TrendScraper", "TechPaperMiner") unless the user's intent EXPLICITLY forbids one (e.g. "Do not look at competitors").
    - If in doubt, INCLUDE the agent. More data is better.
    
    Return a JSON object with:
    {
        "plan_steps": ["Step 1...", "Step 2..."],
        "selected_agents": ["AgentName1", "AgentName2"]
    }
    `;

    try {
        const result = await client.generate(prompt, { json: true, temperature: 0.3 });
        const plan = extractJson(result.text || "");
        return { plan };
    } catch (error: any) {
        console.warn(`⚠️ [PlannerNode] Planning failed: ${error.message}. Using fallback plan.`);
        return {
            plan: _fallback_plan(intent),
        };
    }
}

function _fallback_plan(intent: any): any {
    // Fallback: Enable all agents to ensure the user gets a full report even if planning fails.
    const agents: string[] = ["CompetitorScout", "TrendScraper", "TechPaperMiner"];

    const tasks = agents.map((ag, i) => ({
        id: i + 1,
        title: `${ag} Task`,
        description: `Execute ${ag}`,
        priority: i + 1,
        assigned_agent: ag,
    }));

    return {
        research_goal: "Fallback research plan (Full Coverage).",
        suggested_agents: agents,
        tasks: tasks,
        reasoning_notes: "Fallback used due to planner error. Selected all agents for maximum coverage.",
        selected_agents: agents,
        plan_steps: tasks.map(t => t.description)
    };
}
