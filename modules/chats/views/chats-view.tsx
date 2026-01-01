'use client';

import { useState, useRef, useEffect } from 'react';

import { Send, Loader2, Bot, User, Menu, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatSidebar } from '../components/chat-sidebar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

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
}

export default function ChatView({ userId: propUserId }: ChatViewProps) {
  const [input, setInput] = useState('');
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // 1. Fetch Sessions on Mount
  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setIsLoadingSessions(true);
      const res = await fetch('/api/chat/sessions');
      if (!res.ok) throw new Error('Failed to fetch sessions');
      const data = await res.json();
      setSessions(data.sessions || []);
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  // 2. Fetch Messages when Session ID changes
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
        // Refresh sessions list to show the new one title
        fetchSessions();
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
    <div className="flex bg-background border rounded-2xl overflow-hidden h-[calc(100vh-6rem)] shadow-sm">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-72 shrink-0 h-full">
        <ChatSidebar
          sessions={sessions}
          currentSessionId={currentSessionId}
          onSelectSession={setCurrentSessionId}
          isLoading={isLoadingSessions}
          className="h-full"
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-muted/5 h-full relative">
        {/* Mobile Header */}
        <div className="md:hidden p-4 border-b bg-background flex items-center gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="-ml-2">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-80">
              <ChatSidebar
                sessions={sessions}
                currentSessionId={currentSessionId}
                onSelectSession={(id) => {
                  setCurrentSessionId(id);
                }}
                isLoading={isLoadingSessions}
                className="h-full border-none"
              />
            </SheetContent>
          </Sheet>
          <span className="font-semibold text-sm">Chat History</span>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4 md:p-6 pb-32">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-lg pt-4">
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
            <div className="space-y-8 max-w-3xl mx-auto pb-4">
              {messages.map((m, i) => (
                <div key={i} className={cn("flex gap-4 group", m.role === "user" ? "flex-row-reverse" : "flex-row")}>
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 shadow-sm",
                    m.role === "assistant" ? "bg-primary text-primary-foreground" : "bg-muted"
                  )}>
                    {m.role === "assistant" ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5 text-muted-foreground" />}
                  </div>

                  <div className={cn(
                    "relative max-w-[85%] rounded-3xl p-5 text-sm leading-relaxed shadow-sm",
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-white dark:bg-card border rounded-tl-sm"
                  )}>
                    <div className="prose prose-sm dark:prose-invert max-w-none wrap-break-word">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
              {isSending && (
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 mt-1 shadow-sm">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1.5 p-4 bg-white dark:bg-card border rounded-3xl rounded-tl-sm shadow-sm">
                    <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef}></div>
            </div>
          )}
        </ScrollArea>

        {/* Input Area */}
        <div className="absolute bottom-6 left-0 right-0 px-4 md:px-6 pointer-events-none">
          <div className="max-w-3xl mx-auto pointer-events-auto">
            <div className="relative flex items-center gap-2 p-2 bg-background/80 backdrop-blur-xl border rounded-[24px] shadow-lg ring-1 ring-black/5 dark:ring-white/10 transition-all focus-within:ring-primary/30 focus-within:shadow-xl">
              <Input
                placeholder={currentSessionId ? "Continue conversation..." : "Ask anything..."}
                className="pl-4 pr-12 py-6 border-none bg-transparent shadow-none focus-visible:ring-0 text-base"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !isSending && handleSend()}
                disabled={isSending || isLoadingMessages}
              />
              <Button
                size="icon"
                className={cn(
                  "absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full transition-all duration-200",
                  input.trim()
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md scale-100"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 shadow-none scale-95 opacity-50 pointer-events-none"
                )}
                onClick={handleSend}
                disabled={isSending || !input.trim() || isLoadingMessages}
              >
                {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </Button>
            </div>
            <div className="text-center mt-2">
              <p className="text-[10px] text-muted-foreground/60">
                AI can make mistakes. Check important info.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
