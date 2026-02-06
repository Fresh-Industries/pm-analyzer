// Spec Agent API Route

import { NextRequest, NextResponse } from 'next/server';
import { SpecAgent } from '@/lib/agents/spec-agent';
import { orchestrator } from '@/lib/agents/orchestrator';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const body = await request.json();
    
    const { request: userRequest, research } = body;
    
    if (!userRequest) {
      return NextResponse.json(
        { error: 'Missing request field' },
        { status: 400 }
      );
    }
    
    // Create task
    const task = await orchestrator.createTask('spec', {
      projectId,
      request: userRequest,
      research,
    });
    
    // Create and run spec agent
    const agent = new SpecAgent();
    const result = await agent.execute({
      request: userRequest,
      research: research || {},
    });
    
    // Save spec to database
    await agent.tools.save_spec.execute({
      projectId,
      spec: {
        title: result.output.title,
        problem: result.output.problem,
        solution: result.output.solution,
        features: result.output.features,
        techStack: result.output.techStack,
        architecture: result.output.architecture,
        apiEndpoints: result.output.apiEndpoints,
        fileStructure: result.output.fileStructure,
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
    console.error('Spec agent error:', error);
    return NextResponse.json(
      { error: error.message || 'Spec generation failed' },
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
    const specs = await prisma.productSpec.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
    
    if (specs.length === 0) {
      return NextResponse.json({
        status: 'pending',
        message: 'No specification yet. Run research first or create one.',
      });
    }
    
    return NextResponse.json({
      status: 'complete',
      latest: specs[0],
      history: specs,
    });
  } catch (error: any) {
    console.error('Get spec error:', error);
    return NextResponse.json(
      { error: 'Failed to get specification' },
      { status: 500 }
    );
  }
}
