import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.projectId) {
      return NextResponse.json(
        { message: "Project ID is required" },
        { status: 400 }
      );
    }

    if (!body.text) {
      return NextResponse.json(
        { message: "Feedback text is required" },
        { status: 400 }
      );
    }

    // Create feedback from widget
    const feedback = await db.feedback.create({
      data: {
        projectId: body.projectId,
        type: body.type || "feature",
        source: body.source || "widget",
        text: body.text,
        email: body.email || null,
        tier: body.tier || null,
        pageUrl: body.pageUrl || null,
        browserInfo: body.browserInfo || null,
        status: "pending_analysis",
      },
    });

    return NextResponse.json({
      success: true,
      feedbackId: feedback.id,
      message: "Feedback submitted successfully",
    });
  } catch (error) {
    console.error("Widget submission error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
