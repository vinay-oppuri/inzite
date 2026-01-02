import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
    title?: string;
    description?: string;
    retry?: () => void;
}

export default function ErrorState({
    title = "Something went wrong",
    description = "There was an error loading this content. Please try again.",
    retry
}: ErrorStateProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[300px] w-full p-8 text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="p-3 bg-destructive/10 rounded-full mb-4">
                <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto mb-6">
                {description}
            </p>
            {retry && (
                <Button onClick={retry} variant="outline" className="gap-2">
                    <RefreshCcw className="w-4 h-4" />
                    Try Again
                </Button>
            )}
            {!retry && (
                <Button onClick={() => window.location.reload()} variant="outline" className="gap-2">
                    <RefreshCcw className="w-4 h-4" />
                    Reload Page
                </Button>
            )}
        </div>
    );
}