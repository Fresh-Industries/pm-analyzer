import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Scale, FileText, BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FeedbackList } from "@/components/FeedbackList";
import { AnalyzeButton } from "@/components/AnalyzeButton";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      _count: {
        select: { feedback: true, decisions: true },
      },
      decisions: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      analyses: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!project) {
    notFound();
  }

  return (
    <div className="container mx-auto py-10 px-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Link href="/dashboard" className="hover:text-gray-900 flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Dashboard
            </Link>
            <span>/</span>
            <span className="font-medium text-gray-900">{project.name}</span>
          </div>
          <h1 className="text-3xl font-semibold text-gray-900">
            {project.name}
          </h1>
          {project.description && (
            <p className="text-gray-500">{project.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <AnalyzeButton projectId={id} />
          <Button asChild>
            <Link href={`/projects/${id}/feedback/new`}>
              <Plus className="w-4 h-4 mr-2" /> Add Feedback
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-blue-100 rounded">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{project._count.feedback}</p>
              <p className="text-sm text-gray-500">Feedback items</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-green-100 rounded">
              <Scale className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{project._count.decisions}</p>
              <p className="text-sm text-gray-500">Decisions</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-purple-100 rounded">
              <BrainCircuit className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold">
                {project.analyses.length > 0 ? "Done" : "Pending"}
              </p>
              <p className="text-sm text-gray-500">Analysis</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="decisions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="decisions" className="flex items-center gap-2">
            <Scale className="w-4 h-4" /> Decisions
          </TabsTrigger>
          <TabsTrigger value="feedback" className="flex items-center gap-2">
            <FileText className="w-4 h-4" /> Feedback
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <BrainCircuit className="w-4 h-4" /> Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="decisions">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Decisions</CardTitle>
              <Button asChild size="sm">
                <Link href={`/projects/${id}/decisions`}>
                  View all <Scale className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {project.decisions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">
                    No decisions yet. Analyze your feedback first!
                  </p>
                  <Button asChild>
                    <Link href={`/projects/${id}/analysis`}>
                      <BrainCircuit className="w-4 h-4 mr-2" />
                      View Analysis
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {project.decisions.map((decision) => (
                    <Link
                      key={decision.id}
                      href={`/projects/${id}/decisions/${decision.id}`}
                    >
                      <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{decision.title}</h4>
                            <p className="text-sm text-gray-500 line-clamp-1">
                              {decision.summary}
                            </p>
                          </div>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              decision.status === "handed_off"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {decision.status.replace("_", " ")}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback">
          <FeedbackList
            feedbacks={(
              await prisma.feedback.findMany({
                where: { projectId: id },
                orderBy: { createdAt: "desc" },
                take: 50,
                select: {
                  id: true,
                  text: true,
                  source: true,
                  type: true,
                  customerTier: true,
                  revenue: true,
                  status: true,
                  spec: true,
                  projectId: true,
                  createdAt: true,
                  updatedAt: true,
                },
              })
            ).map((item) => ({
              ...item,
              type: item.type === "bug" || item.type === "feature" ? item.type : null,
              createdAt: item.createdAt.toISOString(),
              updatedAt: item.updatedAt.toISOString(),
            }))}
          />
        </TabsContent>

        <TabsContent value="analysis">
          <Card>
            <CardHeader>
              <CardTitle>AI Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              {project.analyses.length === 0 ? (
                <div className="text-center py-8">
                  <BrainCircuit className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No analysis yet
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Click "Analyze" to cluster feedback and find opportunities.
                  </p>
                  <AnalyzeButton projectId={id} />
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    Analysis completed at{" "}
                    {new Date(
                      project.analyses[0].createdAt
                    ).toLocaleString()}
                  </p>
                  <Button asChild className="mt-4">
                    <Link href={`/projects/${id}/analysis`}>
                      View Analysis Results
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
