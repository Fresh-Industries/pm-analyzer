import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { fetchSentryIssues, enrichSentryIssue } from "@/lib/sentry";

export async function POST(request: NextRequest) {
  try {
    const { projectId } = await request.json();

    if (!projectId) {
      return NextResponse.json(
        { message: "Project ID is required" },
        { status: 400 }
      );
    }

    const project = await db.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 }
      );
    }

    if (!project.sentryOrg || !project.sentryProject || !project.sentryToken) {
      return NextResponse.json(
        { message: "Sentry not configured for this project" },
        { status: 400 }
      );
    }

    // Fetch issues from Sentry
    const issues = await fetchSentryIssues({
      org: project.sentryOrg,
      project: project.sentryProject,
      token: project.sentryToken,
    });

    let imported = 0;
    let skipped = 0;

    for (const issue of issues) {
      // Check if we already have this issue
      const existing = await db.feedback.findFirst({
        where: {
          projectId,
          sentryIssueId: issue.id,
        },
      });

      if (existing) {
        skipped++;
        continue;
      }

      // Enrich issue with stack trace and frequency
      const enriched = await enrichSentryIssue(
        {
          org: project.sentryOrg,
          project: project.sentryProject,
          token: project.sentryToken,
        },
        issue
      );

      // Create feedback item from Sentry issue
      await db.feedback.create({
        data: {
          projectId,
          text: `${issue.title}\n\n${enriched.stackTrace}`,
          source: "sentry",
          type: "bug",
          status: "analyzed",
          sentryIssueId: issue.id,
          sentryIssueUrl: issue.permalink,
          errorFrequency: enriched.frequency,
        },
      });

      imported++;
    }

    return NextResponse.json({
      success: true,
      imported,
      skipped,
      total: issues.length,
    });
  } catch (error) {
    console.error("Sentry sync error:", error);
    return NextResponse.json(
      { message: "Sync failed: " + (error instanceof Error ? error.message : "Unknown error") },
      { status: 500 }
    );
  }
}
