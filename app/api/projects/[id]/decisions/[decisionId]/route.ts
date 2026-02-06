import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; decisionId: string }> }
) {
  try {
    const { id: projectId, decisionId } = await params;

    const decision = await prisma.decision.findUnique({
      where: { id: decisionId },
    });

    if (!decision) {
      return NextResponse.json(
        { error: "Decision not found" },
        { status: 404 }
      );
    }

    // Verify the decision belongs to the project
    if (decision.projectId !== projectId) {
      return NextResponse.json(
        { error: "Decision not found in this project" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: decision.id,
      title: decision.title,
      summary: decision.summary,
      scope: decision.scope,
      nonGoals: decision.nonGoals,
      acceptanceCriteria: (decision as any).acceptanceCriteria || "",
      risks: decision.risks,
      confidenceScore: (decision as any).confidenceScore || 0,
      confidence: ((decision as any).confidenceScore || 0) >= 0.8 ? "high" : ((decision as any).confidenceScore || 0) >= 0.5 ? "medium" : "low",
      status: decision.status,
      linkedFeedbackIds: decision.linkedFeedbackIds,
      createdAt: decision.createdAt.toISOString(),
      updatedAt: decision.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("Error fetching decision:", error);
    return NextResponse.json(
      { error: "Failed to fetch decision" },
      { status: 500 }
    );
  }
}
