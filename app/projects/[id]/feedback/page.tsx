import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus, FileText, Upload, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Assuming this exists

export const dynamic = "force-dynamic";

// Simple Component to render project navigation tabs
function ProjectTabs({ projectId, activeTab }: { projectId: string, activeTab: 'decisions' | 'feedback' }) {
    return (
        <Tabs value={activeTab} className="w-full">
            <TabsList>
                <TabsTrigger value="decisions" asChild>
                    <Link href={`/projects/${projectId}/decisions`} className="flex items-center gap-2">
                        <Upload className="w-4 h-4" /> Decisions
                    </Link>
                </TabsTrigger>
                <TabsTrigger value="feedback" asChild>
                    <Link href={`/projects/${projectId}/feedback`} className="flex items-center gap-2">
                        <FileText className="w-4 h-4" /> Feedback
                    </Link>
                </TabsTrigger>
            </TabsList>
        </Tabs>
    );
}

function formatDate(value: Date | string | null | undefined) {
    if (!value) return "—";
    const date = typeof value === "string" ? new Date(value) : value;
    return date.toLocaleString();
}

function formatMoney(value: number | null | undefined) {
    if (value === null || value === undefined) return "—";
    if (Number.isNaN(value)) return "—";
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(value);
}

function FeedbackList({ feedbacks }: { feedbacks: any[] }) {
    if (feedbacks.length === 0) {
        return (
            <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No feedback ingested</h3>
                <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                    Use the upload page to send data to the analyzer.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">All Feedback ({feedbacks.length})</h3>
            <div className="grid gap-4">
                {feedbacks.map((f) => (
                    <Card key={f.id} className="p-5">
                        <div className="flex flex-col gap-3">
                            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-500">
                                        {formatDate(f.createdAt)}
                                    </p>
                                    <p className="text-base font-semibold text-gray-900">
                                        {f.text}
                                    </p>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    {f.type && (
                                        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                                            {f.type.toUpperCase()}
                                        </span>
                                    )}
                                    {f.status && (
                                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                                            {f.status.replace(/_/g, " ").toUpperCase()}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="grid gap-3 text-sm text-gray-700 md:grid-cols-2">
                                <div><span className="font-medium">Source:</span> {f.source || "—"}</div>
                                <div><span className="font-medium">Customer Tier:</span> {f.customerTier || "—"}</div>
                                <div><span className="font-medium">Revenue:</span> {formatMoney(f.revenue)}</div>
                                <div><span className="font-medium">Analysis Model:</span> {f.analysisModel || "—"}</div>
                                <div><span className="font-medium">Page URL:</span> {f.pageUrl || "—"}</div>
                                <div><span className="font-medium">Browser Info:</span> {f.browserInfo || "—"}</div>
                                <div><span className="font-medium">Error Frequency:</span> {f.errorFrequency ?? "—"}</div>
                                <div><span className="font-medium">Shipped At:</span> {formatDate(f.shippedAt)}</div>
                            </div>

                            {(f.githubIssueUrl || f.githubPrUrl || f.sentryIssueUrl) && (
                                <div className="flex flex-wrap items-center gap-3 text-sm">
                                    <span className="font-medium text-gray-700">Links:</span>
                                    {f.githubIssueUrl && (
                                        <a
                                            href={f.githubIssueUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
                                        >
                                            <LinkIcon className="h-4 w-4" /> GitHub Issue
                                        </a>
                                    )}
                                    {f.githubPrUrl && (
                                        <a
                                            href={f.githubPrUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
                                        >
                                            <LinkIcon className="h-4 w-4" /> GitHub PR
                                        </a>
                                    )}
                                    {f.sentryIssueUrl && (
                                        <a
                                            href={f.sentryIssueUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
                                        >
                                            <LinkIcon className="h-4 w-4" /> Sentry Issue
                                        </a>
                                    )}
                                </div>
                            )}

                            {f.spec && (
                                <details className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm">
                                    <summary className="cursor-pointer font-medium text-gray-700">
                                        View Generated Spec
                                    </summary>
                                    <pre className="mt-2 whitespace-pre-wrap text-xs text-gray-700">
                                        {JSON.stringify(f.spec, null, 2)}
                                    </pre>
                                </details>
                            )}
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}

export default async function FeedbackPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
  });

  if (!project) {
    notFound();
  }

  const feedbacks = await prisma.feedback.findMany({
    where: { projectId: id },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-10 px-4 space-y-8">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-gray-900">
            {project.name}
          </h1>
          {project.description && (
            <p className="text-gray-500">{project.description}</p>
          )}
        </div>

        {/* Tabs for Navigation */}
        <ProjectTabs projectId={id} activeTab="feedback" />

        {/* Feedback List Header */}
        <div className="flex items-center justify-between pt-4">
            <h2 className="text-2xl font-semibold text-gray-900">Raw Feedback</h2>
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href={`/projects/${id}/feedback/new`}>
                    <Plus className="w-4 h-4 mr-2" /> Upload New Evidence
                </Link>
            </Button>
        </div>

        {/* Feedback List */}
        <FeedbackList feedbacks={feedbacks} />

      </div>
    </div>
  );
}
