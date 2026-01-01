"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plus, MessageSquare, Loader2, Trash2, MoreHorizontal } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Session {
    id: string;
    title: string;
    createdAt: string;
}

interface ChatSidebarProps {
    sessions: Session[];
    currentSessionId: string | null;
    onSelectSession: (id: string | null) => void;
    isLoading: boolean;
    className?: string;
}

export function ChatSidebar({
    sessions,
    currentSessionId,
    onSelectSession,
    isLoading,
    className
}: ChatSidebarProps) {
    return (
        <div className={cn("flex flex-col h-full bg-muted/10 border-r border-border/40", className)}>
            <div className="p-4 border-b border-border/40">
                <Button
                    onClick={() => onSelectSession(null)}
                    className="w-full justify-start gap-2 bg-primary/10 hover:bg-primary/20 text-primary shadow-none border-0"
                    variant="outline"
                >
                    <Plus className="w-4 h-4" />
                    New Chat
                </Button>
            </div>

            <div className="px-4 py-3">
                <h3 className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-widest">History</h3>
            </div>

            <ScrollArea className="flex-1 px-3">
                {isLoading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground/60" />
                    </div>
                ) : sessions.length === 0 ? (
                    <div className="p-8 text-center text-sm text-muted-foreground/60 italic">
                        No history yet.
                    </div>
                ) : (
                    <div className="space-y-1 pb-4">
                        {sessions.map((session) => (
                            <div
                                key={session.id}
                                className={cn(
                                    "group flex items-center gap-2 w-full rounded-lg transition-all duration-200",
                                    currentSessionId === session.id
                                        ? "bg-primary/10 text-primary"
                                        : "hover:bg-muted/50 text-foreground/80"
                                )}
                            >
                                <Button
                                    variant="ghost"
                                    className={cn(
                                        "w-full justify-start text-left h-auto py-3 px-3 hover:bg-transparent font-normal",
                                        currentSessionId === session.id ? "text-primary font-medium" : "text-foreground/80"
                                    )}
                                    onClick={() => onSelectSession(session.id)}
                                >
                                    <MessageSquare className={cn(
                                        "w-4 h-4 mr-3 shrink-0 transition-opacity",
                                        currentSessionId === session.id ? "opacity-100" : "opacity-50 group-hover:opacity-80"
                                    )} />
                                    <div className="overflow-hidden flex-1">
                                        <p className="truncate text-sm">{session.title}</p>
                                        <p className="text-[10px] text-muted-foreground/60 truncate mt-0.5 font-normal">
                                            {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
                                        </p>
                                    </div>
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </ScrollArea>
        </div>
    );
}
