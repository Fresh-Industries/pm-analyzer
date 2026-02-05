import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, Share2, TrendingUp, AlertCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { ThemeCluster } from "@/components/ThemeCluster";
import { PriorityMatrix } from "@/components/PriorityMatrix";

function generateAnalysis(feedback: any[]) {
  const bugs = feedback.filter((f: any) => f.type?.toLowerCase() === "bug");
  const features = feedback.filter((f: any) => f.type?.toLowerCase() === "feature");

  const keywordCounts: Record<string, number> = {};
  feedback.forEach((f: any) => {
    const words = (f.text || "")
      .toLowerCase()
      .split(/\s+/)
      .map((w: string) => w.replace(/[^a-z0-9]/g, ""));
    const stopWords = [
      "the",
      "a",
      "an",
      "is",
      "are",
      "was",
      "were",
      "i",
      "it",
      "to",
      "for",
      "and",
      "of",
      "in",
      "on",
      "with",
      "this",
      "that",
      "be",
      "or",
      "but",
      "my",
      "if",
      "we",
      "just",
      "can",
      "not",
    ];
    words.forEach((word: string) => {
      if (word.length > 3 && !stopWords.includes(word) && !word.match(/^\d+$/)) {
        keywordCounts[word] = (keywordCounts[word] || 0) + 1;
      }
    });
  });

  const themes = Object.entries(keywordCounts)
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, count], i) => ({
      id: String(i + 1),
      name: name.charAt(0).toUpperCase() + name.slice(1),
      count,
      sentiment: (count > 10
        ? "negative"
        : count > 5
        ? "neutral"
        : "positive") as "positive" | "neutral" | "negative",
      keywords: [name, "related", "terms"].slice(0, 3),
    }));

  const priorityItems = features
    .sort((a: any, b: any) => (b.revenue || 0) - (a.revenue || 0))
    .slice(0, 5)
    .map((f: any, i: number) => {
      let impact: "low" | "medium" | "high" = "low";
      if (f.customerTier === "Enterprise" || f.type === "bug") impact = "high";
      else if (f.customerTier === "Pro") impact = "medium";
      const effort: "low" | "medium" | "high" = i % 3 === 0 ? "low" : i % 3 === 1 ? "medium" : "high";
      return {
        id: f.id,
        title: f.text.substring(0, 50) + (f.text.length > 50 ? "..." : ""),
        impact,
        effort,
      } as const;
    });

  return {
    themes,
    priorityItems,
    stats: { bugs: bugs.length, features: features.length, total: feedback.length },
  };
}

export const dynamic = "force-dynamic";

export default async function AnalysisPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) notFound();

  const rawFeedback = await prisma.feedback.findMany({
    where: { projectId: id },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const storedThemes = await prisma.theme.findMany({
    where: { projectId: id },
    orderBy: { createdAt: "desc" },
  });

  const baseAnalysis = generateAnalysis(rawFeedback);

  const themes = storedThemes.length
    ? storedThemes.map((theme) => {
        const count = rawFeedback.filter((f) =>
          f.text.toLowerCase().includes(theme.title.toLowerCase())
        ).length;
        return {
          id: theme.id,
          name: theme.title,
          count: count || 1,
          sentiment: count > 5 ? "negative" : count > 2 ? "neutral" : "positive",
          keywords: (theme.description || theme.title).split(/\s+/).slice(0, 3),
        } as const;
      })
    : baseAnalysis.themes;

  const { priorityItems, stats } = baseAnalysis;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <div className="container mx-auto py-12 px-4 space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-zinc-500 text-sm">
              <Link
                href={`/projects/${id}`}
                className="hover:text-zinc-900 dark:hover:text-zinc-50 flex items-center gap-1 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Project
              </Link>
              <span className="text-zinc-300 dark:text-zinc-700">/</span>
              <span className="font-medium text-zinc-700 dark:text-zinc-300">{project.name}</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight">Product Analysis</h1>
            <p className="text-lg text-zinc-500 dark:text-zinc-400">
              AI-generated insights from {stats.total} feedback items
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Share2 /> Share
            </Button>
            <Button>
              <Download /> Export
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6">
            <CardContent className="p-0">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
                  <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{stats.total}</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Total Feedback</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="p-6">
            <CardContent className="p-0">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-xl">
                  <Sparkles className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{stats.features}</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Feature Requests</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="p-6">
            <CardContent className="p-0">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-100 dark:bg-red-900 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{stats.bugs}</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Bug Reports</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="md:col-span-2 p-6">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-2xl font-semibold">Top Feedback Themes</CardTitle>
              <CardDescription>Clustered topics from real customer feedback.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {themes.length === 0 ? (
                <div className="text-center py-12 text-zinc-400 border-2 border-dashed rounded-xl">
                  Add feedback to see theme analysis.
                </div>
              ) : (
                <ThemeCluster themes={themes} />
              )}
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-2xl font-semibold">Priority Matrix</CardTitle>
              <CardDescription>Impact vs effort mapping from user signals.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {priorityItems.length === 0 ? (
                <div className="text-center py-12 text-zinc-400 border-2 border-dashed rounded-xl">
                  Feature requests will appear here.
                </div>
              ) : (
                <PriorityMatrix items={priorityItems} />
              )}
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-2xl font-semibold">AI Recommendations</CardTitle>
              <CardDescription>Next best steps to maximize impact.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {stats.total === 0 ? (
                <div className="text-center py-12 text-zinc-400 border-2 border-dashed rounded-xl">
                  Add feedback to unlock recommendations.
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.bugs > 3 && (
                    <div className="p-4 bg-red-50 dark:bg-red-950 rounded-xl border border-red-100 dark:border-red-900">
                      <p className="text-sm font-medium text-red-900 dark:text-red-300">
                        🚨 High bug volume detected
                      </p>
                      <p className="text-xs text-red-700 dark:text-red-400 mt-1">
                        {stats.bugs} bug reports this period. Prioritize fixes for top issues.
                      </p>
                    </div>
                  )}
                  {stats.features > 5 && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-xl border border-blue-100 dark:border-blue-900">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                        💡 Strong feature demand
                      </p>
                      <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                        {stats.features} feature requests. Focus on Quick Wins in the matrix.
                      </p>
                    </div>
                  )}
                  <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      🔗 Next step: Create a Decision
                    </p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                      Use these insights to finalize a decision and hand off to engineering.
                    </p>
                    <Button size="sm" className="mt-2">Create Decision</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
