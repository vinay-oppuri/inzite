'use client';

import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, Loader2, Trash2, MessageSquare, Bot, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Chat {
  id: number;
  user_id: string;
  query: string;
  response: string;
  created_at: string;
}

interface ChatViewProps {
  userId?: string;
}

export default function ChatView({ userId: propUserId }: ChatViewProps) {
  const [input, setInput] = useState('');
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const chatEndRef = useRef<HTMLDivElement | null>(null);
  // Default to 'user_1' if not provided (matching previous logic)
  const user_id = propUserId || 'user_1';

  // ✅ Fetch chats on mount
  useEffect(() => {
    let mounted = true;
    const fetchChats = async () => {
      try {
        setIsLoadingChats(true);
        const res = await axios.get(`/api/get-chats?userId=${user_id}`);
        if (mounted) {
          setChats(res.data.chats || []);
        }
      } catch (err) {
        console.error('Failed to fetch chats:', err);
        // Optional: toast.error('Failed to load chat history');
      } finally {
        if (mounted) setIsLoadingChats(false);
      }
    };

    fetchChats();

    return () => {
      mounted = false;
    };
  }, [user_id]);

  // ✅ Scroll to bottom on new chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats, isSending]);

  const handleSend = async () => {
    if (!input.trim() || isSending) return;

    const query = input.trim();
    setInput('');
    setIsSending(true);

    // Optimistic update (optional, but good UX)
    // We'll just wait for the response to append the full message pair for simplicity,
    // relying on the loading spinner to indicate activity.

    try {
      const res = await axios.post('/api/chat', {
        query,
        user_id,
      });

      const newChat: Chat = {
        id: Date.now(), // Temporary ID until refresh or if backend returns real ID
        user_id,
        query,
        response: res.data.reply,
        created_at: new Date().toISOString(),
      };

      setChats((prev) => [...prev, newChat]);
    } catch (err) {
      console.error('Chat send failed:', err);
      toast.error('Chat failed — check backend connection.');
      // Restore input if failed
      setInput(query);
    } finally {
      setIsSending(false);
    }
  };

  const clearChats = async () => {
    if (!confirm('Are you sure you want to clear all chat history?')) return;

    try {
      setIsClearing(true);
      await axios.delete(`/api/clear-chats?userId=${user_id}`);
      setChats([]);
      toast.info('Chat history cleared.');
    } catch (err) {
      console.error('Failed to clear chats:', err);
      toast.error('Failed to delete chat history.');
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8 text-foreground h-[calc(100vh-4rem)] max-w-5xl mx-auto w-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Assistant</h1>
          <p className="text-muted-foreground text-sm">Chat with your research data and get answers.</p>
        </div>
        {chats.length > 0 && (
          <Button
            onClick={clearChats}
            disabled={isClearing}
            variant="destructive"
            size="sm"
            className="gap-2"
          >
            {isClearing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            <span className="hidden sm:inline">Clear History</span>
          </Button>
        )}
      </div>

      <div className="flex-1 flex flex-col min-h-0 bg-background/50 border border-border/50 rounded-2xl overflow-hidden glass-card shadow-xl">
        <ScrollArea className="flex-1 p-4 md:p-6">
          {isLoadingChats ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-20 opacity-80">
              <div className="p-4 bg-primary/10 rounded-full">
                <MessageSquare className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Start a new conversation</h3>
              <p className="text-muted-foreground max-w-xs">
                Ask me about market trends, competitor analysis, or specific details from your reports.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {chats.map((chat) => (
                <div key={chat.id} className="space-y-6">
                  {/* User Bubble */}
                  <div className="flex justify-end gap-3">
                    <div className="bg-primary/10 text-primary-foreground p-3 rounded-2xl rounded-tr-sm max-w-[85%] md:max-w-[70%]">
                      <p className="text-sm md:text-base text-foreground font-medium">{chat.query}</p>
                    </div>
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center shrink-0 border border-border">
                      <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>

                  {/* Bot Bubble */}
                  <div className="flex justify-start gap-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                      <Bot className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <div className="bg-card border border-border p-4 rounded-2xl rounded-tl-sm max-w-[90%] md:max-w-[75%] shadow-sm">
                      <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap text-muted-foreground">
                        {chat.response}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {isSending && (
                <div className="flex justify-start gap-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div className="flex items-center gap-2 p-4 bg-card border border-border rounded-2xl rounded-tl-sm">
                    <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce"></span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef}></div>
            </div>
          )}
        </ScrollArea>

        <div className="p-4 bg-background/80 backdrop-blur-md border-t border-border">
          <div className="relative flex items-center gap-2 max-w-4xl mx-auto">
            <Input
              placeholder="Type your message..."
              className="pr-12 py-6 rounded-xl bg-muted/30 border-muted-foreground/20 focus-visible:ring-primary/20 shadow-inner"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isSending && handleSend()}
              disabled={isLoadingChats}
            />
            <Button
              size="icon"
              className="absolute right-1.5 top-1.5 h-9 w-9 bg-primary hover:bg-primary/90 transition-transform active:scale-95"
              onClick={handleSend}
              disabled={isSending || !input.trim() || isLoadingChats}
            >
              {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
          <p className="text-[10px] text-center text-muted-foreground/60 mt-3">
            AI can make mistakes. Please verify important information.
          </p>
        </div>
      </div>
    </div>
  );
}