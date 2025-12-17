import { inngest } from "../client";
import { AgentState } from "../graph/state";
import { intentNode } from "../graph/nodes/intent-node";
import { plannerNode } from "../graph/nodes/planner-node";
import { agentNode } from "../graph/nodes/agent-node";
import { ingestionNode } from "../graph/nodes/ingestion-node";
import { retrieverNode } from "../graph/nodes/retriever-node";
import { rerankerNode } from "../graph/nodes/reranker-node";
import { summarizerNode } from "../graph/nodes/summarizer-node";
import { strategyNode } from "../graph/nodes/strategy-node";
import { reportNode } from "../graph/nodes/report-node";
import { db } from "../../db";
import { reports } from "../../db/schema";

export const researchWorkflow = inngest.createFunction(
    { id: "research-workflow" },
    { event: "workflow/research" },
    async ({ event, step }) => {
        const { query } = event.data;
        if (!query) return { error: "Query is required" };

        // Initialize State
        let state: AgentState = {
            user_input: query,
        };

        // 1. Intent Node
        const intentOutput = await step.run("intent-node", async () => {
            return await intentNode(state);
        });
        state = { ...state, ...intentOutput };

        // 2. Planner Node
        const plannerOutput = await step.run("planner-node", async () => {
            return await plannerNode(state);
        });
        state = { ...state, ...plannerOutput };

        // 3. Agent Node (Parallel Execution)
        const agentOutput = await agentNode(state, step);
        state = { ...state, ...agentOutput };

        // 4. Ingestion Node (Raw Docs Store)
        const ingestionOutput = await step.run("ingestion-node", async () => {
            return await ingestionNode(state);
        });
        state = { ...state, ...ingestionOutput };

        // 5. Retriever Node
        const retrieverOutput = await step.run("retriever-node", async () => {
            return await retrieverNode(state);
        });
        state = { ...state, ...retrieverOutput };

        // 6. Reranker Node
        const rerankerOutput = await step.run("reranker-node", async () => {
            return await rerankerNode(state);
        });
        state = { ...state, ...rerankerOutput };

        // 7. Summarizer Node
        const summarizerOutput = await step.run("summarizer-node", async () => {
            return await summarizerNode(state);
        });
        state = { ...state, ...summarizerOutput };

        // 8. Strategy Node
        const strategyOutput = await step.run("strategy-node", async () => {
            return await strategyNode(state);
        });
        state = { ...state, ...strategyOutput };

        // 9. Report Node
        const reportOutput = await step.run("report-node", async () => {
            return await reportNode(state);
        });
        state = { ...state, ...reportOutput };

        // 10. Save to DB
        await step.run("save-to-db", async () => {
            if (state.final_report) {
                try {
                    await db.insert(reports).values({
                        idea: query,
                        result_json: state,
                        report_md: state.final_report,
                    });
                } catch (error) {
                    console.warn("⚠️ Failed to save report to DB:", error);
                    // Fallback: Save to file system so dashboard can still read it
                    try {
                        const fs = await import("fs/promises");
                        const path = await import("path");
                        const reportData = {
                            id: Date.now(), // Mock ID
                            idea: query,
                            result_json: state,
                            report_md: state.final_report,
                            created_at: new Date().toISOString()
                        };
                        const filePath = path.join(process.cwd(), "generated", "latest-report.json");
                        await fs.writeFile(filePath, JSON.stringify(reportData, null, 2));
                        console.log("✅ Saved report to fallback file:", filePath);
                    } catch (fileError) {
                        console.error("❌ Failed to save report to file fallback:", fileError);
                    }
                }
            }
        });

        return {
            success: true,
            state,
        };
    }
);
