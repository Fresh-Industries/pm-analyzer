import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

function getStatusBadgeClass(status: string) {
  switch (status) {
    case 'finalized':
      return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
    case 'handed_off':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
    case 'draft':
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-100';
  }
}

function getConfidenceBadgeClass(confidence: string) {
  switch (confidence.toLowerCase()) {
    case 'high':
      return 'bg-green-500 hover:bg-green-600 text-white dark:bg-green-600 dark:hover:bg-green-700';
    case 'medium':
      return 'bg-yellow-500 hover:bg-yellow-600 text-white dark:bg-yellow-600 dark:hover:bg-yellow-700';
    case 'low':
    default:
      return 'bg-red-500 hover:bg-red-600 text-white dark:bg-red-600 dark:hover:bg-red-700';
  }
}

export default async function DecisionsPage({ params }: { params: { id: string } }) {
  const projectId = params.id;
  
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, name: true },
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
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Link href={`/projects/${projectId}`} className="hover:text-foreground flex items-center gap-1 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Project
            </Link>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Decisions: {project.name}</h1>
          <p className="text-muted-foreground">
            Key product decisions made based on aggregated feedback.
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Create Decision
        </Button>
      </div>

      {/* Decision List */}
      <div className="space-y-4">
        {decisions.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed rounded-2xl text-muted-foreground bg-gray-50/50 dark:bg-zinc-800/50">
            <p className="text-lg font-medium mb-2">No Decisions Yet</p>
            <p className="text-sm">Start by analyzing your feedback and creating a new decision.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {decisions.map((decision) => (
              <Card key={decision.id} className="p-6">
                <CardHeader className="p-0 pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-medium">{decision.title}</CardTitle>
                    <div className="flex space-x-2">
                      <Badge className={getStatusBadgeClass(decision.status)}>
                        {decision.status.replace(/_/g, ' ')}
                      </Badge>
                      <Badge className={getConfidenceBadgeClass(decision.confidence)}>
                        {decision.confidence} Confidence
                      </Badge>
                    </div>
                  </div>
                  <CardDescription className="text-sm text-zinc-500 dark:text-zinc-400">
                     Created: {new Date(decision.createdAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0 space-y-3">
                  <p className="text-base text-zinc-700 dark:text-zinc-300 line-clamp-3">
                    {decision.summary}
                  </p>
                  <Button variant="link" className="p-0 h-auto text-blue-600 dark:text-blue-400 hover:no-underline">
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
