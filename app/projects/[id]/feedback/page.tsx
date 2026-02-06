import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus, FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Assuming this exists
import FeedbackListClient from "./FeedbackListClient";

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
        <FeedbackListClient feedbacks={feedbacks} />

      </div>
    </div>
  );
}
