"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send, Loader2, Sparkles, User, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

interface Message {
    role: "user" | "assistant";
    content: string;
}

export function ChatInterface() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "Hi! I can help you analyze your reports. Ask me anything!" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = { role: "user" as const, content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [...messages, userMessage],
                    sessionId: sessionId
                }),
            });

            if (!response.ok) throw new Error("Failed to fetch response");

            const data = await response.json();

            if (data.sessionId && !sessionId) {
                setSessionId(data.sessionId);
            }

            setMessages(prev => [...prev, { role: "assistant", content: data.content }]);
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Mobile: Use full screen sheet/drawer effect */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className={cn(
                                "fixed z-50 bg-background border shadow-2xl flex flex-col overflow-hidden ring-1 ring-border/50",
                                // Desktop positioning
                                "md:bottom-24 md:right-6 md:w-[400px] md:h-[600px] md:rounded-xl",
                                // Mobile positioning (full width sheet style)
                                "bottom-0 left-0 right-0 top-auto h-[80vh] w-full rounded-t-3xl border-b-0"
                            )}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b bg-muted/30 backdrop-blur-sm">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <Sparkles className="w-4 h-4 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-sm">Research Assistant</h3>
                                        <p className="text-xs text-muted-foreground">Detailed answers from your reports</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                                {messages.map((m, i) => (
                                    <div key={i} className={cn("flex gap-3", m.role === "user" ? "justify-end" : "justify-start")}>
                                        {m.role === "assistant" && (
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                <Bot className="w-4 h-4 text-primary" />
                                            </div>
                                        )}
                                        <div className={cn(
                                            "p-3 rounded-2xl text-sm max-w-[80%]",
                                            m.role === "user"
                                                ? "bg-primary text-primary-foreground rounded-tr-none"
                                                : "bg-muted rounded-tl-none border"
                                        )}>
                                            <div className="prose prose-sm dark:prose-invert max-w-none wrap-break-word">
                                                <ReactMarkdown
                                                    components={{
                                                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                                        ul: ({ children }) => <ul className="pl-4 list-disc mb-2">{children}</ul>,
                                                        ol: ({ children }) => <ol className="pl-4 list-decimal mb-2">{children}</ol>,
                                                    }}
                                                >
                                                    {m.content}
                                                </ReactMarkdown>
                                            </div>
                                        </div>
                                        {m.role === "user" && (
                                            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                                                <User className="w-4 h-4 text-secondary-foreground" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex gap-3 justify-start">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                            <Bot className="w-4 h-4 text-primary" />
                                        </div>
                                        <div className="bg-muted p-4 rounded-2xl rounded-tl-none border flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                                            <span className="text-xs text-muted-foreground">Thinking...</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Input */}
                            <div className="p-4 bg-background border-t pb-8 md:pb-4">
                                <form onSubmit={handleSubmit} className="relative">
                                    <Textarea
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Ask about your reports..."
                                        className="pr-12 resize-none max-h-[100px] min-h-[50px] py-4 rounded-xl shadow-sm focus-visible:ring-primary/20"
                                        rows={1}
                                    />
                                    <Button
                                        type="submit"
                                        size="icon"
                                        className="absolute right-2 top-2 h-8 w-8 rounded-lg"
                                        disabled={isLoading || !input.trim()}
                                    >
                                        <Send className="w-4 h-4" />
                                    </Button>
                                </form>
                            </div>
                        </motion.div>

                        {/* Backdrop for mobile */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
                        />
                    </>
                )}
            </AnimatePresence>

            <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="fixed bottom-3 md:bottom-6 right-3 md:right-6 z-50"
            >
                <Button
                    onClick={() => setIsOpen(!isOpen)}
                    size="lg"
                    className="h-14 w-14 rounded-full shadow-lg shadow-primary/25 p-0 bg-primary hover:bg-primary/90 text-primary-foreground border-4 border-background/20"
                >
                    {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
                </Button>
            </motion.div>
        </>
    );
}
