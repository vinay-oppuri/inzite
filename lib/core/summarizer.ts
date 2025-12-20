import { LLMClient } from "../llm-client";


export class Summarizer {
    private client: LLMClient;

    constructor() {
        this.client = new LLMClient();
    }

    async summarize(query: string, contexts: string[]): Promise<unknown> {
        if (!contexts.length) return { error: "No context found to summarize." };

        const contextText = contexts.slice(0, 10).join("\n\n");
        const prompt = `
      You are an expert Strategic Consultant for high-growth startups.
      Your goal is to synthesize research into a **DEEP DIVE** strategic report.
      
      ### User Idea/Query:
      ${query}

      ### Research Context:
      ${contextText}

      ### CRITICAL INSTRUCTIONS:
      - **DEPTH IS MANDATORY**: Do not produce high-level fluff. Provide specific numbers, competitor names, pricing tiers, and technical specs.
      - **NO TRANSITION WORDS**: Go straight to the point.
      - **QUANTIFY**: Use % growth, $ market size, user counts wherever possible.
      - **EVIDENCE**: Backup every opportunity with a specific fact from the context.

      ### JSON Schema (Strictly Adhere):
      {
        "executive_summary": "A comprehensive executive summary (4-6 sentences) detailing the market state, key gap, and winning strategy.",
        "key_findings": ["Finding 1 (Detail + Evidence)", "Finding 2...", "Finding 3...", "Finding 4...", "Finding 5...", "Finding 6..."],
        "market_opportunities": [
            { "opportunity": "Specific Opportunity Name", "impact": "High/Critical", "evidence": ["Fact 1", "Fact 2", "Fact 3"] },
            { "opportunity": "...", "impact": "...", "evidence": ["..."] },
            { "opportunity": "...", "impact": "...", "evidence": ["..."] },
            { "opportunity": "...", "impact": "...", "evidence": ["..."] }
        ],
        "risks_and_challenges": ["Risk 1 (Detail + Mitigation)", "Risk 2...", "Risk 3...", "Risk 4...", "Risk 5..."],
        "strategic_recommendations": [
            { "area": "Product", "action": "Specific feature/action", "priority": "High", "owner": "Product Lead" },
            { "area": "Go-to-Market", "action": "...", "priority": "High", "owner": "CMO" },
            { "area": "Technology", "action": "...", "priority": "Medium", "owner": "CTO" },
            { "area": "Operations", "action": "...", "priority": "Medium", "owner": "COO" },
            { "area": "Sales", "action": "...", "priority": "High", "owner": "Sales Lead" }
        ],
        "suggested_kpis": [
            { "name": "KPI 1", "target": "Specific Number", "rationale": "Why matters" },
            { "name": "KPI 2", "target": "...", "rationale": "..." },
            { "name": "KPI 3", "target": "...", "rationale": "..." },
            { "name": "KPI 4", "target": "...", "rationale": "..." }
        ],
        "roadmap": {
            "phase_1_validation": ["Step 1", "Step 2", "Step 3", "Step 4"],
            "phase_2_launch": ["Step 1", "Step 2", "Step 3", "Step 4"],
            "phase_3_scale": ["Step 1", "Step 2", "Step 3", "Step 4"]
        }
      }
    `;

        try {
            const result = await this.client.generate(prompt, { json: true, temperature: 0.2 });
            try {
                return JSON.parse(result.text);
            } catch {
                // Try extracting JSON if strict parse fails
                const match = result.text.match(/\{[\s\S]*\}/);
                if (match) return JSON.parse(match[0]);
                return { executive_summary: result.text, key_findings: [] };
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.warn("⚠️ Summarizer: LLM call failed. Generating fallback report from context.", errorMessage);

            // Dynamic Fallback: Use the actual retrieved context
            const fallbackSummary = `
**Note:** The AI summarizer encountered an error (${errorMessage}). Below is the raw research data retrieved for your query.

### Research Context Snippets:
${contextText.slice(0, 2000)}... (truncated)
            `.trim();

            // Attempt to extract some key points from context (simple heuristic)
            const potentialFindings = contextText
                .split('\n')
                .filter(line => line.length > 20 && line.length < 150)
                .slice(0, 5)
                .map(line => line.trim());

            return {
                executive_summary: fallbackSummary,
                key_findings: potentialFindings.length > 0 ? potentialFindings : ["Could not extract specific findings. Please review the Research Context above."],
                market_opportunities: [
                    {
                        opportunity: "Analysis of Retrieved Data",
                        impact: "Unknown",
                        evidence: ["Please refer to the raw research context provided in the Executive Summary."]
                    }
                ],
                risks_and_challenges: ["LLM Summarization Failed - Manual Review Required"],
                strategic_recommendations: [
                    {
                        area: "Manual Review",
                        action: "Review the raw research data to derive insights.",
                        priority: "High",
                        owner: "User"
                    }
                ],
                suggested_kpis: [
                    { name: "Data Coverage", target: "N/A", rationale: "Assess the quality of retrieved documents." }
                ],
                roadmap: {
                    phase_1_review: ["Read retrieved context", "Identify key trends"],
                    phase_2_action: ["Formulate strategy based on raw data"]
                }
            };
        }
    }
}
