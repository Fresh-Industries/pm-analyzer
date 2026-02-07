import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  formatDecision,
  ExportFormat,
  DecisionExportData,
} from "@/components/DecisionExportDialog";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; decisionId: string }> }
) {
  try {
    const { id: projectId, decisionId } = await params;
    const { searchParams } = new URL(request.url);
    const format = (searchParams.get("format") as ExportFormat) || "markdown";

    // Validate format
    const validFormats = [
      "cursor",
      "linear",
      "jira",
      "slack",
      "notion",
      "markdown",
      "json",
    ];
    if (!validFormats.includes(format)) {
      return NextResponse.json(
        { error: `Invalid format. Valid formats: ${validFormats.join(", ")}` },
        { status: 400 }
      );
    }

    // Fetch the decision
    const decision = await prisma.decision.findUnique({
      where: { id: decisionId },
      include: {
        project: {
          select: { name: true },
        },
      },
    });

    if (!decision) {
      return NextResponse.json({ error: "Decision not found" }, { status: 404 });
    }

    // Verify the decision belongs to the project
    if (decision.projectId !== projectId) {
      return NextResponse.json(
        { error: "Decision does not belong to this project" },
        { status: 403 }
      );
    }

    // Build export data
    const exportData: DecisionExportData = {
      id: decision.id,
      title: decision.title,
      summary: decision.summary,
      scope: decision.scope,
      nonGoals: decision.nonGoals,
      acceptanceCriteria: decision.acceptanceCriteria,
      risks: decision.risks,
      confidenceScore: decision.confidenceScore,
      linkedFeedbackIds: decision.linkedFeedbackIds,
      projectName: decision.project.name,
    };

    // Format the decision
    const content = formatDecision(exportData, format);

    // Return appropriate response based on format
    if (format === "json") {
      return NextResponse.json(JSON.parse(content), {
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // For text formats, return plain text with appropriate headers
    const contentType =
      format === "markdown" ? "text/markdown" : "text/plain";
    const filename = `decision-${decision.title
      .toLowerCase()
      .replace(/\s+/g, "-")}.${format === "markdown" ? "md" : format}`;

    return new NextResponse(content, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error exporting decision:", error);
    return NextResponse.json(
      { error: "Failed to export decision" },
      { status: 500 }
    );
  }
}
