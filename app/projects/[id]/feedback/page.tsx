import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus, FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
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

// In a real application, this would import the full FeedbackList component
function MockFeedbackList({ feedbacks }: { feedbacks: any[] }) {
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
            <div className="grid gap-3">
                {feedbacks.slice(0, 10).map(f => (
                    <Card key={f.id} className="p-4">
                        <p className="font-medium line-clamp-1">{f.text}</p>
                        <p className="text-sm text-gray-500">Source: {f.source || 'N/A'} | Status: {f.status}</p>
                    </Card>
                ))}
            </div>
            {feedbacks.length > 10 && <p className="text-sm text-gray-500">...and {feedbacks.length - 10} more items.</p>}
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
    take: 50,
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
        <MockFeedbackList feedbacks={feedbacks} />

      </div>
    </div>
  );
}
