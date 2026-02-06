// A2A Orchestrator - Coordinates Multi-Agent Workflows

import {
  sendA2AMessage,
  broadcastToAgents,
  A2AActions,
  registerAgent,
  type A2AMessage,
  type A2AResponse,
} from './a2a-protocol';
import type { AgentType, MessageAction } from './types';
import { prisma } from '@/lib/prisma';

export interface WorkflowStep {
  agent: AgentType;
  action: MessageAction;
  description: string;
}

export interface Workflow {
  id: string;
  name: string;
  steps: WorkflowStep[];
}

// Predefined workflows
export const workflows: Record<string, Workflow> = {
  CREATE_LANDING_PAGE: {
    id: 'create_landing_page',
    name: 'Create Landing Page',
    steps: [
      { agent: 'research', action: 'get_market_insights', description: 'Get market research' },
      { agent: 'marketing', action: 'create_marketing_strategy', description: 'Create marketing strategy' },
      { agent: 'build', action: 'generate_landing_page_code', description: 'Generate landing page code' },
      { agent: 'marketing', action: 'generate_image_prompts', description: 'Generate image prompts' },
    ],
  },
  
  FULL_PRODUCT_LAUNCH: {
    id: 'full_product_launch',
    name: 'Full Product Launch',
    steps: [
      { agent: 'research', action: 'get_market_insights', description: 'Market research' },
      { agent: 'spec', action: 'create_product_spec', description: 'Create product specification' },
      { agent: 'build', action: 'build_product', description: 'Build product with OpenHands' },
      { agent: 'marketing', action: 'create_campaign', description: 'Create marketing campaign' },
      { agent: 'marketing', action: 'generate_assets', description: 'Generate marketing assets' },
    ],
  },
};

export class Orchestrator {
  private activeWorkflows: Map<string, A2AMessage[]> = new Map();

  // Execute a predefined workflow
  async executeWorkflow(
    workflowId: string,
    context: { projectId: string; userRequest: string }
  ): Promise<{ workflowId: string; results: Map<AgentType, A2AResponse> }> {
    const workflow = workflows[workflowId];
    
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    const results = new Map<AgentType, A2AResponse>();

    // Execute steps sequentially
    for (const step of workflow.steps) {
      const result = await sendA2AMessage(
        'orchestrator' as AgentType,
        step.agent,
        step.action,
        {
          workflowId,
          projectId: context.projectId,
          previousResults: Object.fromEntries(results),
        },
        { projectId: context.projectId, originalRequest: context.userRequest }
      );
      
      results.set(step.agent, result);
    }

    return {
      workflowId,
      results,
    };
  }

  // Execute parallel tasks
  async executeParallel(
    agents: AgentType[],
    action: MessageAction,
    payload: Record<string, any>,
    context?: { projectId?: string }
  ): Promise<Map<AgentType, A2AResponse>> {
    return broadcastToAgents('orchestrator' as AgentType, agents, action, payload);
  }

  // Start a new workflow
  async startWorkflow(
    userRequest: string,
    projectId: string,
    workflowType: keyof typeof workflows = 'CREATE_LANDING_PAGE'
  ) {
    const workflow = workflows[workflowType];

    // Create workflow record
    const workflowRecord = await prisma.agentWorkflow.create({
      data: {
        id: `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        projectId,
        workflowType,
        status: 'running',
        steps: workflow.steps.map(s => JSON.stringify(s)),
        context: { userRequest },
      },
    });

    // Start execution
    this.executeWorkflow(workflowType, { projectId, userRequest })
      .then(async (result) => {
        await prisma.agentWorkflow.update({
          where: { id: workflowRecord.id },
          data: {
            status: 'completed',
            output: JSON.stringify(result),
          },
        });
      })
      .catch(async (error) => {
        await prisma.agentWorkflow.update({
          where: { id: workflowRecord.id },
          data: {
            status: 'failed',
            error: error.message,
          },
        });
      });

    return workflowRecord;
  }

  // Get workflow status
  async getWorkflowStatus(workflowId: string) {
    return prisma.agentWorkflow.findUnique({
      where: { id: workflowId },
    });
  }

  // Get all workflows for a project
  async getProjectWorkflows(projectId: string) {
    return prisma.agentWorkflow.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
  }
}

// Singleton instance
export const orchestrator = new Orchestrator();
