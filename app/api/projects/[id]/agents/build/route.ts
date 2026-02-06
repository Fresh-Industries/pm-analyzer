// Build Agent API Route

import { NextRequest, NextResponse } from 'next/server';
import { BuildAgent } from '@/lib/agents/build-agent';
import { orchestrator } from '@/lib/agents/orchestrator';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const body = await request.json();
    
    const { spec } = body;
    
    if (!spec) {
      return NextResponse.json(
        { error: 'Missing spec field' },
        { status: 400 }
      );
    }
    
    // Create task
    const task = await orchestrator.createTask('build', {
      projectId,
      spec,
    });
    
    // Create and run build agent
    const agent = new BuildAgent();
    const result = await agent.execute({
      spec,
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
    console.error('Build agent error:', error);
    return NextResponse.json(
      { error: error.message || 'Build failed' },
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
    const builds = await prisma.build.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
    
    if (builds.length === 0) {
      return NextResponse.json({
        status: 'pending',
        message: 'No builds yet. Create a spec first.',
      });
    }
    
    return NextResponse.json({
      status: 'complete',
      latest: builds[0],
      history: builds,
    });
  } catch (error: any) {
    console.error('Get build error:', error);
    return NextResponse.json(
      { error: 'Failed to get build' },
      { status: 500 }
    );
  }
}
