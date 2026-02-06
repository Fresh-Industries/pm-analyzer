import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clusterFeedback, FeedbackItem } from "@/lib/clustering";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;

    const feedback = await prisma.feedback.findMany({
      where: { projectId },
      select: {
        id: true,
        text: true,
        type: true,
        customerTier: true,
        source: true,
        createdAt: true,
      },
    });

    if (feedback.length === 0) {
      return NextResponse.json(
        { error: "No feedback to analyze" },
        { status: 400 }
      );
    }

    // Group by type for summary
    const bugs = feedback.filter((f) => f.type === "bug");
    const features = feedback.filter((f) => f.type === "feature");
    const other = feedback.filter((f) => !f.type || f.type === "other");

    // Use embedding-based clustering instead of keyword matching
    const clusteringResult = await clusterFeedback(feedback as FeedbackItem[]);

    // Transform clustering results to match the opportunities format
    const opportunities = clusteringResult.clusters.map((cluster) => ({
      id: cluster.id,
      title: cluster.title,
      category: cluster.category,
      description: cluster.description,
      impact: cluster.impact,
      impactScore: cluster.impactScore,
      feedbackCount: cluster.feedbackCount,
      enterpriseCount: cluster.enterpriseCount,
      examples: cluster.examples,
      feedbackIds: cluster.feedbackIds,
    }));

    const analysis = {
      projectId,
      generatedAt: new Date().toISOString(),
      feedbackCount: feedback.length,
      summary: {
        bugs: bugs.length,
        features: features.length,
        other: other.length,
      },
      opportunities,
      unclusteredCount: clusteringResult.unclustered.length,
    };

    // Save to database
    await prisma.analysis.create({
      data: {
        projectId,
        content: analysis as any,
      },
    });

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Analysis failed:", error);
    return NextResponse.json(
      { error: "Analysis failed" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;

    const analysis = await prisma.analysis.findFirst({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    });

    if (!analysis) {
      return NextResponse.json({ status: "pending" });
    }

    return NextResponse.json(analysis.content);
  } catch (error) {
    console.error("Failed to fetch analysis:", error);
    return NextResponse.json(
      { error: "Failed to fetch analysis" },
      { status: 500 }
    );
  }
}
