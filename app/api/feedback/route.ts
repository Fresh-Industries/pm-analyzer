import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { analysisQueue } from '@/lib/queue';
import {
  DEFAULT_ANALYSIS_MODEL_ID,
  isAnalysisModelId,
  isGeminiEnabled,
} from '@/lib/ai-models';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      projectId,
      content,
      source,
      type,
      customerTier,
      revenue,
      analysisModel,
      model,
    } = body;

    if (!projectId || !content) {
      return NextResponse.json(
        { error: 'Project ID and content are required' },
        { status: 400 }
      );
    }

    const envDefaultModel = process.env.DEFAULT_ANALYSIS_MODEL_ID;
    const fallbackModel = isAnalysisModelId(envDefaultModel)
      ? envDefaultModel
      : DEFAULT_ANALYSIS_MODEL_ID;
    let selectedModel = isAnalysisModelId(analysisModel || model)
      ? (analysisModel || model)
      : fallbackModel;

    if (
      selectedModel.startsWith("google:") &&
      (!process.env.GOOGLE_GENERATIVE_AI_API_KEY || !isGeminiEnabled())
    ) {
      selectedModel = fallbackModel;
    }

    const feedback = await prisma.feedback.create({
      data: {
        projectId,
        text: content,
        source,
        type,
        customerTier,
        revenue,
        status: 'pending_analysis',
        analysisModel: selectedModel,
      },
    });

    // Trigger background worker for analysis/embeddings
    await analysisQueue.add('analyze', { feedbackId: feedback.id });

    return NextResponse.json(feedback, { status: 201 });
  } catch (error) {
    console.error('Error creating feedback:', error);
    return NextResponse.json(
      { error: 'Failed to create feedback' },
      { status: 500 }
    );
  }
}
