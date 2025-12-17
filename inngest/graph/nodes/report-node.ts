import { AgentState } from "../state";

export async function reportNode(state: AgentState): Promise<Partial<AgentState>> {
    console.log("📝 [ReportNode] Building final report...");
    const strategy = state.strategy;

    if (!strategy) {
        return { final_report: "Error: No strategy generated." };
    }

    // Convert JSON strategy to Markdown
    let markdown = `# ${state.user_input}\n\n`;

    if (strategy.executive_summary) {
        markdown += `## Executive Summary\n${strategy.executive_summary}\n\n`;
    }

    if (strategy.key_findings && strategy.key_findings.length > 0) {
        markdown += `## Key Findings\n`;
        strategy.key_findings.forEach((f: string) => markdown += `- ${f}\n`);
        markdown += `\n`;
    }

    if (strategy.market_opportunities && strategy.market_opportunities.length > 0) {
        markdown += `## Market Opportunities\n`;
        strategy.market_opportunities.forEach((op: any) => {
            markdown += `### ${op.opportunity}\n`;
            markdown += `**Impact:** ${op.impact}\n`;
            if (op.evidence) {
                op.evidence.forEach((e: string) => markdown += `- ${e}\n`);
            }
            markdown += `\n`;
        });
    }

    if (strategy.risks_and_challenges && strategy.risks_and_challenges.length > 0) {
        markdown += `## Risks & Challenges\n`;
        strategy.risks_and_challenges.forEach((r: string) => markdown += `- ${r}\n`);
        markdown += `\n`;
    }

    if (strategy.strategic_recommendations && strategy.strategic_recommendations.length > 0) {
        markdown += `## Strategic Recommendations\n`;
        strategy.strategic_recommendations.forEach((rec: any) => {
            markdown += `### ${rec.area}\n`;
            markdown += `**Action:** ${rec.action}\n`;
            markdown += `**Priority:** ${rec.priority} | **Owner:** ${rec.owner}\n\n`;
        });
    }

    if (strategy.roadmap) {
        markdown += `## Implementation Roadmap\n`;
        Object.entries(strategy.roadmap).forEach(([phase, steps]: [string, any]) => {
            markdown += `### ${phase.replace(/_/g, ' ')}\n`;
            if (Array.isArray(steps)) {
                steps.forEach((s: string) => markdown += `- ${s}\n`);
            }
            markdown += `\n`;
        });
    }

    // Format agent outputs for the dashboard (keep this logic for dashboard compatibility)
    const agent_groups: Record<string, any> = {};
    if (state.agent_outputs) {
        state.agent_outputs.forEach((output: any) => {
            if (output.analysis) {
                agent_groups["Competitor Scout"] = output.analysis;
            } else if (output.summary) {
                if (output.summary.trends) {
                    agent_groups["Trend Scraper"] = output.summary;
                } else if (output.summary.papers) {
                    agent_groups["Tech Paper Miner"] = output.summary;
                }
            }
            if (output.trends) agent_groups["Trend Scraper"] = { trends: output.trends };
            if (output.papers) agent_groups["Tech Paper Miner"] = { papers: output.papers };
        });
    }

    return {
        final_report: markdown,
        agent_groups: agent_groups,
        markdown_path: "generated/report.md"
    };
}
