import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { analysisQueue } from '@/lib/queue';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectId, content, source, type, customerTier, revenue } = body;

    if (!projectId || !content) {
      return NextResponse.json(
        { error: 'Project ID and content are required' },
        { status: 400 }
      );
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
