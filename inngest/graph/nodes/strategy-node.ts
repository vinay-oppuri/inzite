import { AgentState } from "../state";
import { Summarizer } from "../../../lib/core/summarizer";

const summarizer = new Summarizer();

export async function strategyNode(state: AgentState): Promise<Partial<AgentState>> {
    console.log("🧠 [StrategyNode] Generating strategy...");
    const query = state.user_input;
    const summary = state.summary || "";

    // We pass the summary as a single context item to the existing Summarizer class
    // The Summarizer class is actually a Strategy Engine that produces the JSON report
    const strategy = await summarizer.summarize(query, [summary]);

    return { strategy };
}
