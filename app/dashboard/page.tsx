import Link from "next/link";
import { ArrowRight, FileText, Plus, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const projects = await prisma.project.findMany({
    orderBy: { updatedAt: "desc" },
    take: 5,
  });

  const allDecisions = await prisma.decision.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { project: true },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-10 px-4 space-y-10">
        {/* Hero */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-semibold text-gray-900">
            Turn feedback into decisions
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Upload customer evidence. AI generates decisions. Ship faster.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2 max-w-2xl mx-auto">
          <Link href="/projects/new">
            <Card className="hover:shadow-md transition-all cursor-pointer h-full">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Plus className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">New Project</h3>
                  <p className="text-sm text-gray-500">Start tracking a product</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Card className="opacity-50 cursor-not-allowed">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">AI Analysis</h3>
                <p className="text-sm text-gray-500">Coming soon</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Decisions */}
        {allDecisions.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Recent Decisions
              </h2>
              {projects.length > 0 && (
                <Link href={`/projects/${projects[0].id}/decisions`}>
                  <Button variant="ghost" size="sm">
                    View all <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              )}
            </div>
            <div className="grid gap-3">
              {allDecisions.map((decision) => (
                <Link
                  key={decision.id}
                  href={`/projects/${decision.projectId}/decisions/${decision.id}`}
                >
                  <Card className="hover:shadow-md transition-all cursor-pointer">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded">
                          <FileText className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {decision.title}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {decision.project.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            decision.status === "handed_off"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {decision.status.replace("_", " ")}
                        </span>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Recent Projects */}
        {projects.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Projects</h2>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <Link key={project.id} href={`/projects/${project.id}`}>
                  <Card className="hover:shadow-md transition-all cursor-pointer h-full">
                    <CardHeader>
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {project.description || "No description"}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {projects.length === 0 && allDecisions.length === 0 && (
          <Card className="max-w-xl mx-auto">
            <CardContent className="p-10 text-center">
              <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Get started
              </h3>
              <p className="text-gray-500 mb-6">
                Create a project to start analyzing customer feedback.
              </p>
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href="/projects/new">Create Project</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
