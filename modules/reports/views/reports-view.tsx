'use client';

import { useEffect, useState } from 'react';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2, FileText, X, Calendar, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Report {
  id: number;
  idea: string;
  report_md: string;
  created_at: string;
}

export default function ReportsView() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Report | null>(null);
  const [search, setSearch] = useState('');

  // ✅ Search filtering
  const filteredReports = !search.trim()
    ? reports
    : reports.filter(r => r.idea.toLowerCase().includes(search.toLowerCase()));

  // ✅ Fetch all reports from Neon DB
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch('/api/get-reports');
        if (!res.ok) throw new Error('Failed to fetch reports');
        const data = await res.json();
        setReports(data);
      } catch (err) {
        console.error('❌ Error loading reports:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelected(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // ✅ Markdown Rendering Styles (Theme Aware)
  const markdownComponents = {
    h1: ({ node, ...props }: any) => (
      <h1 className="text-3xl font-extrabold mt-8 mb-4 text-foreground border-b border-border pb-2" {...props} />
    ),
    h2: ({ node, ...props }: any) => (
      <h2 className="text-2xl font-bold mt-6 mb-3 text-primary" {...props} />
    ),
    h3: ({ node, ...props }: any) => (
      <h3 className="text-xl font-semibold mt-5 mb-2 text-foreground" {...props} />
    ),
    p: ({ node, ...props }: any) => (
      <p className="text-muted-foreground leading-relaxed mb-4" {...props} />
    ),
    ul: ({ node, ordered, ...props }: any) => (
      <ul className="list-disc ml-6 space-y-2 marker:text-primary mb-4" {...props} />
    ),
    ol: ({ node, ...props }: any) => (
      <ol className="list-decimal ml-6 space-y-2 marker:text-primary mb-4" {...props} />
    ),
    li: ({ node, ...props }: any) => (
      <li className="text-muted-foreground" {...props} />
    ),
    a: ({ node, ...props }: any) => (
      <a className="text-primary underline hover:text-primary/80 transition-colors" target="_blank" rel="noopener noreferrer" {...props} />
    ),
    blockquote: ({ node, ...props }: any) => (
      <blockquote className="border-l-4 border-primary/50 pl-4 italic text-muted-foreground my-4 bg-muted/20 py-2 rounded-r-lg" {...props} />
    ),
    code: ({ node, inline, ...props }: any) =>
      inline ? (
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground" {...props} />
      ) : (
        <div className="relative">
          <pre className="bg-muted/50 p-4 rounded-lg overflow-x-auto my-4 font-mono text-sm border border-border" {...props} />
        </div>
      ),
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-100px)] text-muted-foreground animate-in fade-in">
        <Loader2 className="animate-spin w-8 h-8 mb-2 text-primary" />
        <p>Loading Reports...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 pt-6 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header controls */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-end justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Saved Reports</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Review and manage your generated strategic insights.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64 flex items-center">
            <Search className="z-10 absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search ideas..."
              className="pl-8 bg-background/50 backdrop-blur-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Badge variant="secondary" className="h-9 px-3 shrink-0">
            {filteredReports.length}
          </Badge>
        </div>
      </div>

      {reports.length === 0 ? (
        <Card className="border-dashed bg-muted/20 border-border/60">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
            <div className="p-4 bg-muted rounded-full">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-lg">No reports generated yet</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Start a new research workflow to generate your first strategic report.
              </p>
            </div>
            <Button onClick={() => window.location.href = '/dashboard'}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredReports.map((r) => (
            <Card
              key={r.id}
              className="group flex flex-col glass-card border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 cursor-pointer overflow-hidden py-4"
              onClick={() => setSelected(r)}
            >
              <CardHeader className="pb-3 space-y-3">
                <div className="flex justify-between items-start w-full">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary transition-transform group-hover:scale-105">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
                    #{r.id}
                  </span>
                </div>
                <CardTitle className="leading-snug text-lg font-bold line-clamp-2 group-hover:text-primary transition-colors">
                  {r.idea}
                </CardTitle>
              </CardHeader>
              <CardContent className="mt-auto pt-0">
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border/40">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(r.created_at).toLocaleDateString()}
                  </span>
                  <span className="font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                    View Report
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Report Viewer Dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col p-0 glass-card border-border shadow-2xl gap-0">
          <DialogHeader className="p-6 border-b border-border/40 bg-background/50 backdrop-blur-xl z-10 w-full text-foreground space-y-2">
            <DialogTitle className="text-2xl font-bold leading-tight pr-8">
              {selected?.idea}
            </DialogTitle>
            <DialogDescription className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Generated on {selected && new Date(selected.created_at).toLocaleString()}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-background/40">
            <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-foreground prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-code:text-foreground">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={markdownComponents}
              >
                {selected?.report_md || '*No content available.*'}
              </ReactMarkdown>
            </div>
          </div>

          <div className="p-4 border-t border-border/40 bg-background/50 backdrop-blur-xl flex justify-end gap-2">
            <Button variant="outline" onClick={() => setSelected(null)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}