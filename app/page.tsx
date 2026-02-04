"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowRight, BarChart2, MessageSquare, Zap, CheckCircle2 } from "lucide-react"
import { useSession } from "@/lib/auth-client"

export default function LandingPage() {
  const { data: session, isPending } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session) {
      router.push("/dashboard")
    }
  }, [session, router])

  if (isPending) {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    )
  }

  if (session) {
    return null // Redirecting...
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2 font-bold text-xl">
            <BarChart2 className="h-6 w-6 text-primary" />
            <span>PM Analyzer</span>
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-medium">
            <Link href="#features" className="text-muted-foreground hover:text-foreground">Features</Link>
            <Link href="#how-it-works" className="text-muted-foreground hover:text-foreground">How it Works</Link>
            <Link href="#pricing" className="text-muted-foreground hover:text-foreground">Pricing</Link>
          </nav>
          <div className="flex gap-4">
            <Button variant="ghost" asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/sign-up">Start Free</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="py-20 md:py-32 text-center px-4">
          <div className="container mx-auto max-w-4xl space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
              Turn customer feedback into <span className="text-primary">roadmap wins</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Automatically aggregate, analyze, and prioritize product feedback from every channel. Stop guessing and start building what users actually want.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" className="gap-2" asChild>
                <Link href="/sign-up">
                  Start analyzing for free <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#how-it-works">See how it works</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-20 bg-muted/50 px-4">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Why Product Managers love us</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-background p-6 rounded-xl shadow-sm border">
                <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Centralized Feedback</h3>
                <p className="text-muted-foreground">
                  Pull feedback from Slack, Email, Intercom, and more into one searchable database.
                </p>
              </div>
              <div className="bg-background p-6 rounded-xl shadow-sm border">
                <div className="h-12 w-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">AI-Powered Insights</h3>
                <p className="text-muted-foreground">
                  Our AI automatically tags, categorizes, and sentiment-analyzes every piece of feedback.
                </p>
              </div>
              <div className="bg-background p-6 rounded-xl shadow-sm border">
                <div className="h-12 w-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-4">
                  <BarChart2 className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Data-Driven Roadmap</h3>
                <p className="text-muted-foreground">
                  Identify high-impact features based on frequency and customer segment value.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section id="how-it-works" className="py-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold text-center mb-16">From noise to clarity in 3 steps</h2>
            <div className="space-y-12">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground font-bold">1</span>
                    <h3 className="text-2xl font-bold">Connect your sources</h3>
                  </div>
                  <p className="text-muted-foreground pl-12">
                    Integrate with the tools your team already uses. We support Slack, Discord, Email, and CSV uploads.
                  </p>
                </div>
                <div className="flex-1 bg-muted rounded-xl h-48 w-full flex items-center justify-center text-muted-foreground">
                  Integration UI Placeholder
                </div>
              </div>

               <div className="flex flex-col md:flex-row-reverse gap-8 items-center">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground font-bold">2</span>
                    <h3 className="text-2xl font-bold">AI analyzes the data</h3>
                  </div>
                  <p className="text-muted-foreground pl-12">
                    We process thousands of messages in seconds, clustering similar requests and identifying trends.
                  </p>
                </div>
                <div className="flex-1 bg-muted rounded-xl h-48 w-full flex items-center justify-center text-muted-foreground">
                  Analysis UI Placeholder
                </div>
              </div>

               <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground font-bold">3</span>
                    <h3 className="text-2xl font-bold">Build what matters</h3>
                  </div>
                  <p className="text-muted-foreground pl-12">
                    Push prioritized features directly to Jira or Linear with full context attached.
                  </p>
                </div>
                <div className="flex-1 bg-muted rounded-xl h-48 w-full flex items-center justify-center text-muted-foreground">
                  Roadmap UI Placeholder
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-primary text-primary-foreground text-center px-4">
          <div className="container mx-auto max-w-2xl space-y-6">
            <h2 className="text-3xl font-bold">Ready to build better products?</h2>
            <p className="text-primary-foreground/80 text-lg">
              Join thousands of product teams making customer-centric decisions.
            </p>
            <Button size="lg" variant="secondary" asChild className="mt-4">
              <Link href="/sign-up">Start Your Free Trial</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="py-8 border-t bg-muted/20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© 2024 PM Analyzer. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-foreground">Privacy</Link>
            <Link href="#" className="hover:text-foreground">Terms</Link>
            <Link href="#" className="hover:text-foreground">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
