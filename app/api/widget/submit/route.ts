import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import {
  DEFAULT_ANALYSIS_MODEL_ID,
  isAnalysisModelId,
  isGeminiEnabled,
} from "@/lib/ai-models";

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
    const envDefaultModel = process.env.DEFAULT_ANALYSIS_MODEL_ID;
    const fallbackModel = isAnalysisModelId(envDefaultModel)
      ? envDefaultModel
      : DEFAULT_ANALYSIS_MODEL_ID;
    let selectedModel = isAnalysisModelId(body.analysisModel)
      ? body.analysisModel
      : fallbackModel;

    if (
      selectedModel.startsWith("google:") &&
      (!process.env.GOOGLE_GENERATIVE_AI_API_KEY || !isGeminiEnabled())
    ) {
      selectedModel = fallbackModel;
    }

    const feedback = await db.feedback.create({
      data: {
        projectId: body.projectId,
        type: body.type || "feature",
        source: body.source || "widget",
        text: body.text,
        customerTier: body.tier || null,
        pageUrl: body.pageUrl || null,
        browserInfo: body.browserInfo || null,
        status: "pending_analysis",
        analysisModel: selectedModel,
      },
    });

    return NextResponse.json(
      {
        success: true,
        feedbackId: feedback.id,
        message: "Feedback submitted successfully",
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    );
  } catch (error) {
    console.error("Widget submission error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
