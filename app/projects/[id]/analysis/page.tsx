
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeCluster } from "@/components/ThemeCluster";
import { PriorityMatrix } from "@/components/PriorityMatrix";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AnalysisPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const project = await prisma.project.findUnique({
    where: { id },
  });

  if (!project) {
    notFound();
  }

  // Mock data for analysis views
  const themes = [
    { id: '1', name: 'Performance Issues', count: 42, sentiment: 'negative' as const, keywords: ['slow', 'lag', 'loading'] },
    { id: '2', name: 'UI/UX Improvements', count: 28, sentiment: 'neutral' as const, keywords: ['button', 'color', 'layout'] },
    { id: '3', name: 'Feature Requests', count: 15, sentiment: 'positive' as const, keywords: ['add', 'new', 'wish'] },
    { id: '4', name: 'Pricing', count: 10, sentiment: 'negative' as const, keywords: ['expensive', 'cost', 'plan'] },
    { id: '5', name: 'Mobile App', count: 8, sentiment: 'neutral' as const, keywords: ['ios', 'android', 'phone'] },
  ];

  const priorityItems = [
    { id: '1', title: 'Fix login latency', impact: 'high' as const, effort: 'low' as const },
    { id: '2', title: 'Redesign dashboard', impact: 'high' as const, effort: 'high' as const },
    { id: '3', title: 'Add dark mode', impact: 'low' as const, effort: 'low' as const },
    { id: '4', title: 'Custom reports export', impact: 'medium' as const, effort: 'high' as const },
    { id: '5', title: 'Update documentation', impact: 'low' as const, effort: 'medium' as const },
  ];

  return (
    <div className="container mx-auto py-10 px-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Link href={`/projects/${id}`} className="hover:text-foreground flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Back to Project
            </Link>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Analysis: {project.name}</h1>
          <p className="text-muted-foreground">
            AI-generated insights from your customer feedback.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Share2 className="mr-2 h-4 w-4" /> Share
          </Button>
          <Button>
            <Download className="mr-2 h-4 w-4" /> Export Report
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Theme Clusters */}
        <div className="md:col-span-2">
          <ThemeCluster themes={themes} />
        </div>

        {/* Priority Matrix */}
        <div className="md:col-span-1 h-full">
          <PriorityMatrix items={priorityItems} />
        </div>

        {/* Sentiment Trends (Stub) */}
        <div className="md:col-span-1 border rounded-lg p-6 bg-card text-card-foreground shadow h-full">
           <h3 className="font-semibold leading-none tracking-tight mb-4">Sentiment Trends</h3>
           <div className="flex items-center justify-center h-[300px] text-muted-foreground bg-muted/20 rounded border-2 border-dashed">
             Chart Placeholder (Sentiment over time)
           </div>
        </div>
      </div>
    </div>
  );
}
