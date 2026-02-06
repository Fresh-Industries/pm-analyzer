// Marketing Agent API Route

import { NextRequest, NextResponse } from 'next/server';
import { MarketingAgent } from '@/lib/agents/marketing-agent';
import { orchestrator } from '@/lib/agents/orchestrator';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const body = await request.json();
    
    const { build } = body;
    
    if (!build) {
      return NextResponse.json(
        { error: 'Missing build field' },
        { status: 400 }
      );
    }
    
    // Create task
    const task = await orchestrator.createTask('marketing', {
      projectId,
      build,
    });
    
    // Create and run marketing agent
    const agent = new MarketingAgent();
    const result = await agent.execute({
      build,
      projectId,
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
    console.error('Marketing agent error:', error);
    return NextResponse.json(
      { error: error.message || 'Marketing generation failed' },
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
    const campaigns = await prisma.campaign.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
    
    if (campaigns.length === 0) {
      return NextResponse.json({
        status: 'pending',
        message: 'No marketing materials yet. Run build first.',
      });
    }
    
    return NextResponse.json({
      status: 'complete',
      latest: campaigns[0],
      history: campaigns,
    });
  } catch (error: any) {
    console.error('Get campaign error:', error);
    return NextResponse.json(
      { error: 'Failed to get campaign' },
      { status: 500 }
    );
  }
}
