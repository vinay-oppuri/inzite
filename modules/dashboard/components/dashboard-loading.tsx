import {
    Loader2,
    CheckCircle2,
    Circle,
    BrainCircuit
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { motion } from "motion/react";

interface DashboardLoadingProps {
    currentStep: string;
}

export const DashboardLoading = ({ currentStep }: DashboardLoadingProps) => {
    const steps = [
        { id: 'init', label: 'Initiation', match: ['Initializing', 'Analyzing Intent'] },
        { id: 'plan', label: 'Planning', match: ['Planning Research Agents'] },
        { id: 'research', label: 'Deep Research', match: ['Running Autonomous Agents'] },
        { id: 'process', label: 'Analysis', match: ['Ingesting', 'Retrieving', 'Reranking', 'Summarizing'] },
        { id: 'report', label: 'Finalizing', match: ['Formulating', 'Finalizing'] }
    ];

    const currentStepIdx = steps.findIndex(s => s.match.some(m => currentStep.includes(m)));
    const activeIdx = currentStepIdx === -1 ? 0 : currentStepIdx;
    const progress = Math.min((activeIdx / (steps.length - 1)) * 100, 95);

    return (
        <div className="w-full max-w-md mx-auto animate-in slide-in-from-right-8 duration-700 fade-in bg-background/50 backdrop-blur-sm rounded-2xl border border-border/50 p-6 shadow-xl">
            <div className="space-y-6">
                <div className="flex items-center gap-4 mb-2">
                    <div className="p-3 bg-primary/10 rounded-xl animate-pulse">
                        <BrainCircuit className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground">AI Research Agent</h3>
                        <p className="text-sm text-muted-foreground">Building your strategic report...</p>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium text-muted-foreground">
                        <span>Progress</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                </div>

                <div className="space-y-3 pt-2">
                    {steps.map((step, idx) => {
                        const isDone = idx < activeIdx;
                        const isActive = idx === activeIdx;

                        return (
                            <div key={idx} className={`flex items-center gap-3 text-sm transition-colors duration-300 ${isActive || isDone ? 'opacity-100' : 'opacity-40'}`}>
                                {isDone ? (
                                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                                ) : isActive ? (
                                    <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" />
                                ) : (
                                    <Circle className="w-4 h-4 text-muted-foreground shrink-0" />
                                )}
                                <span className={`font-medium ${isActive ? 'text-primary' : 'text-foreground'}`}>
                                    {step.label}
                                </span>
                                {isActive && (
                                    <span className="ml-auto text-xs text-primary/80 animate-pulse">
                                        Processing...
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="pt-4 border-t border-border/50">
                    <p className="text-xs text-center text-muted-foreground animate-pulse">
                        {currentStep}...
                    </p>
                </div>
            </div>
        </div>
    );
};
