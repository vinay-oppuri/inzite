import {
    Zap,
    Sparkles,
    ArrowRight
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DashboardEmptyStateProps {
    idea: string;
    setIdea: (value: string) => void;
    runPipeline: () => void;
    loading: boolean;
}

export const DashboardEmptyState = ({ idea, setIdea, runPipeline, loading }: DashboardEmptyStateProps) => {
    return (
        <div className={cn(
            "flex-1 p-0 flex flex-col items-center justify-center min-h-[50vh] transition-all duration-500",
            loading ? "opacity-50 pointer-events-none scale-95 origin-left" : "opacity-100"
        )}>
            <div className="w-full max-w-xl mx-auto space-y-8 text-center px-4">
                <div className="space-y-4">
                    <div className="inline-flex items-center justify-center p-3 bg-primary/5 rounded-2xl mb-2 ring-1 ring-primary/10 shadow-lg shadow-primary/5">
                        <Sparkles className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
                        What will you <span className="text-primary">build</span> today?
                    </h1>
                    <p className="text-sm md:text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
                        Enter your startup idea and let our autonomous agents formulate a winning strategy for you.
                    </p>
                </div>

                <div className="relative group">
                    <div className="absolute -inset-1 bg-linear-to-r from-primary/20 via-purple-500/20 to-primary/20 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500 opacity-50" />
                    <div className="relative flex flex-col md:flex-row gap-2 bg-background/80 backdrop-blur-xl p-2 rounded-2xl border border-white/10 shadow-2xl">
                        <Input
                            placeholder="Describe your idea in detail..."
                            value={idea}
                            onChange={(e) => setIdea(e.target.value)}
                            className="bg-transparent border-0 text-foreground text-xs md:text-sm h-10 md:h-12 px-4 focus-visible:ring-0 shadow-none placeholder:text-muted-foreground/50"
                            onKeyDown={(e) => e.key === 'Enter' && runPipeline()}
                        />
                        <Button
                            onClick={runPipeline}
                            disabled={loading || !idea.trim()}
                            size="lg"
                            className="h-10 md:h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm shadow-lg shadow-primary/25 transition-all hover:scale-105 active:scale-95"
                        >
                            {loading ? (
                                <span className="animate-pulse">Starting...</span>
                            ) : (
                                <>
                                    Start <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {!loading && (
                    <div className="flex items-center justify-center gap-6 text-xs md:text-sm text-muted-foreground/60 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                        <span className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-default">
                            <Zap className="w-4 h-4" /> Instant Analysis
                        </span>
                        <span className="w-1 h-1 rounded-full bg-border" />
                        <span className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-default">
                            <Sparkles className="w-4 h-4" /> AI Agents
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};
