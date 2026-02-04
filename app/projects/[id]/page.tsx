import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BarChart2, Settings, Code, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeedbackUploader } from "@/components/FeedbackUploader";
import { FeedbackList } from "@/components/FeedbackList";
import { JobStatus } from "@/components/JobStatus";
import { getProject } from "@/lib/api";

// This is a server component
export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let project;
  try {
    project = await getProject(id);
  } catch (e) {
    notFound();
  }

  // Get integration status
  const hasGitHub = !!project.githubRepo;
  const hasSentry = !!project.sentryOrg;

  return (
    <div className="container mx-auto py-10 px-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Link href="/dashboard" className="hover:text-foreground flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Dashboard
            </Link>
            <span>/</span>
            <span>{project.name}</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
          {project.description && (
            <p className="text-muted-foreground">{project.description}</p>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" asChild>
            <Link href={`/projects/${id}/analysis`}>
              <BarChart2 className="mr-2 h-4 w-4" /> Analysis
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/projects/${id}/embed`}>
              <Code className="mr-2 h-4 w-4" /> Embed Widget
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/projects/${id}/settings`}>
              <Settings className="mr-2 h-4 w-4" /> Settings
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/projects/${id}/feedback/new`}>
              <Upload className="mr-2 h-4 w-4" /> Add Feedback
            </Link>
          </Button>
        </div>
      </div>

      {/* Integration Status */}
      <div className="flex gap-3 flex-wrap">
        {hasGitHub && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm border border-green-200">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            GitHub Connected
          </span>
        )}
        {hasSentry && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm border border-purple-200">
            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
            Sentry Connected
          </span>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content - Feedback List */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Feedback</h2>
            <span className="text-sm text-muted-foreground">
              {project._count?.feedback || 0} items
            </span>
          </div>
          <FeedbackList feedbacks={[]} />
        </div>

        {/* Sidebar - Upload & Status */}
        <div className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Import Feedback</h2>
            <FeedbackUploader projectId={id} />
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Quick Actions</h2>
            <div className="grid gap-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href={`/projects/${id}/feedback/new`}>
                  <Upload className="mr-2 h-4 w-4" /> Submit Manual Feedback
                </Link>
              </Button>
              {hasSentry && (
                <Button variant="outline" className="w-full justify-start">
                  <span className="mr-2">⚡</span> Sync Sentry Issues
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Processing Jobs</h2>
            <div className="text-sm text-muted-foreground border rounded-lg p-4 bg-muted/20">
              Recent uploads and processing status will appear here.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
