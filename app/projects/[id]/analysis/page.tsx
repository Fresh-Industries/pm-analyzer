import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BrainCircuit, AlertTriangle, TrendingUp, Target, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PriorityMatrix } from "@/components/PriorityMatrix";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface OpportunityItem {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  impactScore: number;
  feedbackCount: number;
  category: string;
}

export default async function AnalysisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = await params;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      _count: { select: { feedback: true } },
      analyses: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!project) {
    notFound();
  }

  // Fetch latest analysis
  const analysis = project.analyses[0];

  if (!analysis) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link href={`/projects/${projectId}`} className="hover:text-gray-900 flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back to {project.name}
          </Link>
        </div>
        <Card className="text-center py-12">
          <CardContent>
            <BrainCircuit className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No analysis yet</h3>
            <p className="text-gray-500 mb-4">
              Add feedback and run analysis to see opportunities prioritized by impact and effort.
            </p>
            <Button asChild>
              <Link href={`/projects/${projectId}`}>
                Return to Project
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Parse analysis content
  const analysisContent = analysis.content as {
    feedbackCount: number;
    summary: { bugs: number; features: number; other: number };
    opportunities: Array<{
      id: string;
      title: string;
      description: string;
      impact: string;
      impactScore: number;
      feedbackCount: number;
      category: string;
    }>;
    unclusteredCount: number;
    generatedAt: string;
  };

  const opportunities: OpportunityItem[] = analysisContent.opportunities.map((opp) => ({
    id: opp.id,
    title: opp.title,
    description: opp.description,
    impact: opp.impact as 'high' | 'medium' | 'low',
    effort: opp.impactScore >= 0.7 ? 'high' : opp.impactScore >= 0.4 ? 'medium' : 'low',
    impactScore: opp.impactScore,
    feedbackCount: opp.feedbackCount,
    category: opp.category,
  }));

  // Sort by impact score descending
  opportunities.sort((a, b) => b.impactScore - a.impactScore);

  return (
    <div className="container mx-auto py-10 px-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href={`/projects/${projectId}`} className="hover:text-gray-900 flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Back to {project.name}
            </Link>
          </div>
          <h1 className="text-3xl font-semibold text-gray-900 flex items-center gap-2">
            <BrainCircuit className="w-7 h-7 text-purple-600" />
            AI Analysis
          </h1>
          <p className="text-gray-500">
            Generated {new Date(analysisContent.generatedAt).toLocaleString()}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href={`/projects/${projectId}/decisions/new`}>
            <Target className="w-4 h-4 mr-2" />
            Create Decision
          </Link>
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{analysisContent.feedbackCount}</p>
              <p className="text-sm text-gray-500">Total Feedback</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{analysisContent.summary.bugs}</p>
              <p className="text-sm text-gray-500">Bugs Reported</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{analysisContent.summary.features}</p>
              <p className="text-sm text-gray-500">Feature Requests</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Zap className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{opportunities.length}</p>
              <p className="text-sm text-gray-500">Opportunities</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="matrix" className="space-y-4">
        <TabsList>
          <TabsTrigger value="matrix" className="flex items-center gap-2">
            <Target className="w-4 h-4" /> Priority Matrix
          </TabsTrigger>
          <TabsTrigger value="opportunities" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> All Opportunities
          </TabsTrigger>
          <TabsTrigger value="unclustered" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Unclustered ({analysisContent.unclusteredCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="matrix">
          <Card>
            <CardHeader>
              <CardTitle>Eisenhower Priority Matrix</CardTitle>
              <CardDescription>
                Prioritize opportunities by Impact (customer value) vs Effort (engineering cost)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PriorityMatrix items={opportunities} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="opportunities">
          <Card>
            <CardHeader>
              <CardTitle>All Opportunities</CardTitle>
              <CardDescription>
                Ranked by impact score — opportunities with the highest customer value first
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {opportunities.map((opp, index) => (
                  <div
                    key={opp.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm text-gray-500">#{index + 1}</span>
                          <Badge variant="secondary">{opp.category}</Badge>
                          <Badge
                            variant={opp.impact === 'high' ? 'default' : 'outline'}
                            className={opp.impact === 'high' ? 'bg-green-100 text-green-700' : ''}
                          >
                            {opp.impact} impact
                          </Badge>
                          <Badge variant="outline">
                            {opp.feedbackCount} votes
                          </Badge>
                        </div>
                        <h4 className="font-semibold text-lg">{opp.title}</h4>
                        <p className="text-gray-600 mt-1">{opp.description}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-purple-600">
                            {Math.round(opp.impactScore * 100)}%
                          </div>
                          <p className="text-sm text-gray-500">impact score</p>
                        </div>
                        <Button size="sm" asChild>
                          <Link href={`/projects/${projectId}/decisions/new`}>
                            <Target className="w-4 h-4 mr-1" />
                            Create Decision
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {opportunities.length === 0 && (
                  <p className="text-center text-gray-500 py-8">
                    No opportunities identified yet. Add more feedback and re-run analysis.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unclustered">
          <Card>
            <CardHeader>
              <CardTitle>Unclustered Feedback</CardTitle>
              <CardDescription>
                {analysisContent.unclusteredCount} feedback items couldn't be grouped into themes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 text-center py-8">
                Unclustered feedback details would appear here with options to:
              </p>
              <ul className="text-sm text-gray-600 space-y-2 mt-4">
                <li>• Review each item manually</li>
                <li>• Add them to existing opportunities</li>
                <li>• Create new opportunities from them</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
