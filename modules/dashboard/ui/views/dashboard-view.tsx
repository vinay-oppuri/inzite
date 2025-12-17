'use client';

import { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Brain,
  BarChart3,
  Compass,
  Lightbulb,
  Info,
  Loader2,
  Bot,
  Copy,
  Download,
  Search,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';

interface Report {
  id: number;
  idea: string;
  result_json: any;
  report_md: string;
  created_at: string;
}

export default function DashboardView() {
  const [idea, setIdea] = useState('');
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);

  // ✅ Run pipeline and show the generated report
  const runPipeline = async () => {
    if (!idea.trim()) return alert('Enter your startup idea first!');
    setLoading(true);
    try {
      // Step 0: Get current latest report ID to check for new ones
      let currentLatestId = 0;
      try {
        const latestRes = await axios.get('/api/get-latest-report');
        if (latestRes.data) currentLatestId = latestRes.data.id;
      } catch (e) {
        // No reports yet
      }

      // Step 1: Trigger Inngest Workflow
      await axios.post('/api/start-research', { query: idea });

      // Step 2: Poll for results
      let attempts = 0;
      const maxAttempts = 40; // 2 minutes (3s interval)

      const poll = setInterval(async () => {
        attempts++;
        try {
          const res = await axios.get('/api/get-latest-report');
          // Check if we got a new report (ID > current or just a report if we didn't have one)
          if (res.data && (res.data.id > currentLatestId || !currentLatestId)) {
            clearInterval(poll);
            setReport(res.data);
            setLoading(false);
            alert('✅ Report generated successfully!');
          }
        } catch (e) {
          console.error("Polling error", e);
        }

        if (attempts >= maxAttempts) {
          clearInterval(poll);
          setLoading(false);
          alert('Research is taking longer than expected. Please check "Saved Reports" later.');
        }
      }, 3000);

    } catch (err) {
      console.error('Pipeline error:', err);
      alert('❌ Failed to start research.');
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!report) return;
    navigator.clipboard.writeText(JSON.stringify(report.result_json, null, 2));
    toast.success('Report copied to clipboard!');
  };

  const handleDownload = () => {
    if (!report) return;
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

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-gray-400 text-lg">
        <Loader2 className="animate-spin w-6 h-6 mr-2 text-purple-400" />
        Generating Startup Report...
      </div>
    );

  if (!report)
    return (
      <div className="flex-1 p-4 sm:p-6 md:px-10 md:py-6 text-foreground space-y-6">
        <Card className="bg-card/50 backdrop-blur-md border-border rounded-xl shadow-xl overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl sm:text-3xl font-bold text-primary flex items-center gap-3">
              <Brain className="w-6 h-6 sm:w-8 sm:h-8" />
              Generate New Report
            </CardTitle>
            <CardDescription className="text-muted-foreground text-lg">
              Enter your startup idea below to launch our autonomous research agents.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/30 p-6 rounded-lg border border-border/50">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary" /> What happens next?
              </h3>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                <div className="flex items-start gap-3">
                  <div className="bg-chart-1/10 p-2 rounded-md text-chart-1">
                    <Search className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">Market Research</p>
                    <p className="text-xs text-muted-foreground">Agents analyze market size & trends.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-chart-2/10 p-2 rounded-md text-chart-2">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">Competitor Intel</p>
                    <p className="text-xs text-muted-foreground">We scout top competitors & gaps.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-chart-4/10 p-2 rounded-md text-chart-4">
                    <Lightbulb className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">Strategic Plan</p>
                    <p className="text-xs text-muted-foreground">Get a roadmap & actionable advice.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-sm font-medium text-foreground ml-1">
                Describe your startup idea
              </label>
              <div className="flex flex-col md:flex-row gap-3">
                <Input
                  placeholder="E.g., A subscription service for organic dog food in Europe..."
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  className="bg-background border-border text-foreground flex-1 h-12 text-lg shadow-inner"
                />
                <Button
                  onClick={runPipeline}
                  disabled={loading}
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 h-12 font-bold shadow-lg hover:shadow-primary/25 transition-all w-full md:w-auto"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Start Research
                </Button>
              </div>
              <p className="text-xs text-muted-foreground ml-1">
                <Info className="w-3 h-3 inline mr-1" />
                Tip: Be specific about your product and target market for better results.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );

  // ✅ Render the latest generated report in full detail
  const data = report.result_json;
  const { strategy, agent_groups, raw_docs_count, markdown_path } = data;

  return (
    <div className="flex-1 p-6 sm:px-10 sm:py-6 text-foreground space-y-6">
      <Card className="bg-card/50 backdrop-blur-md border-border rounded-xl shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-primary">
            {report.idea}
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            Generated on: {new Date(report.created_at).toLocaleString()}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Button
              onClick={handleCopy}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 w-full sm:w-auto"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Report
            </Button>
            <Button
              variant="outline"
              onClick={handleDownload}
              className="border-primary text-primary hover:bg-primary/10 w-full sm:w-auto"
            >
              <Download className="w-4 h-4 mr-2" />
              Download JSON
            </Button>
          </div>

          <Accordion type="multiple" className="text-foreground space-y-3">
            {/* EXECUTIVE SUMMARY */}
            <AccordionItem value="executive-summary" className="border border-border rounded-lg bg-card/30 px-4">
              <AccordionTrigger className="text-xl sm:text-2xl font-bold hover:text-primary">
                <div className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-primary" /> Executive Summary
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-4">
                <p className="text-foreground leading-relaxed whitespace-pre-wrap pl-4 border-l-4 border-primary">
                  {strategy.executive_summary}
                </p>
              </AccordionContent>
            </AccordionItem>

            {/* KEY FINDINGS */}
            <AccordionItem value="key-findings" className="border border-border rounded-lg bg-card/30 px-4">
              <AccordionTrigger className="text-xl sm:text-2xl font-bold hover:text-primary">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-chart-3" /> Key Findings
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-4">
                <ul className="space-y-2 pl-4">
                  {strategy.key_findings.map((f: string, i: number) => (
                    <li key={i} className="flex gap-2 items-start">
                      <CheckCircle className="w-5 h-5 text-chart-2" />
                      <span className="text-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>

            {/* MARKET OPPORTUNITIES */}
            <AccordionItem value="market-opportunities" className="border border-border rounded-lg bg-card/30 px-4">
              <AccordionTrigger className="text-xl sm:text-2xl font-bold hover:text-primary">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-chart-1" /> Market Opportunities
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-4">
                <ul className="space-y-4">
                  {strategy.market_opportunities.map((op: any, idx: number) => (
                    <li
                      key={idx}
                      className="border-l-4 border-primary pl-4 bg-muted/30 rounded-lg p-3"
                    >
                      <p className="font-semibold text-lg text-foreground flex items-center gap-2">
                        <Compass className="w-5 h-5 text-primary" /> {op.opportunity}
                      </p>
                      <p className="text-sm text-muted-foreground mb-2">
                        Impact: <span className="text-primary">{op.impact}</span>
                      </p>
                      <ul className="list-disc list-inside text-muted-foreground ml-2 space-y-1">
                        {op.evidence.map((e: string, i: number) => (
                          <li key={i}>{e}</li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>

            {/* RISKS */}
            <AccordionItem value="risks" className="border border-border rounded-lg bg-card/30 px-4">
              <AccordionTrigger className="text-xl sm:text-2xl font-bold hover:text-primary">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" /> Risks & Challenges
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-4">
                <ul className="space-y-2 pl-4">
                  {strategy.risks_and_challenges.map((r: string, i: number) => (
                    <li key={i} className="flex gap-2 items-start">
                      <AlertTriangle className="w-5 h-5 text-destructive" />
                      <span className="text-foreground">{r}</span>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>

            {/* RECOMMENDATIONS */}
            <AccordionItem value="recommendations" className="border border-border rounded-lg bg-card/30 px-4">
              <AccordionTrigger className="text-xl sm:text-2xl font-bold hover:text-primary">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-chart-4" /> Strategic Recommendations
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-4">
                {strategy.strategic_recommendations.map((rec: any, i: number) => (
                  <div
                    key={i}
                    className="border-l-4 border-chart-2 pl-4 bg-muted/30 p-3 rounded-lg mb-3"
                  >
                    <p className="font-semibold text-foreground flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-chart-2" /> {rec.area}
                    </p>
                    <p className="text-foreground text-sm mt-1">{rec.action}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Priority: <span className="text-chart-2">{rec.priority}</span> | Owner:{' '}
                      <span className="text-chart-1">{rec.owner}</span>
                    </p>
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>

            {/* KPIs */}
            <AccordionItem value="kpis" className="border border-border rounded-lg bg-card/30 px-4">
              <AccordionTrigger className="text-xl sm:text-2xl font-bold hover:text-primary">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" /> Suggested KPIs
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-4">
                <ul className="space-y-3 pl-2">
                  {strategy.suggested_kpis.map((kpi: any, idx: number) => (
                    <li
                      key={idx}
                      className="bg-muted/30 p-3 rounded-lg border border-border"
                    >
                      <p className="font-semibold text-primary flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-primary" /> {kpi.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        🎯 Target: {kpi.target}
                      </p>
                      <p className="text-foreground text-sm">{kpi.rationale}</p>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>

            {/* ROADMAP */}
            <AccordionItem value="roadmap" className="border border-border rounded-lg bg-card/30 px-4">
              <AccordionTrigger className="text-xl sm:text-2xl font-bold hover:text-primary">
                <div className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-primary" /> Implementation Roadmap
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-4">
                {Object.entries(strategy.roadmap).map(([phase, steps]: [string, any]) => (
                  <div key={phase} className="mb-5">
                    <h3 className="text-xl font-bold text-primary mb-2 capitalize flex items-center gap-2">
                      <Compass className="w-5 h-5 text-primary" /> {phase.replace('_', ' ')}
                    </h3>
                    <ul className="space-y-1 ml-3">
                      {steps.map((s: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-chart-2 mt-[3px]" />
                          <span className="text-foreground">{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>

            {/* AGENT INSIGHTS */}
            <AccordionItem value="agent-insights" className="border border-border rounded-lg bg-card/30 px-4">
              <AccordionTrigger className="text-xl sm:text-2xl font-bold hover:text-primary">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-chart-5" /> Detailed Agent Insights
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-4">
                {Object.entries(agent_groups).map(([agent, content]: [string, any], idx) => (
                  <div key={idx} className="mb-10">
                    <h3 className="text-2xl font-semibold text-chart-1 mb-3 flex items-center gap-2">
                      <Bot className="w-5 h-5 text-chart-1" /> {agent}
                    </h3>

                    {Array.isArray(content) &&
                      content.map((section: any, i: number) => (
                        <div
                          key={i}
                          className="border-l-4 border-border pl-4 mb-3"
                        >
                          {typeof section === 'string' ? (
                            <div className="prose prose-invert max-w-none bg-muted/10 p-6 rounded-lg leading-relaxed text-muted-foreground">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  h1: ({ node, ...props }) => (
                                    <h1 className="text-3xl font-extrabold text-primary mb-3 mt-4" {...props} />
                                  ),
                                  h2: ({ node, ...props }) => (
                                    <h2 className="text-2xl font-bold text-primary mb-2 mt-3" {...props} />
                                  ),
                                  p: ({ node, ...props }) => (
                                    <p className="text-muted-foreground text-base mb-3" {...props} />
                                  ),
                                  li: ({ node, ...props }) => (
                                    <li className="text-muted-foreground text-base leading-relaxed" {...props} />
                                  ),
                                }}
                              >
                                {section}
                              </ReactMarkdown>
                            </div>
                          ) : null}
                        </div>
                      ))}
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Footer */}
          <div className="text-muted-foreground text-sm mt-10 border-t border-border pt-3">
            Raw Docs Indexed: {raw_docs_count} | Markdown Path: {markdown_path}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}