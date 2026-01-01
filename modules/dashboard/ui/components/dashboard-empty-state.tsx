import {
    Brain,
    Bot,
    Search,
    TrendingUp,
    Lightbulb,
    Zap,
    Info,
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface DashboardEmptyStateProps {
    idea: string;
    setIdea: (value: string) => void;
    runPipeline: () => void;
    loading: boolean;
}

export const DashboardEmptyState = ({ idea, setIdea, runPipeline, loading }: DashboardEmptyStateProps) => {
    return (
        <div className="flex-1 p-0 md:px-6 md:py-4 text-foreground space-y-4 max-w-7xl mx-auto w-full">
            <Card className="glass-card rounded-3xl shadow-2xl overflow-hidden border-border/50 pb-6 md:pb-0">
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
                <CardContent className="space-y-6 p-4 py-0 md:p-6">
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
};
