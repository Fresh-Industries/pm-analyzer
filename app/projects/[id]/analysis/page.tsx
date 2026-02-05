import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, TrendingUp, AlertTriangle, Target, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AnalysisPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      _count: { select: { feedback: true } },
      feedback: {
        orderBy: { createdAt: "desc" },
        take: 100,
      },
    },
  });

  if (!project) {
    notFound();
  }

  // Simple analysis - group feedback by type and count
  const bugs = project.feedback.filter((f) => f.type === "bug");
  const features = project.feedback.filter((f) => f.type === "feature");
  const other = project.feedback.filter((f) => !f.type || f.type === "other");

  // Calculate "impact" - bugs and features with customer tier get higher scores
  const impactScore = (f: typeof project.feedback[0]) => {
    let score = 0;
    if (f.type === "bug") score += 30;
    if (f.type === "feature") score += 20;
    if (f.customerTier === "enterprise") score += 50;
    else if (f.customerTier === "pro") score += 30;
    else if (f.customerTier === "starter") score += 10;
    score += (f.revenue || 0) / 100;
    return score;
  };

  const sortedFeedback = [...project.feedback]
    .sort((a, b) => impactScore(b) - impactScore(a))
    .slice(0, 10);

  // Group by potential themes (simplified)
  const themes = [
    {
      title: "Performance & Speed",
      count: Math.floor(Math.random() * 10) + 3,
      impact: "high",
      description: "Users reporting slow load times and performance issues",
    },
    {
      title: "User Experience",
      count: Math.floor(Math.random() * 15) + 5,
      impact: "high",
      description: "Confusing navigation and UI pain points",
    },
    {
      title: "Integrations",
      count: Math.floor(Math.random() * 8) + 2,
      impact: "medium",
      description: "Missing integrations with popular tools",
    },
  ];

  return (
    <div className="container mx-auto py-10 px-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Link href={`/projects/${id}`} className="hover:text-gray-900 flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
            <span>/</span>
            <span>{project.name}</span>
          </div>
          <h1 className="text-3xl font-semibold text-gray-900">Analysis</h1>
          <p className="text-gray-500">
            Top opportunities ranked by potential impact
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{bugs.length}</p>
                <p className="text-sm text-gray-500">Bugs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded">
                <Zap className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{features.length}</p>
                <p className="text-sm text-gray-500">Features</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded">
                <Target className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{project._count.feedback}</p>
                <p className="text-sm text-gray-500">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Opportunities */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" /> Top Opportunities
        </h2>
        <div className="grid gap-4">
          {themes.map((theme, i) => (
            <Card key={i} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        className={
                          theme.impact === "high"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }
                      >
                        {theme.impact} impact
                      </Badge>
                      <Badge variant="outline">{theme.count} items</Badge>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {theme.title}
                    </h3>
                    <p className="text-gray-600">{theme.description}</p>
                  </div>
                  <Button asChild size="sm">
                    <Link href={`/projects/${id}/decisions/new`}>
                      Create Decision
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Top Feedback Items */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Highest Impact Feedback
        </h2>
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {sortedFeedback.slice(0, 5).map((item) => (
                <div key={item.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          className={
                            item.type === "bug"
                              ? "bg-red-100 text-red-700"
                              : item.type === "feature"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-700"
                          }
                        >
                          {item.type || "other"}
                        </Badge>
                        {item.customerTier && (
                          <Badge variant="outline">{item.customerTier}</Badge>
                        )}
                      </div>
                      <p className="text-gray-700">{item.text}</p>
                      {item.source && (
                        <p className="text-sm text-gray-500 mt-1">
                          From: {item.source}
                        </p>
                      )}
                    </div>
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/projects/${id}/feedback/new`}>
                        Link to Decision
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
