
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeedbackUploader } from "@/components/FeedbackUploader";
import { FeedbackList } from "@/components/FeedbackList";
import { JobStatus } from "@/components/JobStatus";
import { getProject } from "@/lib/api";

// This is a server component
export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  let project;
  try {
    project = await getProject(id);
  } catch (e) {
    notFound();
  }

  return (
    <div className="container mx-auto py-10 px-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Link href="/" className="hover:text-foreground flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Projects
            </Link>
            <span>/</span>
            <span>{project.name}</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
          {project.description && (
            <p className="text-muted-foreground">{project.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/projects/${id}/analysis`}>
              <BarChart2 className="mr-2 h-4 w-4" /> View Analysis
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/projects/${id}/feedback/new`}>
              + Add Feedback
            </Link>
          </Button>
        </div>
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
          {/* 
            In a real app, we'd fetch feedback here or pass it down. 
            For this deliverable, passing empty array or mock if API doesn't return it yet.
            The `getProject` type implies _count, but not list.
            I'll assume `project` object *might* contain feedback or we mock it for the view.
          */}
          <FeedbackList feedbacks={[]} /> 
        </div>

        {/* Sidebar - Upload & Status */}
        <div className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Import Feedback</h2>
            <FeedbackUploader projectId={id} />
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Processing Jobs</h2>
            {/* 
              This would ideally list recent jobs. 
              Since we don't have job state persistence in this view (only after upload),
              I'll add a placeholder or conditional render if client-side state existed.
              For now, the uploader handles the immediate job status feedback.
            */}
            <div className="text-sm text-muted-foreground border rounded-lg p-4 bg-muted/20">
              Recent uploads and processing status will appear here.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
