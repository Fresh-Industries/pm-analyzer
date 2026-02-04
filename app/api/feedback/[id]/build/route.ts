import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { codingQueue } from '@/lib/queue';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const feedback = await prisma.feedback.findUnique({
      where: { id },
    });

    if (!feedback) {
      return NextResponse.json({ error: 'Feedback not found' }, { status: 404 });
    }

    if (feedback.status !== 'analyzed' && feedback.status !== 'failed') {
      return NextResponse.json({ error: 'Feedback not ready for build' }, { status: 400 });
    }

    // Update status to prevent double-click
    await prisma.feedback.update({
      where: { id },
      data: { status: 'building' },
    });

    // Add to queue
    await codingQueue.add('build', { feedbackId: id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Build trigger failed:', error);
    return NextResponse.json({ error: 'Failed to trigger build' }, { status: 500 });
  }
}
