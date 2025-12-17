import { AgentState } from "../state";
import { IntentParser } from "../../../lib/core/intent-parser";

const parser = new IntentParser();

export async function intentNode(state: AgentState): Promise<Partial<AgentState>> {
    console.log("🔍 [IntentNode] Parsing intent...");
    const intent = await parser.parse(state.user_input);
    return { intent };
}
