import { AgentState } from "../state";
import { GoogleGenAI } from "@google/genai";
import { extractJson } from "../../../lib/agent-utils";


export async function plannerNode(state: AgentState): Promise<Partial<AgentState>> {
    const client = new GoogleGenAI({ apiKey: process.env.GOOGLE_KEY_PLANNER });
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
    
    Return a JSON object with:
    {
        "plan_steps": ["Step 1...", "Step 2..."],
        "selected_agents": ["AgentName1", "AgentName2"]
    }
    `;

    try {
        const result = await client.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                temperature: 0.3,
            }
        });
        const text = result.text;
        if (text && text.startsWith("⚠️")) {
            throw new Error(text);
        }
        const plan = extractJson(text || "");
        return { plan };
    } catch (error: any) {
        console.warn(`⚠️ [PlannerNode] Planning failed: ${error.message}. Using fallback plan.`);
        return {
            plan: _fallback_plan(intent),
        };
    }
}

function _fallback_plan(intent: any): any {
    const tech_keywords = intent.tech_keywords || [];
    const raw_query = intent.raw_query || "";

    const agents: string[] = [];

    // Simple heuristics
    if (tech_keywords.some((k: string) => ["ai", "ml", "llm"].includes(k.toLowerCase()))) {
        agents.push("TechPaperMiner");
    }

    if (raw_query.toLowerCase().includes("competitor")) {
        agents.push("CompetitorScout");
    }

    // Always include TrendScraper as fallback
    if (agents.length === 0) {
        agents.push("TrendScraper");
    }

    // Ensure TrendScraper is there if list is short (Python logic: if "TrendScraper" not in agents: agents.append("TrendScraper"))
    // But the Python logic was: if not agents: append. AND if "TrendScraper" not in agents: append.
    // Effectively ensuring TrendScraper is always present if the list was empty OR if it wasn't added by other rules.
    // Wait, the Python code:
    // if not agents: agents.append("TrendScraper")
    // if "TrendScraper" not in agents: agents.append("TrendScraper")
    // This implies TrendScraper is ALWAYS added if it's not there.

    if (!agents.includes("TrendScraper")) {
        agents.push("TrendScraper");
    }

    const tasks = agents.map((ag, i) => ({
        id: i + 1,
        title: `${ag} Task`,
        description: `Execute ${ag}`,
        priority: i + 1,
        assigned_agent: ag,
    }));

    return {
        research_goal: "Fallback research plan.",
        suggested_agents: agents,
        tasks: tasks,
        reasoning_notes: "Fallback used due to planner error.",
        // Map to the expected schema for consistency if needed, but the prompt asks for plan_steps and selected_agents
        // The Python code returns the object above.
        // But the LLM returns { plan_steps, selected_agents }.
        // The state.plan will hold either. The consumer of state.plan needs to handle both or we should unify.
        // The prompt return format is:
        // { "plan_steps": [...], "selected_agents": [...] }
        // The fallback return format in Python is:
        // { "research_goal": ..., "suggested_agents": ..., "tasks": ..., "reasoning_notes": ... }

        // Let's try to align them or keep as is if the downstream nodes handle it.
        // The user request said "implement every function (use this as reference)".
        // I will stick to the Python reference logic for _fallback_plan return value.
        // However, to be safe for the "selected_agents" usage in the prompt schema, I'll add it.
        selected_agents: agents,
        plan_steps: tasks.map(t => t.description)
    };
}
