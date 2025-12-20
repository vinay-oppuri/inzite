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

// Recursive renderer for complex agent outputs
const JsonRenderer = ({ data }: { data: any }) => {
  if (!data) return null;

  if (typeof data === 'string') {
    // Check if it looks like Markdown or just simple text
    if (data.length > 50 || data.includes('#') || data.includes('*')) {
      return (
        <div className="mb-4 bg-muted/10 p-4 rounded-lg prose prose-invert text-sm max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {data}
          </ReactMarkdown>
        </div>
      );
    }
    return <p className="text-foreground mb-2 text-base leading-relaxed">{data}</p>;
  }

  if (Array.isArray(data)) {
    return (
      <ul className="list-none space-y-2 mb-4 pl-0">
        {data.map((item, index) => (
          <li key={index} className="pl-4 border-l-2 border-primary/30">
            <JsonRenderer data={item} />
          </li>
        ))}
      </ul>
    );
  }

  if (typeof data === 'object') {
    return (
      <div className="grid gap-4 mb-4">
        {Object.entries(data).map(([key, value], index) => {
          // Skip internal or empty keys
          if (!value || key === 'id') return null;

          return (
            <div key={index} className="bg-card/20 rounded-lg p-3 border border-border/30">
              <h4 className="font-semibold text-primary mb-2 capitalize text-sm tracking-wide">
                {key.replace(/_/g, ' ')}
              </h4>
              <div className="pl-2">
                <JsonRenderer data={value} />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return <span className="text-muted-foreground">{String(data)}</span>;
};

export default function DashboardView() {
  const [idea, setIdea] = useState('');
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>("Initializing...");

  // ✅ Run pipeline and show the generated report
  const runPipeline = async () => {
    if (!idea.trim()) return alert('Enter your startup idea first!');
    setLoading(true);
    setCurrentStep("Initializing Research Workflow...");

    try {
      // Step 1: Trigger Inngest Workflow and get Session ID
      const startRes = await axios.post('/api/start-research', { query: idea });
      const sessionId = startRes.data.sessionId;

      if (!sessionId) {
        throw new Error("No session ID returned");
      }

      // Step 2: Poll for status
      let attempts = 0;
      const maxAttempts = 100; // Increased timeout for long workflow (10s delays)

      const poll = setInterval(async () => {
        attempts++;
        try {
          const statusRes = await axios.get(`/api/get-session-status?sessionId=${sessionId}`);
          console.log("Status Polling:", statusRes.data);

          if (statusRes.data) {
            const { status, currentStep, resultId } = statusRes.data;
            setCurrentStep(currentStep || "Processing...");

            if (status === 'completed' && resultId) {
              // Fetch the actual report
              // Wait a brief moment to ensure report is fully committed if needed
              setTimeout(async () => {
                const reportRes = await axios.get('/api/get-latest-report'); // Or fetch by ID if API supported it
                //Ideally we'd fetch by resultId, but get-latest-report works for single user flow usually.
                // A safer way would be to update get-latest-report to accept an ID or create a get-report API.
                // For now, let's assume get-latest-report gets the one we just made.

                if (reportRes.data) {
                  setReport(reportRes.data);
                  setLoading(false);
                  clearInterval(poll);
                  alert('✅ Report generated successfully!');
                }
              }, 1000);
              return;
            }

            if (status === 'failed') {
              clearInterval(poll);
              setLoading(false);
              alert('❌ Research failed. Please try again.');
              return;
            }
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
      <div className="flex flex-col justify-center items-center min-h-screen text-foreground space-y-8 bg-background/95 backdrop-blur-sm z-50 p-6">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
          <Loader2 className="animate-spin w-16 h-16 text-primary relative z-10" />
        </div>

        <div className="text-center space-y-2 mb-8">
          <h3 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent animate-pulse">
            Building Your Strategic Report
          </h3>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Our autonomous agents are scouring the web, analyzing competitors, and formulating a winning strategy for you.
          </p>
        </div>

        {/* Visual Stepper */}
        <div className="w-full max-w-2xl bg-card/40 border border-border rounded-xl p-8 backdrop-blur-md shadow-2xl">
          <h4 className="text-xl font-semibold mb-6 flex items-center gap-2 text-primary">
            <Zap className="w-5 h-5 text-yellow-500" /> Live Progress
          </h4>

          <div className="space-y-6">
            {[
              { id: 'init', label: 'Initiation & Intent', match: ['Initializing', 'Analyzing Intent'] },
              { id: 'plan', label: 'Strategic Planning', match: ['Planning Research Agents'] },
              { id: 'research', label: 'Deep Research (Agents)', match: ['Running Autonomous Agents'] },
              { id: 'process', label: 'Data Processing & Analysis', match: ['Ingesting', 'Retrieving', 'Reranking', 'Summarizing'] },
              { id: 'report', label: 'Strategy Formulation', match: ['Formulating', 'Finalizing'] }
            ].map((step, idx) => {
              const isCompleted = step.match.some(m => currentStep.includes(m)) ? false :
                idx < [
                  { id: 'init', match: ['Initializing', 'Analyzing Intent'] },
                  { id: 'plan', match: ['Planning Research Agents'] },
                  { id: 'research', match: ['Running Autonomous Agents'] },
                  { id: 'process', match: ['Ingesting', 'Retrieving', 'Reranking', 'Summarizing'] },
                  { id: 'report', match: ['Formulating', 'Finalizing'] }
                ].findIndex(s => s.match.some(m => currentStep.includes(m))); // Logic simplified: if index < current step index

              // Better logic: Find index of current step
              const steps = [
                ['Initializing', 'Analyzing Intent'],
                ['Planning Research Agents'],
                ['Running Autonomous Agents'],
                ['Ingesting', 'Retrieving', 'Reranking', 'Summarizing'],
                ['Formulating', 'Finalizing']
              ];

              const currentStepIdx = steps.findIndex(s => s.some(m => currentStep.includes(m)));
              // If not found (e.g. unknown step), default to 0. 
              const activeIdx = currentStepIdx === -1 ? 0 : currentStepIdx;

              const isDone = idx < activeIdx;
              const isActive = idx === activeIdx;

              return (
                <div key={idx} className="flex items-center gap-4">
                  <div className={`
                                w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500
                                ${isDone ? 'bg-primary border-primary text-primary-foreground' :
                      isActive ? 'border-primary text-primary animate-pulse shadow-[0_0_15px_rgba(var(--primary),0.5)]' :
                        'border-muted text-muted-foreground bg-muted/20'}
                            `}>
                    {isDone ? <CheckCircle className="w-5 h-5" /> :
                      isActive ? <Loader2 className="w-4 h-4 animate-spin" /> :
                        <div className="w-2 h-2 rounded-full bg-current" />}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium transition-colors duration-300 ${isActive || isDone ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {step.label}
                    </p>
                    {isActive && (
                      <p className="text-xs text-primary mt-1 animate-pulse font-mono">
                        {currentStep}...
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
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
          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center flex-wrap">
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                onClick={handleCopy}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 flex-1 sm:flex-none"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Report
              </Button>
              <Button
                variant="outline"
                onClick={handleDownload}
                className="border-primary text-primary hover:bg-primary/10 flex-1 sm:flex-none"
              >
                <Download className="w-4 h-4 mr-2" />
                Download JSON
              </Button>
            </div>
            <span className="text-muted-foreground text-sm italic">
              - for detailed information
            </span>
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
                {/* Helper for rendering recursive JSON */}
                <div className="space-y-8">
                  {Object.entries(agent_groups).map(([agent, content]: [string, any], idx) => (
                    <div key={idx} className="bg-card/30 rounded-xl p-6 border border-border/50">
                      <h3 className="text-xl sm:text-2xl font-bold text-primary mb-6 flex items-center gap-3 border-b border-border/50 pb-4">
                        <Bot className="w-6 h-6 text-chart-1" /> {agent}
                      </h3>

                      <div className="prose prose-invert max-w-none text-muted-foreground">
                        <JsonRenderer data={content} />
                      </div>
                    </div>
                  ))}
                </div>
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