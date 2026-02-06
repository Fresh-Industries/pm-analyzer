// Research Agent API Route

import { NextRequest, NextResponse } from 'next/server';
import { ResearchAgent } from '@/lib/agents/research-agent';
import { orchestrator } from '@/lib/agents/orchestrator';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const body = await request.json();
    
    const { request: userRequest, constraints } = body;
    
    if (!userRequest) {
      return NextResponse.json(
        { error: 'Missing request field' },
        { status: 400 }
      );
    }
    
    // Create task in orchestrator
    const task = await orchestrator.createTask('research', {
      projectId,
      request: userRequest,
      constraints,
    });
    
    // Create and run research agent
    const agent = new ResearchAgent();
    
    // Execute research
    const result = await agent.execute({
      request: userRequest,
      constraints,
    });
    
    // Save to database
    await agent.tools.save_research.execute({
      projectId,
      research: result.output,
      summary: `${result.output.competitors.length} competitors found, ${result.output.opportunities.length} opportunities identified`,
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
    console.error('Research agent error:', error);
    return NextResponse.json(
      { error: error.message || 'Research failed' },
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
    
    // Get research results for this project
    const { prisma } = await import('@/lib/prisma');
    const results = await prisma.researchResult.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
    
    if (results.length === 0) {
      return NextResponse.json({
        status: 'pending',
        message: 'No research yet. Submit a request to start.',
      });
    }
    
    return NextResponse.json({
      status: 'complete',
      latest: results[0],
      history: results,
    });
  } catch (error: any) {
    console.error('Get research error:', error);
    return NextResponse.json(
      { error: 'Failed to get research' },
      { status: 500 }
    );
  }
}
