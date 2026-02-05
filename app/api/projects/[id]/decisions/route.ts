import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: projectId } = await params;

    const decisions = await prisma.decision.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(decisions);
  } catch (error) {
    console.error("Error fetching decisions:", error);
    return NextResponse.json(
      { error: "Failed to fetch decisions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: projectId } = await params;
    const body = await request.json();

    const {
      title,
      summary,
      scope,
      risks,
      nonGoals,
      confidence,
      linkedFeedbackIds,
    } = body;

    if (!title || !summary) {
      return NextResponse.json(
        { error: "Title and summary are required" },
        { status: 400 }
      );
    }

    const decision = await prisma.decision.create({
      data: {
        projectId,
        title,
        summary,
        scope: scope || "",
        risks: risks || "",
        nonGoals: nonGoals || "",
        confidence: confidence || "medium",
        status: "draft",
        linkedFeedbackIds: linkedFeedbackIds || [],
      },
    });

    return NextResponse.json(decision, { status: 201 });
  } catch (error) {
    console.error("Error creating decision:", error);
    return NextResponse.json(
      { error: "Failed to create decision" },
      { status: 500 }
    );
  }
}
