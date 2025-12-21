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
    if (!idea.trim()) return toast('Please enter an idea..');
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
                  toast.success('Report generated successfully!');
                }
              }, 1000);
              return;
            }

            if (status === 'failed') {
              clearInterval(poll);
              setLoading(false);
              toast.error('Research failed. Please try again.');
              return;
            }
          }
        } catch (e) {
          console.error("Polling error", e);
        }

        if (attempts >= maxAttempts) {
          clearInterval(poll);
          setLoading(false);
          toast.error('Research is taking longer than expected. Please check "Saved Reports" later.');
        }
      }, 3000);

    } catch (err) {
      console.error('Pipeline error:', err);
      toast.error('Failed to start research.');
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
      <div className="flex flex-col justify-center items-center min-h-screen text-foreground space-y-8 bg-background/80 backdrop-blur-xl z-50 p-6 fixed inset-0">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-primary/10 rounded-full"></div>
          <div className="relative bg-background/90 rounded-full p-6 ring-1 ring-white/10 shadow-sm">
            <Loader2 className="w-16 h-16 text-primary animate-spin" /> {/* Keep simple spin, it's standard UX */}
          </div>
        </div>

        <div className="text-center space-y-4 mb-8">
          <h3 className="text-3xl font-bold text-primary tracking-tight">
            Building Your Strategic Report
          </h3>
          <p className="text-muted-foreground max-w-lg mx-auto text-lg">
            Our autonomous agents are scouring the web, analyzing competitors, and formulating a winning strategy for you.
          </p>
        </div>

        {/* Visual Stepper */}
        <div className="w-full max-w-2xl glass-card rounded-2xl p-8 shadow-2xl border-white/5">
          <h4 className="text-xl font-semibold mb-8 flex items-center gap-3 text-primary border-b border-border/50 pb-4">
            <Zap className="w-6 h-6 text-yellow-500 fill-yellow-500/20" /> Live Agent Progress
          </h4>

          <div className="space-y-6">
            {[
              { id: 'init', label: 'Initiation & Intent', match: ['Initializing', 'Analyzing Intent'] },
              { id: 'plan', label: 'Strategic Planning', match: ['Planning Research Agents'] },
              { id: 'research', label: 'Deep Research (Agents)', match: ['Running Autonomous Agents'] },
              { id: 'process', label: 'Data Processing & Analysis', match: ['Ingesting', 'Retrieving', 'Reranking', 'Summarizing'] },
              { id: 'report', label: 'Strategy Formulation', match: ['Formulating', 'Finalizing'] }
            ].map((step, idx) => {
              // Existing logic for step active/done determination
              const steps = [
                ['Initializing', 'Analyzing Intent'],
                ['Planning Research Agents'],
                ['Running Autonomous Agents'],
                ['Ingesting', 'Retrieving', 'Reranking', 'Summarizing'],
                ['Formulating', 'Finalizing']
              ];

              const currentStepIdx = steps.findIndex(s => s.some(m => currentStep.includes(m)));
              const activeIdx = currentStepIdx === -1 ? 0 : currentStepIdx;

              const isDone = idx < activeIdx;
              const isActive = idx === activeIdx;

              return (
                <div key={idx} className="flex items-center gap-4 group">
                  <div className={`
                                w-8 h-8 rounded-full flex items-center justify-center border transition-colors
                                ${isDone ? 'bg-primary border-primary text-primary-foreground' :
                      isActive ? 'border-primary text-primary' :
                        'border-border text-muted-foreground bg-muted/20'}
                            `}>
                    {isDone ? <CheckCircle className="w-5 h-5" /> :
                      isActive ? <Loader2 className="w-4 h-4 animate-spin" /> :
                        <div className="w-2 h-2 rounded-full bg-current" />}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium transition-colors text-lg ${isActive || isDone ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {step.label}
                    </p>
                    {isActive && (
                      <p className="text-sm text-primary mt-1 font-mono tracking-wide">
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
      <div className="flex-1 p-2 md:px-6 md:py-4 text-foreground space-y-4 max-w-7xl mx-auto w-full">
        <Card className="glass-card rounded-3xl shadow-2xl overflow-hidden border-border/50">
          <CardHeader className="pb-4 pt-6 px-4 md:px-6 text-center border-b border-border/50 bg-secondary/20">
            <CardTitle className="text-lg sm:text-3xl md:text-4xl font-extrabold text-foreground flex items-center justify-center gap-2 mb-2">
              <div className="p-1.5 md:p-2 bg-primary/10 rounded-xl">
                <Brain className="w-6 h-6 sm:w-10 sm:h-10 text-primary" />
              </div>
              Generate New Report
            </CardTitle>
            <CardDescription className="text-muted-foreground text-xs md:text-base max-w-2xl mx-auto">
              Unlock powerful AI analysis for your startup. Enter your idea below to launch our autonomous research swarm.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-4 md:p-6">
            <div className="bg-secondary/30 p-4 md:p-6 rounded-2xl border border-border/50">
              <h3 className="font-semibold text-base md:text-lg text-foreground mb-4 md:mb-6 flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary" /> What happens next?
              </h3>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                <div className="flex items-center sm:items-start gap-3 p-3 rounded-xl bg-background/50 border border-border/50 hover:border-primary/30 transition-colors">
                  <div className="bg-chart-1/10 p-3 rounded-lg text-chart-1">
                    <Search className="w-4 h-4 md:w-6 md:h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-xs md:text-base">Market Research</p>
                    <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">Agents analyze market size, trends & growth capability.</p>
                  </div>
                </div>
                <div className="flex items-center sm:items-start gap-3 p-3 rounded-xl bg-background/50 border border-border/50 hover:border-primary/30 transition-colors">
                  <div className="bg-chart-2/10 p-3 rounded-lg text-chart-2">
                    <TrendingUp className="w-4 h-4 md:w-6 md:h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-xs md:text-base">Competitor Intel</p>
                    <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">We scout top competitors, SWOT analysis & gaps.</p>
                  </div>
                </div>
                <div className="flex items-center sm:items-start gap-3 p-3 rounded-xl bg-background/50 border border-border/50 hover:border-primary/30 transition-colors">
                  <div className="bg-chart-4/10 p-3 rounded-lg text-chart-4">
                    <Lightbulb className="w-4 h-4 md:w-6 md:h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-xs md:text-base">Strategic Plan</p>
                    <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">Get a roadmap, KPIs & actionable advice.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 max-w-4xl mx-auto">
              <label className="text-xs md:text-base font-medium text-foreground ml-1">
                Describe your startup idea
              </label>
              <div className="flex flex-col md:flex-row gap-4 relative">
                <Input
                  placeholder="E.g., A subscription service for organic dog food in Europe focusing on sustainability..."
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  className="bg-background/50 backdrop-blur-sm border-border text-foreground flex-1 text-xs md:text-base shadow-sm rounded-xl pl-4 focus-visible:ring-primary/20"
                />
                <Button
                  onClick={runPipeline}
                  disabled={loading}
                  size="lg"
                  className="bg-linear-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white px-8 h-10 md:h-12 text-xs md:text-base font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all rounded-xl hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Zap className="w-5 h-5 mr-2 fill-white" />
                  Start Research
                </Button>
              </div>
              <p className="flex items-start md:items-center text-xs md:text-sm text-muted-foreground ml-2 gap-2">
                <Info className="w-4 h-4 text-primary" />
                Tip: Be specific about your product, target audience, and unique value proposition for better results.
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
    <div className="flex-1 p-2 sm:px-10 sm:py-8 text-foreground space-y-8 max-w-7xl mx-auto w-full">
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
    </div>
  );
}