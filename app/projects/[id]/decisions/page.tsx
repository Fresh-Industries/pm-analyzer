import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Scale, Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { DecisionExportDialog, type DecisionExportData } from "@/components/DecisionExportDialog";

export const dynamic = "force-dynamic";

export default async function DecisionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = await params;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { name: true },
  });

  if (!project) {
    notFound();
  }

  const decisions = await prisma.decision.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container mx-auto py-10 px-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Link
              href={`/projects/${projectId}`}
              className="hover:text-gray-900 flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" /> Back to {project.name}
            </Link>
          </div>
          <h1 className="text-3xl font-semibold text-gray-900">
            Decisions
          </h1>
          <p className="text-gray-500">
            {decisions.length} decision{decisions.length !== 1 ? "s" : ""} created
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button asChild size="sm">
            <Link href={`/projects/${projectId}/decisions/new`}>
              <Plus className="w-4 h-4 mr-2" />
              New Decision
            </Link>
          </Button>
        </div>
      </div>

      {/* Decisions List */}
      {decisions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Scale className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No decisions yet</h3>
            <p className="text-gray-500 mb-4">
              Analyze your feedback first to generate decisions.
            </p>
            <Button asChild>
              <Link href={`/projects/${projectId}/analysis`}>
                View Analysis
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {decisions.map((decision) => {
            const exportData: DecisionExportData = {
              id: decision.id,
              title: decision.title,
              summary: decision.summary,
              scope: decision.scope,
              nonGoals: decision.nonGoals,
              acceptanceCriteria: decision.acceptanceCriteria,
              risks: decision.risks,
              confidenceScore: decision.confidenceScore,
              linkedFeedbackIds: decision.linkedFeedbackIds,
              projectName: project.name,
            };

            return (
              <Card key={decision.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/projects/${projectId}/decisions/${decision.id}`}
                          className="hover:underline"
                        >
                          <h3 className="text-lg font-semibold">
                            {decision.title}
                          </h3>
                        </Link>
                        <Badge
                          variant={
                            decision.status === "handed_off"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {decision.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <p className="text-gray-600 line-clamp-2">
                        {decision.summary}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>
                          {Math.round(decision.confidenceScore * 100)}% confidence
                        </span>
                        <span>
                          {decision.linkedFeedbackIds.length} linked feedback
                          {decision.linkedFeedbackIds.length !== 1 ? "s" : ""}
                        </span>
                        <span>
                          Created {new Date(decision.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <DecisionExportDialog
                        decision={exportData}
                        trigger={
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-1" />
                            Export
                          </Button>
                        }
                      />
                      <Button variant="ghost" size="sm" asChild>
                        <Link
                          href={`/projects/${projectId}/decisions/${decision.id}`}
                        >
                          View
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
