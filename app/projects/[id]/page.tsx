import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BarChart2, Settings, Code, Upload, Terminal, Info, Zap, Scale, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FeedbackUploader } from "@/components/FeedbackUploader";
import { FeedbackList } from "@/components/FeedbackList";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// This is a server component
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
        select: { feedback: true, analyses: true, decisions: true },
      },
      feedbackJobs: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      }
    },
  });

  if (!project) {
    notFound();
  }

  // Get integration status
  const hasGitHub = !!project.githubRepo;
  const hasSentry = !!project.sentryOrg;

  return (
    <div className="container mx-auto py-10 px-4 space-y-10">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-zinc-500 text-sm mb-1 dark:text-zinc-400">
            <Link href="/dashboard" className="hover:text-zinc-900 dark:hover:text-zinc-50 flex items-center gap-1 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Dashboard
            </Link>
            <span className="text-zinc-300 dark:text-zinc-700">/</span>
            <span className="font-medium text-zinc-700 dark:text-zinc-300">{project.name}</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">{project.name}</h1>
          {project.description && (
            <p className="text-xl text-zinc-500 dark:text-zinc-400">{project.description}</p>
          )}
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          <Button variant="outline" asChild>
            <Link href={`/projects/${id}/analysis`}>
              <BarChart2 /> Analysis
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/projects/${id}/decisions`}>
              <Scale /> Decisions ({project._count.decisions})
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/projects/${id}/embed`}>
              <Code /> Embed Widget
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/projects/${id}/settings`}>
              <Settings /> Settings
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/projects/${id}/feedback/new`}>
              <PlusCircle /> Add Feedback
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats and Quick Actions (Moved below header) */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <CardHeader className="p-0">
            <CardTitle className="text-2xl font-bold">{project._count?.feedback || 0}</CardTitle>
            <CardDescription>Total Feedback</CardDescription>
          </CardHeader>
        </Card>

        <Card className="p-6">
          <CardHeader className="p-0">
            <CardTitle className="text-2xl font-bold">{project._count?.analyses || 0}</CardTitle>
            <CardDescription>Analyses Performed</CardDescription>
          </CardHeader>
        </Card>

        <Card className="p-6">
          <CardHeader className="p-0">
            <CardTitle className="text-2xl font-bold">{project._count?.decisions || 0}</CardTitle>
            <CardDescription>Decisions Made</CardDescription>
          </CardHeader>
        </Card>
        
        <Card className="p-6">
          <CardHeader className="p-0">
            <CardTitle className="text-2xl font-bold">
              {project.feedbackJobs[0]?.status || "N/A"}
            </CardTitle>
            <CardDescription>Last Job Status</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Integration Status */}
      <div className="flex gap-3 flex-wrap">
        {hasGitHub && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm border border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-800">
            <Zap className="w-3 h-3" />
            GitHub Connected
          </span>
        )}
        {hasSentry && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm border border-purple-200 dark:bg-purple-900 dark:text-purple-300 dark:border-purple-800">
            <Zap className="w-3 h-3" />
            Sentry Connected
          </span>
        )}
        {!hasGitHub && !hasSentry && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm border border-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
            <Info className="w-3 h-3" />
            No Integrations
          </span>
        )}
      </div>

      {/* Workflow Info (Polished) */}
      <Card className="p-6 border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800 shadow-sm">
        <div className="flex items-start gap-4">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200">
              Human-in-the-Loop Workflow
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              PM Analyzer generates product specs from customer feedback. Engineers use the generated specs in their IDE (Cursor, VS Code, etc.) to accelerate implementation. This keeps humans in control while eliminating tedious handoff steps.
            </p>
            <div className="flex gap-2 mt-4">
              <Button size="sm" variant="outline" className="text-blue-700 border-blue-300 bg-white hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800 dark:border-blue-700" asChild>
                <a href="https://github.com/Fresh-Industries/pm-analyzer#workflow" target="_blank" rel="noopener noreferrer">
                  <Terminal /> Documentation
                </a>
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-10 md:grid-cols-3">
        {/* Main Content - Feedback List */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold tracking-tight">Recent Feedback</h2>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              Showing top 50
            </span>
          </div>
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
                  githubPrUrl: true,
                  githubIssueUrl: true,
                  sentryIssueId: true,
                  sentryIssueUrl: true,
                  errorFrequency: true,
                  spec: true,
                  pageUrl: true,
                  browserInfo: true,
                  shippedAt: true,
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
              shippedAt: item.shippedAt ? item.shippedAt.toISOString() : null,
            }))}
          />
        </div>

        {/* Sidebar - Import & How-To */}
        <div className="md:col-span-1 space-y-8">
          <Card className="p-6 space-y-4">
            <CardTitle className="text-xl font-semibold">Import Feedback</CardTitle>
            <CardDescription>
              Upload a CSV file or add single items manually.
            </CardDescription>
            <FeedbackUploader projectId={id} />
          </Card>
          
          <Card className="p-6 space-y-4">
            <CardTitle className="text-xl font-semibold">Quick Actions</CardTitle>
            <div className="grid gap-3">
              <Button variant="outline" className="w-full justify-start text-left pl-4" asChild>
                <Link href={`/projects/${id}/feedback/new`}>
                  <Upload /> Submit Manual Feedback
                </Link>
              </Button>
              {hasSentry && (
                <Button variant="outline" className="w-full justify-start text-left pl-4">
                  <Zap /> Sync Sentry Issues
                </Button>
              )}
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <CardTitle className="text-xl font-semibold">The PM Analyzer Flow</CardTitle>
            <ol className="text-sm text-zinc-500 dark:text-zinc-400 space-y-3">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-full font-bold text-xs shrink-0 mt-0.5">1</span>
                <span>Collect feedback via widget, CSV, or Sentry integration.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-full font-bold text-xs shrink-0 mt-0.5">2</span>
                <span>AI analyzes and clusters feedback into themes & generates specs.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-full font-bold text-xs shrink-0 mt-0.5">3</span>
                <span>Product Manager makes a data-backed Decision.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-full font-bold text-xs shrink-0 mt-0.5">4</span>
                <span>Engineer clicks "Copy for Cursor" to get implementation plan.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-full font-bold text-xs shrink-0 mt-0.5">5</span>
                <span>Create PR/Merge, and PM Analyzer tracks the feature as shipped.</span>
              </li>
            </ol>
          </Card>
        </div>
      </div>
    </div>
  );
}
