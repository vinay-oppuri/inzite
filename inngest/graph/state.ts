export interface AgentState {
    user_input: string;
    intent?: any;
    plan?: any;
    agent_outputs?: any[];
    retrieved_docs?: any[];
    reranked_docs?: any[];
    summary?: string;
    final_report?: string;
    strategy?: any;
    agent_groups?: Record<string, any>;
    raw_docs_count?: number;
    markdown_path?: string;
    report_id?: string;
}
