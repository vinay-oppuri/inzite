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
import { reports, research_sessions } from "../../db/schema";
import { eq } from "drizzle-orm";

export const researchWorkflow = inngest.createFunction(
    { id: "research-workflow" },
    { event: "workflow/research" },
    async ({ event, step }) => {
        const { query, sessionId, userId } = event.data;
        if (!query) return { error: "Query is required" };

        const updateStatus = async (status: string, stepName: string) => {
            if (sessionId) {
                try {
                    await step.run(`update-status-${stepName}`, async () => {
                        await db.update(research_sessions)
                            .set({ status, currentStep: stepName })
                            .where(eq(research_sessions.sessionId, sessionId));
                    });
                } catch (e) {
                    // Ignore DB update errors to not block workflow
                    console.warn("Status update failed", e);
                }
            }
        };

        // Initialize State
        let state: AgentState = {
            user_input: query,
        };

        await updateStatus("processing", "Analyzing Intent");
        await step.sleep("sleep-intent", "10s");

        // 1. Intent Node
        const intentOutput = await step.run("intent-node", async () => {
            return await intentNode(state);
        });
        state = { ...state, ...intentOutput };

        await updateStatus("processing", "Planning Research Agents");
        await step.sleep("sleep-planner", "10s");

        // 2. Planner Node
        const plannerOutput = await step.run("planner-node", async () => {
            return await plannerNode(state);
        });
        state = { ...state, ...plannerOutput };

        await updateStatus("processing", "Running Autonomous Agents (Scouting & Mining)");
        await step.sleep("sleep-agents", "10s");

        // 3. Agent Node (Parallel Execution)
        const agentOutput = await agentNode(state, step);
        state = { ...state, ...agentOutput };

        await updateStatus("processing", "Ingesting & Processing Data");
        await step.sleep("sleep-ingestion", "10s");

        // 4. Ingestion Node (Raw Docs Store)
        const ingestionOutput = await step.run("ingestion-node", async () => {
            return await ingestionNode(state);
        });
        state = { ...state, ...ingestionOutput };

        await updateStatus("processing", "Retrieving Relevant Context");
        await step.sleep("sleep-retriever", "10s");

        // 5. Retriever Node
        const retrieverOutput = await step.run("retriever-node", async () => {
            return await retrieverNode(state);
        });
        state = { ...state, ...retrieverOutput };

        await updateStatus("processing", "Reranking & Optimizing Results");
        await step.sleep("sleep-reranker", "10s");

        // 6. Reranker Node
        const rerankerOutput = await step.run("reranker-node", async () => {
            return await rerankerNode(state);
        });
        state = { ...state, ...rerankerOutput };

        await updateStatus("processing", "Summarizing Findings");
        await step.sleep("sleep-summarizer", "10s");

        // 7. Summarizer Node
        const summarizerOutput = await step.run("summarizer-node", async () => {
            return await summarizerNode(state);
        });
        state = { ...state, ...summarizerOutput };

        await updateStatus("processing", "Formulating Strategic Report");
        await step.sleep("sleep-strategy", "10s");

        // 8. Strategy Node
        const strategyOutput = await step.run("strategy-node", async () => {
            return await strategyNode(state);
        });
        state = { ...state, ...strategyOutput };

        await updateStatus("processing", "Finalizing Report");
        await step.sleep("sleep-report", "10s");

        // 9. Report Node
        const reportOutput = await step.run("report-node", async () => {
            return await reportNode(state);
        });
        state = { ...state, ...reportOutput };

        // 9.5 DEBUG STATE
        await step.run("debug-state", async () => {
            console.log("🔍 [DEBUG] State Keys before Save:", Object.keys(state));
            console.log("🔍 [DEBUG] Final Report Present:", !!state.final_report);
            console.log("🔍 [DEBUG] UserId:", userId);
            return {};
        });

        // 10. Save to DB

        const saveOutput = await step.run("save-to-db", async () => {
            if (state.final_report) {
                try {
                    console.log("💾 [SaveToDB] Attempting to save report...", {
                        idea: query,
                        userId: userId || "anonymous",
                        reportLength: state.final_report?.length
                    });

                    // Sanitize state to ensure valid JSON
                    const cleanState = JSON.parse(JSON.stringify(state));

                    // 1. Find the lowest available ID (Gap Filling)
                    // We fetch all IDs to find the first missing integer starting from 0.
                    // Note: In high traffic, this needs a transaction or lock, but for this use case, it's fine.
                    const existingReports = await db.select({ id: reports.id }).from(reports);
                    const existingIds = new Set(existingReports.map(r => r.id));

                    let nextId = 0;
                    while (existingIds.has(nextId)) {
                        nextId++;
                    }

                    console.log(`💾 [SaveToDB] Determined next sequential ID: ${nextId}`);

                    const [savedReport] = await db.insert(reports).values({
                        id: nextId, // Manually assign the gap-filled ID
                        idea: query,
                        userId: userId || "anonymous",
                        result_json: cleanState,
                        report_md: state.final_report,
                    }).returning({ id: reports.id });

                    if (savedReport === undefined) {
                        throw new Error("Database insert returned no result");
                    }

                    console.log("✅ [SaveToDB] Report saved with ID:", savedReport.id);

                    if (sessionId) {
                        await db.update(research_sessions)
                            .set({ status: "completed", currentStep: "Done", resultId: savedReport.id })
                            .where(eq(research_sessions.sessionId, sessionId));
                    }

                    return { report_id: String(savedReport.id) };

                } catch (error) {
                    console.error("🛑 [SaveToDB] CRITICAL FAILURE:", error);

                    if (sessionId) {
                        await db.update(research_sessions)
                            .set({ status: "failed", currentStep: "Failed to save report: " + (error instanceof Error ? error.message : String(error)) })
                            .where(eq(research_sessions.sessionId, sessionId));
                    }
                    return {}; // Return empty to allow workflow to finish gracefully (or rethrow if you want retry)
                }
            } else {
                console.warn("⚠️ [SaveToDB] Skipping save - No final report found in state.");
                return {};
            }
        });
        state = { ...state, ...saveOutput };

        // 11. Ingest into Vector Store (RAG)
        await step.run("ingest-rag", async () => {
            if (state.final_report && state.final_report.length > 0) {
                try {
                    const { VectorStoreManager } = await import("../../lib/core/rag-manager");
                    const ragManager = new VectorStoreManager();

                    await ragManager.addDocuments([{
                        content: state.final_report,
                        metadata: {
                            reportId: state.report_id || "unknown",
                            idea: query,
                            sessionId: sessionId,
                            userId: userId
                        }
                    }], userId); // Pass userId to addDocuments
                } catch (error) {
                    console.warn("⚠️ RAG Ingestion failed:", error);
                    // Don't fail the workflow for this
                }
            }
        });

        return {
            success: true,
            state,
        };
    }
);
