// Feedback Agent API Route

import { NextRequest, NextResponse } from 'next/server';
import { FeedbackAgent } from '@/lib/agents/feedback-agent';
import { orchestrator } from '@/lib/agents/orchestrator';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const body = await request.json();
    
    const { feedback, productInfo } = body;
    
    if (!feedback || !Array.isArray(feedback)) {
      return NextResponse.json(
        { error: 'Missing or invalid feedback array' },
        { status: 400 }
      );
    }
    
    // Create task
    const task = await orchestrator.createTask('feedback', {
      projectId,
      feedback,
      productInfo,
    });
    
    // Create and run feedback agent
    const agent = new FeedbackAgent();
    const result = await agent.execute({
      feedback,
      productInfo: {
        id: projectId,
        ...productInfo,
      },
    });
    
    // Mark task complete
    await orchestrator.completeTask(task.id, result.output);
    
    return NextResponse.json({
      success: result.success,
      output: result.output,
      message: result.message,
      taskId: task.id,
    });
  } catch (error: any) {
    console.error('Feedback agent error:', error);
    return NextResponse.json(
      { error: error.message || 'Analysis failed' },
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
    
    const { prisma } = await import('@/lib/prisma');
    const analyses = await prisma.feedbackAnalysis.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
    
    if (analyses.length === 0) {
      return NextResponse.json({
        status: 'pending',
        message: 'No feedback analysis yet. Submit feedback to analyze.',
      });
    }
    
    return NextResponse.json({
      status: 'complete',
      latest: analyses[0],
      history: analyses,
    });
  } catch (error: any) {
    console.error('Get feedback error:', error);
    return NextResponse.json(
      { error: 'Failed to get feedback analysis' },
      { status: 500 }
    );
  }
}
