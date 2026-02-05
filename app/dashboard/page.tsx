import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/ProjectCard";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { feedback: true },
      },
    },
  });

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <div className="container mx-auto py-12 px-4 space-y-10">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">Projects</h1>
            <p className="text-lg text-zinc-500 dark:text-zinc-400 mt-1">
              Manage customer feedback and turn it into product decisions.
            </p>
          </div>
          <Button asChild>
            <Link href="/projects/new">
              <Plus /> New Project
            </Link>
          </Button>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-24 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl bg-white/60 dark:bg-zinc-900/60 shadow-sm">
            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-zinc-400" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">No projects yet</h3>
            <p className="text-zinc-500 dark:text-zinc-400 mb-6 max-w-sm mx-auto">
              Create your first project to start collecting and analyzing customer feedback.
            </p>
            <Button asChild size="lg">
              <Link href="/projects/new">Create Your First Project</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}

        {/* Quick Stats */}
        {projects.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm">
              <p className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
                {projects.reduce((acc, p) => acc + (p._count?.feedback || 0), 0)}
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Total Feedback Items</p>
            </div>
            <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm">
              <p className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">{projects.length}</p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Active Projects</p>
            </div>
            <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm">
              <p className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
                {projects.filter(p => (p._count?.feedback || 0) > 0).length}
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Projects with Feedback</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
