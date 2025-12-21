'use client';

import { Card, CardContent } from '@/components/ui/card';
import { ArrowDown, Bot, Network, FileText, Layers, BookText, Brain, MessageSquare, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const pipelineStages = [
  {
    id: 1,
    title: 'Intent Parser',
    icon: Brain,
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
    description:
      'Understands your startup idea and extracts its core intent — what the project is about, key goals, and problem statement.',
  },
  {
    id: 2,
    title: 'Dynamic Task Planner',
    icon: Layers,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    description:
      'Breaks the intent into a set of executable research tasks. It decides which agents (TrendScraper, CompetitorScout, etc.) need to work.',
  },
  {
    id: 3,
    title: 'Multi-Agent Orchestrator',
    icon: Network,
    color: 'text-indigo-400',
    bg: 'bg-indigo-400/10',
    description:
      'Assigns tasks to intelligent agents lie TrendScraper or CompetitorScout. Each agent gathers and summarizes information independently.',
  },
  {
    id: 4,
    title: 'RAG Indexer',
    icon: BookText,
    color: 'text-teal-400',
    bg: 'bg-teal-400/10',
    description:
      'Builds a vector database from all collected documents and summaries using embeddings. Enables contextual knowledge retrieval for future stages.',
  },
  {
    id: 5,
    title: 'Strategy Engine',
    icon: Bot,
    color: 'text-pink-400',
    bg: 'bg-pink-400/10',
    description:
      'Synthesizes findings from the agents and RAG to generate strategic insights and business recommendations.',
  },
  {
    id: 6,
    title: 'Report Builder',
    icon: FileText,
    color: 'text-orange-400',
    bg: 'bg-orange-400/10',
    description:
      'Creates structured reports — JSON for your dashboard and Markdown for detailed insights. Saves results to /data/memory_store/.',
  },
  {
    id: 7,
    title: 'Strategic Knowledge Indexer',
    icon: Sparkles,
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    description:
      'Indexes key strategy reports and agent outputs for reuse in future queries, improving intelligence over time.',
  },
  {
    id: 8,
    title: 'Chatbot Interface',
    icon: MessageSquare,
    color: 'text-green-400',
    bg: 'bg-green-400/10',
    description:
      'A context-aware chatbot that can answer user questions based on indexed knowledge — powered by RAG retrieval.',
  },
];

export default function WorkflowPipelinePage() {
  return (
    <div className="flex-1 p-6 sm:px-10 sm:py-8 text-foreground space-y-10 max-w-7xl mx-auto w-full">
      <div className="text-center space-y-4 mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-primary via-purple-500 to-pink-500">
          Agentic Research Workflow
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Visualizing the autonomous multi-agent pipeline that transforms your idea into a data-driven strategy.
        </p>
      </div>

      <div className="relative">
        <div className="absolute left-1/2 top-4 bottom-4 w-0.5 bg-linear-to-b from-primary/50 via-purple-500/50 to-transparent -translate-x-1/2 hidden md:block" />

        <div className="space-y-8 relative">
          {pipelineStages.map((stage, index) => {
            const isEven = index % 2 === 0;
            return (
              <div key={stage.id} className={cn("flex flex-col md:flex-row items-center gap-8 relative",
                isEven ? "md:flex-row-reverse" : ""
              )}>
                {/* Connector Dot */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-background border-4 border-primary z-10 hidden md:block shadow-lg shadow-primary/50" />

                {/* Empty Half */}
                <div className="flex-1 hidden md:block" />

                {/* Card Half */}
                <div className="flex-1 w-full">
                  <Card className="group glass-card border-border/50 hover:border-primary/50 transition-all duration-500 hover:-translate-y-1 overflow-hidden">
                    <CardContent className="p-6 flex items-start gap-4">
                      <div className={cn("p-3 rounded-xl shrink-0 transition-colors duration-300 group-hover:bg-opacity-20", stage.bg)}>
                        <stage.icon className={cn("w-6 h-6", stage.color)} />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground", stage.bg.replace('/10', '/30'), stage.color)}>
                            Step {stage.id}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                          {stage.title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed text-sm">
                          {stage.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-center p-6 rounded-2xl bg-secondary/20 border border-border/50 mt-12 backdrop-blur-sm">
        <p className="text-muted-foreground font-medium flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          Powered by Gemini API with distributed key management for scalable intelligence.
        </p>
      </div>
    </div>
  );
}
