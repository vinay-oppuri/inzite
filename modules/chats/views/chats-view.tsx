'use client';

import { useState, useRef, useEffect } from 'react';

import { Send, Loader2, User, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import LoadingState from '@/components/common/loading-state';
import ErrorState from '@/components/common/error-state';

interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatViewProps {
  userId?: string;
  initialSessionId?: string;
}

export default function ChatView({ userId: propUserId, initialSessionId }: ChatViewProps) {
  const [input, setInput] = useState('');
  // session state can be useful if we want to change title locally, but for now we rely on simple ID
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(initialSessionId || null);
  const [messages, setMessages] = useState<Message[]>([]);

  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // 1. Fetch Messages when Session ID changes
  useEffect(() => {
    if (!currentSessionId) {
      setMessages([]); // New Chat
      return;
    }

    const fetchMessages = async () => {
      try {
        setIsLoadingMessages(true);
        const res = await fetch(`/api/chat/${currentSessionId}`);
        if (!res.ok) throw new Error('Failed to fetch messages');
        const data = await res.json();
        setMessages(data.messages || []);
      } catch (err) {
        console.error('Failed to fetch messages:', err);
        toast.error('Failed to load chat history');
      } finally {
        setIsLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [currentSessionId]);

  // Sync state with prop (handle navigation)
  useEffect(() => {
    setCurrentSessionId(initialSessionId || null);
  }, [initialSessionId]);

  // Scroll to bottom when messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const handleSend = async () => {
    if (!input.trim() || isSending) return;

    const query = input.trim();
    setInput('');
    setIsSending(true);

    const userMsg: Message = { role: 'user', content: query };
    setMessages(prev => [...prev, userMsg]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          sessionId: currentSessionId
        })
      });

      if (!res.ok) throw new Error('Chat request failed');

      const data = await res.json();

      // Update session ID if this was a new chat
      if (data.sessionId && !currentSessionId) {
        setCurrentSessionId(data.sessionId);
        // Note: Global sidebar won't update automatically until refresh. 
        // We could implement a global context or event bus later if needed.
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
    } catch (err) {
      console.error('Chat send failed:', err);
      toast.error('Failed to send message.');
      setInput(query); // Restore input
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background relative">
      {/* Messages Area */}
      <ScrollArea className="flex-1 p-0 md:p-4 pb-32">
        {isLoadingMessages ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground/50" />
          </div>
        ) : messages.length === 0 && !currentSessionId ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 py-20 px-4">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center rotate-3 transition-transform hover:rotate-6">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-2 max-w-md">
              <h3 className="text-xl font-bold tracking-tight">How can I help you today?</h3>
              <p className="text-muted-foreground text-sm">
                I can analyze market trends, provide competitor insights, or answer questions about your reports.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-lg mx-auto pt-4">
              {["Market analysis for AI tools", "Analyze my latest report", "Competitor landscape for SaaS"].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setInput(suggestion);
                    // Optional: auto-send
                  }}
                  className="text-sm p-3 bg-card hover:bg-muted/60 border rounded-xl text-left transition-colors text-muted-foreground hover:text-foreground"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-8 max-w-screen mx-auto pb-4">
            {messages.map((m, i) => (
              <div key={i} className={cn("flex gap-3 group", m.role === "user" ? "flex-row-reverse" : "flex-row")}>
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1",
                  m.role === "assistant" ? "bg-primary/10 text-primary" : "bg-muted"
                )}>
                  {m.role === "assistant" ? <Sparkles className="w-4 h-4" /> : <User className="w-4 h-4 text-muted-foreground" />}
                </div>

                <div className={cn(
                  "relative max-w-[80%] px-5 py-2 text-xs md:text-sm leading-relaxed",
                  m.role === "user"
                    ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm"
                    : "bg-secondary/50 text-foreground rounded-2xl rounded-tl-sm"
                )}>
                  <div className="prose prose-sm dark:prose-invert max-w-none wrap-break-word">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            {isSending && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-1">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-1 px-4 py-3 bg-muted/30 rounded-2xl rounded-tl-sm">
                  <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce"></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef}></div>
          </div>
        )}
      </ScrollArea>

      <div className="pb-18 md:pb-4">
        <div className="relative flex items-center justify-center max-w-3xl mx-auto gap-2 bg-muted/40 hover:bg-muted/60 backdrop-blur-xl border border-foreground/10 rounded-full transition-all focus-within:bg-background focus-within:ring-1 focus-within:ring-primary/20 focus-within:shadow-lg">
          <Input
            placeholder={currentSessionId ? "Reply..." : "Start a new chat..."}
            className="h-10 md:h-12 pl-4 pr-12 border-none bg-transparent shadow-none focus-visible:ring-0 text-xs md:text-sm"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !isSending && handleSend()}
            disabled={isSending || isLoadingMessages}
          />
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              "absolute bg-transparent right-2 h-9 w-9 rounded-lg",
              input.trim()
                ? "text-foreground hover:bg-primary/90"
                : "text-muted-foreground hover:bg-muted/50"
            )}
            onClick={handleSend}
            disabled={isSending || !input.trim() || isLoadingMessages}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export const ChatsLoadingState = () => {
  return (
    <LoadingState
      title="Loading Chats"
      description="Please wait while we load your chats."
    />
  )
}

export const ChatsErrorState = () => {
  return (
    <ErrorState
      title="Error Loading Chats"
      description="Please try again later."
    />
  )
}