import {
    Zap,
    Loader2,
    CheckCircle,
} from 'lucide-react';

interface DashboardLoadingProps {
    currentStep: string;
}

export const DashboardLoading = ({ currentStep }: DashboardLoadingProps) => {
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
};
