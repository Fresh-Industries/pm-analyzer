import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Plus, CheckCircle, Clock, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function getStatusIcon(status: string) {
  switch (status) {
    case "handed_off":
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case "finalized":
      return <Clock className="w-4 h-4 text-blue-500" />;
    default:
      return <FileText className="w-4 h-4 text-gray-500" />;
  }
}

function getStatusBadge(status: string) {
  const styles: Record<string, string> = {
    draft: "bg-gray-100 text-gray-700",
    finalized: "bg-blue-100 text-blue-700",
    handed_off: "bg-green-100 text-green-700",
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

  const decisions = await prisma.decision.findMany({
    where: { projectId: id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-10 px-4 space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Link href={`/projects/${id}`} className="hover:text-gray-900 flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" /> Back
              </Link>
              <span>/</span>
              <span>{project.name}</span>
            </div>
            <h1 className="text-3xl font-semibold text-gray-900">Decisions</h1>
            <p className="text-gray-500">
              Track your product decisions and handoffs
            </p>
          </div>
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href={`/projects/${id}/decisions/new`}>
              <Plus className="w-4 h-4 mr-2" /> New Decision
            </Link>
          </Button>
        </div>

        {/* Decisions List */}
        {decisions.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No decisions yet</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              Create your first decision to track product choices and hand off work to engineering.
            </p>
            <Button asChild>
              <Link href={`/projects/${id}/decisions/new`}>Create Decision</Link>
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
                          {getStatusIcon(decision.status)}
                          <h3 className="font-semibold text-lg text-gray-900">
                            {decision.title}
                          </h3>
                        </div>
                        <p className="text-gray-600 line-clamp-2">
                          {decision.summary}
                        </p>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <Badge className={getStatusBadge(decision.status)}>
                            {decision.status.replace("_", " ")}
                          </Badge>
                          <Badge variant="outline">
                            {decision.confidence} confidence
                          </Badge>
                          <span>
                            {new Date(decision.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        {decision.linkedFeedbackIds?.length || 0} items linked
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
