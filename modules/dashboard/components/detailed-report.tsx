import {
    Brain,
    Bot,
    Copy,
    Download,
    Info,
    CheckCircle,
    AlertTriangle,
    Compass,
    BarChart3,
    TrendingUp,
    Lightbulb,
} from 'lucide-react';
import { motion } from "motion/react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { JsonRenderer } from './json-renderer';

export interface Report {
    id: number;
    idea: string;
    result_json: any;
    report_md: string;
    created_at: string;
}

interface DetailedReportProps {
    report: Report;
}

export const DetailedReport = ({ report }: DetailedReportProps) => {
    const handleCopy = () => {
        navigator.clipboard.writeText(JSON.stringify(report.result_json, null, 2));
        toast.success('Report copied to clipboard!');
    };

    const handleDownload = () => {
        const blob = new Blob([JSON.stringify(report.result_json, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report-${report.id}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Report downloaded!');
    };

    const data = report.result_json;
    const { strategy, agent_groups, raw_docs_count } = data;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-1 p-0 sm:px-10 sm:py-8 text-foreground space-y-8 max-w-7xl mx-auto w-full"
        >
            <Card className="glass-card rounded-3xl border-border/50 shadow-2xl overflow-hidden pt-8">
                <CardHeader className="border-b border-border/50 bg-secondary/10 pb-8 px-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <CardTitle className="text-2xl md:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-linear-to-r from-primary to-purple-500 mb-2">
                                {report.idea}
                            </CardTitle>
                            <CardDescription className="text-muted-foreground text-xs md:text-base flex items-center gap-2">
                                <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                Generated on: {new Date(report.created_at).toLocaleString()}
                            </CardDescription>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                onClick={handleCopy}
                                className="text-xs md:text-base bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 hover:border-primary/40 shadow-none backdrop-blur-sm transition-all"
                            >
                                <Copy className="w-4 h-4 mr-1 md:mr-2" />
                                Copy
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleDownload}
                                className="text-xs md:text-base bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 hover:border-primary/40 shadow-none backdrop-blur-sm transition-all"
                            >
                                <Download className="w-4 h-4 mr-1 md:mr-2" />
                                JSON
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="px-4 md:px-8 pb-4">
                    <Accordion type="multiple" className="text-foreground space-y-4">
                        {/* EXECUTIVE SUMMARY */}
                        <AccordionItem value="executive-summary" className="border border-border/60 rounded-xl bg-card/40 px-4 md:px-6 data-[state=open]:bg-card/60 transition-all duration-300 hover:border-primary/30">
                            <AccordionTrigger className="text-lg md:text-xl font-bold hover:text-primary hover:no-underline py-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-chart-1/10 rounded-lg text-chart-1">
                                        <Info className="w-4 h-4 md:w-6 md:h-6" />
                                    </div>
                                    Executive Summary
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-2 pb-6">
                                <div className="text-foreground leading-relaxed whitespace-pre-wrap pl-6 border-l-4 border-chart-1/50 text-xs md:text-lg">
                                    {strategy.executive_summary}
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        {/* KEY FINDINGS */}
                        <AccordionItem value="key-findings" className="border border-border/60 rounded-xl bg-card/40 px-4 data-[state=open]:bg-card/60 transition-all duration-300 hover:border-primary/30">
                            <AccordionTrigger className="text-lg md:text-xl font-bold hover:text-primary hover:no-underline py-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-chart-3/10 rounded-lg text-chart-3">
                                        <Lightbulb className="w-4 h-4 md:w-6 md:h-6" />
                                    </div>
                                    Key Findings
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-2 pb-6">
                                <ul className="space-y-4 pl-2">
                                    {strategy.key_findings.map((f: string, i: number) => (
                                        <li key={i} className="flex gap-3 items-start p-3 rounded-lg bg-background/50 border border-border/30 text-xs md:text-lg">
                                            <CheckCircle className="w-4 h-4 text-chart-3 mt-0.5 shrink-0" />
                                            <span className="text-foreground">{f}</span>
                                        </li>
                                    ))}
                                </ul>
                            </AccordionContent>
                        </AccordionItem>

                        {/* MARKET OPPORTUNITIES */}
                        <AccordionItem value="market-opportunities" className="border border-border/60 rounded-xl bg-card/40 px-4 data-[state=open]:bg-card/60 transition-all duration-300 hover:border-primary/30">
                            <AccordionTrigger className="text-lg md:text-xl font-bold hover:text-primary hover:no-underline py-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-chart-2/10 rounded-lg text-chart-2">
                                        <TrendingUp className="w-4 h-4 md:w-6 md:h-6" />
                                    </div>
                                    Market Opportunities
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-2 pb-6">
                                <ul className="space-y-6">
                                    {strategy.market_opportunities.map((op: any, idx: number) => (
                                        <li
                                            key={idx}
                                            className="border border-border/50 bg-background/50 rounded-xl p-5 hover:border-chart-2/30 transition-colors text-xs md:text-lg"
                                        >
                                            <p className="font-bold text-sm md:text-xl text-foreground flex items-center gap-2 mb-2">
                                                <Compass className="w-5 h-5 text-chart-2" /> {op.opportunity}
                                            </p>
                                            <p className="text-xs md:text-sm text-muted-foreground mb-4 bg-muted/30 w-fit px-2 py-1 rounded">
                                                Impact: <span className="text-chart-2 font-medium">{op.impact}</span>
                                            </p>
                                            <ul className="grid gap-2 text-muted-foreground pl-2">
                                                {op.evidence.map((e: string, i: number) => (
                                                    <li key={i} className="flex gap-2 items-start text-xs md:text-sm">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-chart-2 mt-2 shrink-0" />
                                                        {e}
                                                    </li>
                                                ))}
                                            </ul>
                                        </li>
                                    ))}
                                </ul>
                            </AccordionContent>
                        </AccordionItem>

                        {/* RISKS */}
                        <AccordionItem value="risks" className="border border-border/60 rounded-xl bg-card/40 px-4 data-[state=open]:bg-card/60 transition-all duration-300 hover:border-primary/30">
                            <AccordionTrigger className="text-lg md:text-xl font-bold hover:text-primary hover:no-underline py-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-destructive/10 rounded-lg text-destructive">
                                        <AlertTriangle className="w-4 h-4 md:w-6 md:h-6" />
                                    </div>
                                    Risks & Challenges
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-2 pb-6">
                                <ul className="space-y-3 pl-2">
                                    {strategy.risks_and_challenges.map((r: string, i: number) => (
                                        <li key={i} className="flex gap-3 items-start p-3 bg-destructive/5 rounded-lg border border-destructive/10 text-xs md:text-lg">
                                            <AlertTriangle className="w-4 h-4 md:w-6 md:h-6 text-destructive mt-0.5 shrink-0" />
                                            <span className="text-foreground">{r}</span>
                                        </li>
                                    ))}
                                </ul>
                            </AccordionContent>
                        </AccordionItem>

                        {/* RECOMMENDATIONS */}
                        <AccordionItem value="recommendations" className="border border-border/60 rounded-xl bg-card/40 px-4 data-[state=open]:bg-card/60 transition-all duration-300 hover:border-primary/30">
                            <AccordionTrigger className="text-lg md:text-xl font-bold hover:text-primary hover:no-underline py-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-chart-4/10 rounded-lg text-chart-4">
                                        <Brain className="w-4 h-4 md:w-6 md:h-6" />
                                    </div>
                                    Strategic Recommendations
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-2 pb-6">
                                <div className="space-y-4">
                                    {strategy.strategic_recommendations.map((rec: any, i: number) => (
                                        <div
                                            key={i}
                                            className="border-l-4 border-l-chart-4 pl-6 bg-background/50 p-5 rounded-r-xl border-y border-r border-border/30 hover:border-chart-4/30 transition-all text-xs md:text-lg"
                                        >
                                            <p className="font-bold text-sm md:text-lg text-foreground flex items-center gap-2 mb-2">
                                                <CheckCircle className="w-3 h-3 md:w-5 md:h-5 text-chart-4" /> {rec.area}
                                            </p>
                                            <p className="text-foreground text-xs md:text-base mt-2 leading-relaxed">{rec.action}</p>
                                            <div className="flex gap-4 mt-4 text-xs md:text-sm">
                                                <span className="px-2 py-1 rounded bg-chart-4/10 text-chart-4 font-medium">Priority: {rec.priority}</span>
                                                <span className="px-2 py-1 rounded bg-muted text-muted-foreground">Owner: {rec.owner}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        {/* KPIs */}
                        <AccordionItem value="kpis" className="border border-border/60 rounded-xl bg-card/40 px-4 data-[state=open]:bg-card/60 transition-all duration-300 hover:border-primary/30">
                            <AccordionTrigger className="text-lg md:text-xl font-bold hover:text-primary hover:no-underline py-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-chart-2/10 rounded-lg text-chart-2">
                                        <BarChart3 className="w-4 h-4 md:w-6 md:h-6" />
                                    </div>
                                    Suggested KPIs
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-2 pb-6">
                                <ul className="grid gap-4 sm:grid-cols-2">
                                    {strategy.suggested_kpis.map((kpi: any, idx: number) => (
                                        <li
                                            key={idx}
                                            className="bg-background/50 p-5 rounded-xl border border-border/50 hover:border-chart-2/30 transition-colors text-xs md:text-lg"
                                        >
                                            <p className="font-bold text-chart-2 flex items-center gap-2 mb-2 text-sm md:text-lg">
                                                <BarChart3 className="w-5 h-5" /> {kpi.name}
                                            </p>
                                            <p className="font-medium text-foreground bg-muted/30 w-fit px-2 py-0.5 rounded mb-2 text-xs md:text-base">
                                                🎯 Target: {kpi.target}
                                            </p>
                                            <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">{kpi.rationale}</p>
                                        </li>
                                    ))}
                                </ul>
                            </AccordionContent>
                        </AccordionItem>

                        {/* ROADMAP */}
                        <AccordionItem value="roadmap" className="border border-border/60 rounded-xl bg-card/40 px-4 data-[state=open]:bg-card/60 transition-all duration-300 hover:border-primary/30">
                            <AccordionTrigger className="text-lg md:text-xl font-bold hover:text-primary hover:no-underline py-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-chart-3/10 rounded-lg text-chart-3">
                                        <Compass className="w-4 h-4 md:w-6 md:h-6" />
                                    </div>
                                    Implementation Roadmap
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-2 pb-6">
                                <div className="relative border-l-2 border-border ml-3 space-y-8 pl-8 py-2">
                                    {Object.entries(strategy.roadmap).map(([phase, steps]: [string, any], pIdx) => (
                                        <div key={phase} className="relative">
                                            <div className="absolute -left-[41px] top-0 w-6 h-6 rounded-full bg-chart-3 border-4 border-background shadow-lg z-10" />
                                            <h3 className="text-lg md:text-xl font-bold text-foreground mb-4 capitalize flex items-center gap-2">
                                                {phase.replace('_', ' ')}
                                            </h3>
                                            <ul className="space-y-3">
                                                {steps.map((s: string, idx: number) => (
                                                    <li key={idx} className="flex items-start gap-3 bg-muted/20 p-3 rounded-lg text-xs md:text-lg">
                                                        <CheckCircle className="w-4 h-4 text-chart-3 mt-1 shrink-0" />
                                                        <span className="text-foreground">{s}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        {/* AGENT INSIGHTS */}
                        <AccordionItem value="agent-insights" className="border border-border/60 rounded-xl bg-card/40 px-4 data-[state=open]:bg-card/60 transition-all duration-300 hover:border-primary/30">
                            <AccordionTrigger className="text-lg md:text-xl font-bold hover:text-primary hover:no-underline py-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                        <Bot className="w-4 h-4 md:w-6 md:h-6" />
                                    </div>
                                    Detailed Agent Insights
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-2 pb-6">
                                <div className="space-y-8">
                                    {Object.entries(agent_groups).map(([agent, content]: [string, any], idx) => (
                                        <div key={idx} className="bg-background/40 rounded-2xl p-6 border border-border/50 text-xs md:text-lg">
                                            <h3 className="text-xl font-bold text-primary mb-6 flex items-center gap-3 border-b border-border/50 pb-4">
                                                <Bot className="w-5 h-5 text-primary" /> {agent}
                                            </h3>

                                            <div className="prose prose-invert max-w-none text-muted-foreground prose-headings:text-foreground prose-strong:text-foreground">
                                                <JsonRenderer data={content} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>

                    {/* Footer */}
                    <div className="text-muted-foreground text-xs mt-10 border-t border-border/50 pt-6 flex justify-between items-center opacity-70">
                        <span>Raw Docs Indexed: {raw_docs_count}</span>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};
