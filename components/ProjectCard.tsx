import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MessageSquare, ChevronRight } from "lucide-react";
import type { Project } from "@/lib/api";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="h-full group cursor-pointer overflow-hidden">
        <CardContent className="p-6 space-y-5">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h3 className="font-semibold text-xl text-zinc-900 dark:text-zinc-50 group-hover:text-blue-600 transition-colors">
                {project.name}
              </h3>
              {project.description && (
                <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">
                  {project.description}
                </p>
              )}
            </div>
            <Badge variant="secondary" className="bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
              Active
            </Badge>
          </div>

          <div className="flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4" />
              <span>{project._count?.feedback || 0} feedback</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex -space-x-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium shadow">
                {project.name.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-blue-600 font-medium group-hover:translate-x-1 transition-transform">
              View Project <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}