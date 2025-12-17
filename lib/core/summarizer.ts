import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_KEY_REPORT || "");

export class Summarizer {
    private model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    async summarize(query: string, contexts: string[]): Promise<unknown> {
        if (!contexts.length) return { error: "No context found to summarize." };

        const contextText = contexts.slice(0, 10).join("\n\n");
        const prompt = `
      You are a strategic startup consultant.
      Your goal is to synthesize research into a comprehensive strategic report.

      ### User Idea/Query:
      ${query}

      ### Research Context:
      ${contextText}

      ### Instructions:
      - Analyze the provided context deeply.
      - Generate a structured strategic report in JSON format.
      - Ensure the output matches the following schema EXACTLY.

      ### JSON Schema:
      {
        "executive_summary": "High-level summary of the opportunity and strategy (2-3 sentences).",
        "key_findings": ["List of 3-5 critical insights from the research."],
        "market_opportunities": [
            { "opportunity": "Name of opportunity", "impact": "High/Medium/Low", "evidence": ["Supporting fact 1", "Supporting fact 2"] }
        ],
        "risks_and_challenges": ["List of 3-5 potential risks."],
        "strategic_recommendations": [
            { "area": "Product/Marketing/Tech", "action": "Specific recommendation", "priority": "High/Medium", "owner": "Role responsible" }
        ],
        "suggested_kpis": [
            { "name": "KPI Name", "target": "Target value", "rationale": "Why this matters" }
        ],
        "roadmap": {
            "phase_1_launch": ["Step 1", "Step 2"],
            "phase_2_growth": ["Step 1", "Step 2"]
        }
      }
    `;

        try {
            const result = await this.model.generateContent({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig: {
                    responseMimeType: "application/json"
                }
            });
            const text = result.response.text();
            try {
                return JSON.parse(text);
            } catch {
                // Fallback if JSON parsing fails (though responseMimeType should prevent this)
                return { executive_summary: text, key_findings: [] };
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
