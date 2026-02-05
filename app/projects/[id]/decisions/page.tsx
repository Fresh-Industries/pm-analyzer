import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus, CheckCircle, BrainCircuit, FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Assuming this exists

export const dynamic = "force-dynamic";

// Simple Component to render project navigation tabs
function ProjectTabs({ projectId, activeTab }: { projectId: string, activeTab: 'decisions' | 'feedback' }) {
    return (
        <Tabs value={activeTab} className="w-full">
            <TabsList>
                <TabsTrigger value="decisions" asChild>
                    <Link href={`/projects/${projectId}/decisions`} className="flex items-center gap-2">
                        <BrainCircuit className="w-4 h-4" /> Decisions
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

function getStatusBadge(status: string) {
  const styles: Record<string, string> = {
    draft: "bg-yellow-100 text-yellow-700",
    reviewed: "bg-blue-100 text-blue-700",
    sent: "bg-green-100 text-green-700",
  };
  return styles[status] || styles.draft;
}

export default async function DecisionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
  });

  if (!project) {
    notFound();
  }

  // Fetching the updated decision model fields
  const decisions = await prisma.decision.findMany({
    where: { projectId: id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-10 px-4 space-y-8">
        {/* Header - Simplified */}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-gray-900">
            {project.name}
          </h1>
          {project.description && (
            <p className="text-gray-500">{project.description}</p>
          )}
        </div>

        {/* Tabs for Navigation */}
        <ProjectTabs projectId={id} activeTab="decisions" />

        {/* Decisions Header */}
        <div className="flex items-center justify-between pt-4">
            <h2 className="text-2xl font-semibold text-gray-900">Decisions List</h2>
            {/* The old decision flow had a separate New Decision page. 
                In the AI workflow, the primary action is uploading feedback, 
                but keeping a manual "Generate" for overrides as per requirement. */}
            <Button asChild variant="outline">
                <Link href={`/projects/${id}/decisions/new`}>
                    <Plus className="w-4 h-4 mr-2" /> Generate New Decision
                </Link>
            </Button>
        </div>


        {/* Decisions List */}
        {decisions.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
            <BrainCircuit className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No decisions yet</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              Upload feedback or manually generate a decision to begin the process.
            </p>
            <Button asChild>
              <Link href={`/projects/${id}/feedback/new`}>Upload Feedback</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {decisions.map((decision) => (
              <Link key={decision.id} href={`/projects/${id}/decisions/${decision.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className={`w-4 h-4 ${decision.status === 'sent' ? 'text-green-500' : 'text-gray-500'}`} />
                          <h3 className="font-semibold text-lg text-gray-900">
                            {decision.title}
                          </h3>
                        </div>
                        <p className="text-gray-600 line-clamp-2">
                          {decision.summary}
                        </p>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <Badge className={getStatusBadge(decision.status)}>
                            {decision.status.toUpperCase().replace("_", " ")}
                          </Badge>
                          <Badge variant="secondary">
                            {decision.confidence} confidence
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {new Date(decision.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end text-sm text-gray-500">
                        <span>
                            {decision.linkedFeedbackIds?.length || 0} items linked
                        </span>
                        <ArrowRight className="w-4 h-4 mt-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
