'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BrainCircuit, ChevronRight, Search, Zap, Lightbulb, FileText } from 'lucide-react';
import Link from 'next/link';
import Header from '../components/header';

const HomeView = () => {
  const features = [
    { title: "Market Analysis", desc: "Get a deep understanding of your target market, including size, trends, and customer demographics.", icon: BrainCircuit },
    { title: "Competitor Research", desc: "Identify and analyze your key competitors, their strengths, weaknesses, and market positioning.", icon: Search },
    { title: "Actionable Insights", desc: "Receive clear, data-driven recommendations to inform your product, marketing, and business strategy.", icon: Zap },
  ]

  return (
    <>
      <Header />
      <div className="flex flex-col items-center justify-center min-h-screen">
        <main className="flex-1 justify-center w-full">
          {/* HERO SECTION */}
          <section className="w-full py-12 md:py-24 lg:py-32 relative overflow-hidden">
            <div className="absolute inset-0 bg-primary/5 blur-[100px] rounded-full pointer-events-none -z-10" />
            <div className="container px-4 md:px-6 mx-auto">
              <div className="flex flex-col items-center text-center space-y-6 md:space-y-10">
                <div className="space-y-4 max-w-3xl">
                  <h1 className="py-2 text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-primary via-purple-500 to-chart-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 leading-tight">
                    Unlock Startup Success with AI Insights
                  </h1>
                  <p className="mx-auto max-w-[700px] text-muted-foreground text-base sm:text-lg md:text-xl leading-relaxed px-4">
                    Transform your startup idea into a data-driven strategy. Our intelligent agents analyze markets, competitors, and trends to give you the winning edge.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center px-4">
                  <Link href="/dashboard" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-lg bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-full transition-all duration-300 shadow-xl hover:shadow-primary/25 hover:-translate-y-1">
                      Start Researching <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="#how-it-works" className="w-full sm:w-auto">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto h-12 px-8 text-lg border-primary/20 hover:bg-primary/5 rounded-full transition-all duration-300">
                      How it Works
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* HOW IT WORKS SECTION */}
          <section id="how-it-works" className="w-full py-20">
            <div className="container px-4 md:px-6 mx-auto">
              <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary font-medium">
                  Process
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  From Idea to Strategy in Minutes
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                  Stop spending weeks on manual research. Let our AI agents do the heavy lifting.
                </p>
              </div>
              <div className="grid gap-8 grid-cols-1 md:grid-cols-3 max-w-5xl mx-auto">
                {[
                  { step: "01", title: "Enter Your Idea", desc: "Simply describe your startup concept or product in a few words.", icon: Lightbulb },
                  { step: "02", title: "AI Research", desc: "Our agents scout competitors, analyze trends, and mine technical papers.", icon: BrainCircuit },
                  { step: "03", title: "Get Strategy", desc: "Receive a comprehensive report with actionable insights and a roadmap.", icon: FileText },
                ].map((item) => (
                  <div key={item.step} className="relative flex flex-col items-center space-y-4 text-center p-6 bg-card rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-all">
                    <div className="absolute -top-6 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg shadow-lg">
                      {item.step}
                    </div>
                    <div className="pt-8 space-y-2">
                      <h3 className="text-xl font-bold">{item.title}</h3>
                      <p className="text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FEATURES SECTION */}
          <section id="features" className="w-full py-20">
            <div className="container px-4 md:px-6 mx-auto">
              <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary font-medium">
                  Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl bg-clip-text text-transparent bg-linear-to-r from-primary to-chart-4">
                  Powerful Tools for Growth
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                  Everything you need to validate and refine your business model.
                </p>
              </div>
              <div className="mx-auto grid max-w-6xl items-center gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                {features.map((feat) => (
                  <Card key={feat.title} className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group">
                    <CardContent className="p-8 flex flex-col items-center text-center gap-4">
                      <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <feat.icon className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold">{feat.title}</h3>
                      <p className="text-muted-foreground">
                        {feat.desc}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
};

export default HomeView;