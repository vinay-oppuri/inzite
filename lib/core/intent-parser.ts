import { LLMClient } from "../llm-client";

export interface IntentMetadata {
    industry: string;
    target_audience: string;
    problem_statement: string;
    intent_type: string;
    complexity_level: string;
    agent_triggers: string[];
    business_model?: string;
    tech_keywords?: string[];
    competitor_names?: string[];
    solution_summary?: string;
    data_needs?: string[];
    raw_query?: string;
}

export class IntentParser {
    private static DOMAINS = [
        "health", "education", "finance", "travel", "food",
        "fitness", "pet", "real estate", "transportation",
        "ai", "mental health", "agriculture", "gaming",
        "retail", "sustainability"
    ];

    private static TECH_TERMS = [
        "ai", "machine learning", "blockchain", "nlp", "data analytics",
        "ar", "vr", "iot", "chatbot", "llm", "neural network"
    ];

    private static INTENT_PATTERNS: Record<string, RegExp> = {
        "compare": /(compare|vs|difference|better than)/i,
        "trend": /(trend|market|growth|statistics)/i,
        "tech": /(technology|innovation|research|paper)/i,
        "idea": /(idea|startup|launch|build)/i
    };

    private useLlm: boolean;
    private client: LLMClient | null = null;

    constructor(useLlm: boolean = true) {
        this.useLlm = useLlm;

        if (this.useLlm) {
            this.client = new LLMClient();
        }
    }

    async parse(userInput: string): Promise<IntentMetadata> {
        console.log(`🔍 Parsing intent: ${userInput}`);

        if (this.useLlm && this.client) {
            try {
                return await this._parseWithLlm(userInput);
            } catch (e) {
                console.warn(`⚠️ LLM parsing failed (${e}), falling back to regex rules.`);
            }
        }

        return this._parseWithRules(userInput);
    }

    private async _parseWithLlm(query: string): Promise<IntentMetadata> {
        const prompt = `
        You are an expert intent parser for a startup research assistant.
        Analyze the following user query and extract structured intent.
        
        USER QUERY: "${query}"
        
        Return a JSON object with the following schema:
        {
            "industry": "string (e.g., AI, SaaS, E-commerce)",
            "target_audience": "string",
            "problem_statement": "string",
            "intent_type": "string (one of: market_research, competitor_analysis, trend_analysis, technical_research)",
            "complexity_level": "string (low, medium, high)",
            "agent_triggers": ["list of agents to trigger (competitor_scout, trend_scraper, tech_paper_miner)"]
        }
        `;

        if (!this.client) throw new Error("Client not initialized");

        try {
            const result = await this.client.generate(prompt, { json: true, temperature: 0.1 });
            const text = result.text;
            const parsed = this._safeExtractJson(text);
            parsed.raw_query = query;

            console.log("✅ LLM intent parsed successfully.");
            return parsed;
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.warn("⚠️ IntentParser: LLM parsing failed. Using fallback parsing.", errorMessage);
            return this._parseWithRules(query);
        }
    }

    private _parseWithRules(text: string): IntentMetadata {
        console.log("🧩 Using rule-based parser");

        const textLower = text.toLowerCase();

        // Extract fields using heuristics
        const industry = IntentParser.DOMAINS.find(d => textLower.includes(d)) || "general";
        const tech = IntentParser.TECH_TERMS.filter(t => textLower.includes(t.toLowerCase()));

        let intentType = "idea";
        for (const [name, pattern] of Object.entries(IntentParser.INTENT_PATTERNS)) {
            if (pattern.test(textLower)) {
                intentType = name;
                break;
            }
        }

        // Naive competitor extraction (Capitalized words)
        const competitorRegex = /[A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)?/g;
        const matches = text.match(competitorRegex) || [];
        const competitors = matches.filter(c => c.length > 3);

        const parsed: IntentMetadata = {
            industry,
            business_model: this._inferBusinessModel(textLower),
            target_audience: this._inferAudience(textLower),
            tech_keywords: tech,
            competitor_names: competitors,
            intent_type: intentType,
            problem_statement: text,
            solution_summary: "",
            data_needs: [],
            agent_triggers: ["trend_scraper", "competitor_scout", "tech_paper_miner"],
            complexity_level: "medium",
            raw_query: text
        };

        console.log("✅ Rule-based intent parsed.");
        return parsed;
    }

    private _inferBusinessModel(text: string): string {
        if (text.includes("platform")) return "Platform";
        if (text.includes("app")) return "Mobile App";
        if (text.includes("service")) return "Service";
        if (text.includes("tool") || text.includes("software")) return "SaaS";
        if (text.includes("marketplace")) return "Marketplace";
        return "General";
    }

    private _inferAudience(text: string): string {
        if (text.includes("student")) return "Students";
        if (text.includes("developer") || text.includes("engineer")) return "Developers";
        if (text.includes("business") || text.includes("startup")) return "Businesses";
        if (text.includes("doctor") || text.includes("patient")) return "Healthcare Users";
        return "General Audience";
    }

    private _safeExtractJson(text: string | null | undefined): IntentMetadata {
        if (!text) return this._getEmptyMetadata();

        const match = text.match(/\{[\s\S]*\}/);
        if (match) {
            try {
                return JSON.parse(match[0]);
            } catch {
                // ignore
            }
        }

        return this._getEmptyMetadata();
    }

    private _getEmptyMetadata(): IntentMetadata {
        return {
            industry: "unknown",
            target_audience: "unknown",
            problem_statement: "unknown",
            intent_type: "idea",
            complexity_level: "low",
            agent_triggers: []
        };
    }
}
