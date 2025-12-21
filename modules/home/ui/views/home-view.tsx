'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BrainCircuit, ChevronRight, Search, Zap, Lightbulb, FileText } from 'lucide-react';
import Link from 'next/link';
import Header from '../components/header';
import SignInDialog from '@/components/sign-in-dialog';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';

const HomeView = () => {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const features = [
    { title: "Market Analysis", desc: "Get a deep understanding of your target market, including size, trends, and customer demographics.", icon: BrainCircuit },
    { title: "Competitor Research", desc: "Identify and analyze your key competitors, their strengths, weaknesses, and market positioning.", icon: Search },
    { title: "Actionable Insights", desc: "Receive clear, data-driven recommendations to inform your product, marketing, and business strategy.", icon: Zap },
  ]

  return (
    <>
      <Header />
      <SignInDialog open={open} onOpenChange={setOpen} />
      <div className="flex flex-col items-center justify-center min-h-screen">
        <main className="flex-1 justify-center w-full">
          {/* HERO SECTION */}
          <section className="w-full py-20 md:py-32 lg:py-40 relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />

            <div className="container px-4 md:px-6 mx-auto relative z-10">
              <div className="flex flex-col items-center text-center space-y-8 md:space-y-12">
                <div className="space-y-6 max-w-4xl">
                  {/* <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm text-primary backdrop-blur-sm mb-4">
                    <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
                    Now with Deep Competitor Analysis
                  </div> */}
                  <h1 className="py-2 text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-linear-to-b from-foreground via-foreground/90 to-muted-foreground leading-[1.1]">
                    Unlock Startup Success <br className="hidden md:block" /> with <span className="text-primary">AI Insights</span>
                  </h1>
                  <p className="mx-auto max-w-2xl text-muted-foreground text-md md:text-xl leading-relaxed px-4">
                    Transform your startup idea into a data-driven strategy. Our intelligent agents analyze markets, competitors, and trends to give you the winning edge.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center px-4">
                  <Button
                    className="px-8 rounded-lg shadow-sm transition-colors hover:bg-primary/90"
                    onClick={() => {
                      if (session) {
                        router.push("/dashboard")
                      } else {
                        setOpen(true)
                      }
                    }} >
                    Start Research Free
                    <ChevronRight className="hidden md:flex h-5 w-5 ml-2" />
                  </Button>
                  <Link href="#how-it-works" className="w-full sm:w-auto">
                    <Button variant="outline" className="w-full sm:w-auto px-8 border-primary/20 hover:bg-primary/5 rounded-lg transition-colors bg-background">
                      See How It Works
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* HOW IT WORKS SECTION */}
          <section id="how-it-works" className="w-full py-24 relative">
            <div className="container px-4 md:px-6 mx-auto">
              <div className="flex flex-col items-center justify-center space-y-4 text-center mb-20">
                <div className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs md:text-sm text-primary font-medium">
                  Simple Process
                </div>
                <h2 className="flex md:flex-row flex-col text-2xl font-bold tracking-tighter md:text-5xl gap-2">
                  From Idea to Strategy in <div className="text-primary">Minutes</div>
                </h2>
                <p className="max-w-[700px] text-muted-foreground text-sm md:text-xl/relaxed">
                  Stop spending weeks on manual research. Let our AI agents do the heavy lifting while you focus on building.
                </p>
              </div>
              <div className="grid gap-8 grid-cols-1 md:grid-cols-3 max-w-6xl mx-auto">
                {[
                  { step: "01", title: "Enter Your Idea", desc: "Simply describe your startup concept or product in a few words.", icon: Lightbulb },
                  { step: "02", title: "AI Research", desc: "Our agents scout competitors, analyze trends, and mine technical papers.", icon: BrainCircuit },
                  { step: "03", title: "Get Strategy", desc: "Receive a comprehensive report with actionable insights and a roadmap.", icon: FileText },
                ].map((item, i) => (
                  <div key={item.step} className="group relative flex flex-col items-center space-y-6 text-center p-8 glass-card rounded-3xl border border-border/50">
                    <div className="absolute -top-6 flex h-10 w-10 md:h-14 md:w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-bold text-xl shadow-md">
                      {item.step}
                    </div>
                    <div className="pt-6 md:pt-8 space-y-4">
                      <div className="p-4 rounded-full bg-primary/5 w-fit mx-auto">
                        <item.icon className="h-6 md:h-8 w-6 md:w-8 text-primary" />
                      </div>
                      <h3 className="text-lg md:text-2xl font-bold">{item.title}</h3>
                      <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FEATURES SECTION */}
          <section id="features" className="w-full py-24 bg-secondary/30">
            <div className="container px-4 md:px-6 mx-auto">
              <div className="flex flex-col items-center justify-center space-y-4 text-center mb-20">
                <div className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm text-primary font-medium">
                  Powerful Features
                </div>
                <h2 className="flex md:flex-row flex-col text-2xl font-bold tracking-tighter md:text-5xl">
                  Everything You Need to <div className="text-primary">Scale</div>
                </h2>
                <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed">
                  Comprehensive tools designed to validate and refine your business model from every angle.
                </p>
              </div>
              <div className="mx-auto grid max-w-7xl items-center gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                {features.map((feat) => (
                  <Card key={feat.title} className="bg-background/80 border-border/50 shadow-sm rounded-3xl overflow-hidden">
                    <CardContent className="p-8 flex flex-col items-start text-left gap-4">
                      <div className="p-3 rounded-2xl bg-primary/10">
                        <feat.icon className="md:h-8 md:w-8 h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg md:text-xl font-bold mb-2">{feat.title}</h3>
                        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                          {feat.desc}
                        </p>
                      </div>
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