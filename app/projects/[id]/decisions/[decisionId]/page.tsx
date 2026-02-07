import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Scale, Download, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { DecisionExportDialog } from "@/components/DecisionExportDialog";

export const dynamic = "force-dynamic";

export default async function DecisionDetailPage({
  params,
}: {
  params: Promise<{ id: string; decisionId: string }>;
}) {
  const { id: projectId, decisionId } = await params;

  const decision = await prisma.decision.findUnique({
    where: { id: decisionId },
    include: {
      project: {
        select: { name: true },
      },
    },
  });

  if (!decision || decision.projectId !== projectId) {
    notFound();
  }

  const confidencePercent = Math.round(decision.confidenceScore * 100);
  const confidenceLevel =
    decision.confidenceScore >= 0.8
      ? "high"
      : decision.confidenceScore >= 0.6
        ? "medium"
        : "low";

  return (
    <div className="container mx-auto py-10 px-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Link
              href={`/projects/${projectId}`}
              className="hover:text-gray-900 flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" /> Back to {decision.project.name}
            </Link>
          </div>
          <h1 className="text-3xl font-semibold text-gray-900">
            {decision.title}
          </h1>
          <div className="flex items-center gap-3">
            <Badge
              variant={
                decision.status === "handed_off" ? "default" : "secondary"
              }
            >
              {decision.status.replace("_", " ")}
            </Badge>
            <Badge
              variant={
                confidenceLevel === "high"
                  ? "default"
                  : confidenceLevel === "medium"
                    ? "secondary"
                    : "destructive"
              }
              className="flex items-center gap-1"
            >
              {confidenceLevel === "high" ? (
                <CheckCircle className="w-3 h-3" />
              ) : (
                <AlertTriangle className="w-3 h-3" />
              )}
              {confidencePercent}% confidence
            </Badge>
          </div>
        </div>
        <DecisionExportDialog
          decision={{
            id: decision.id,
            title: decision.title,
            summary: decision.summary,
            scope: decision.scope,
            nonGoals: decision.nonGoals,
            acceptanceCriteria: decision.acceptanceCriteria,
            risks: decision.risks,
            confidenceScore: decision.confidenceScore,
            linkedFeedbackIds: decision.linkedFeedbackIds,
            projectName: decision.project.name,
          }}
        />
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 whitespace-pre-wrap">
            {decision.summary}
          </p>
        </CardContent>
      </Card>

      {/* Two column layout */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Scope */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Scale className="w-5 h-5" /> Scope
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">
              {decision.scope}
            </p>
          </CardContent>
        </Card>

        {/* Non-Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Out of Scope</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">
              {decision.nonGoals}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Acceptance Criteria */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Acceptance Criteria</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {decision.acceptanceCriteria
              .split("\n")
              .filter((line) => line.trim())
              .map((criteria, i) => (
                <li key={i} className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    className="mt-1.5 rounded border-gray-300"
                    readOnly
                  />
                  <span className="text-gray-700">{criteria.trim()}</span>
                </li>
              ))}
          </ul>
        </CardContent>
      </Card>

      {/* Risks */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" /> Risks
            & Considerations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 whitespace-pre-wrap">
            {decision.risks}
          </p>
        </CardContent>
      </Card>

      {/* Linked Feedback */}
      {decision.linkedFeedbackIds.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Linked Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              This decision addresses {decision.linkedFeedbackIds.length} customer
              feedback items.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {decision.linkedFeedbackIds.map((feedbackId) => (
                <Badge key={feedbackId} variant="outline">
                  {feedbackId}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
