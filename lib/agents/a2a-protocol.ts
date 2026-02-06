// A2A Protocol - Agent-to-Agent Communication

import type { AgentType, AgentMessage, MessageAction } from './types';

export interface A2AMessage {
  id: string;
  from: AgentType;
  to: AgentType;
  action: MessageAction;
  payload: Record<string, any>;
  timestamp: string;
  requiresApproval?: boolean;
  context?: {
    originalRequest?: string;
    projectId?: string;
    taskId?: string;
  };
}

export interface A2ARequest {
  agent: AgentType;
  action: MessageAction;
  payload: Record<string, any>;
  context?: {
    projectId?: string;
    originalRequest?: string;
  };
}

export interface A2AResponse {
  success: boolean;
  data?: Record<string, any>;
  error?: string;
  from: AgentType;
}

// Agent registry for routing messages
const agentRegistry: Map<string, Function> = new Map();

export function registerAgent(name: AgentType, handler: Function) {
  agentRegistry.set(name, handler);
}

export function getAgentHandler(name: AgentType): Function | undefined {
  return agentRegistry.get(name);
}

// Send message to agent
export async function sendA2AMessage(
  from: AgentType,
  to: AgentType,
  action: MessageAction,
  payload: Record<string, any>,
  context?: { projectId?: string; originalRequest?: string }
): Promise<A2AResponse> {
  const message: A2AMessage = {
    id: generateMessageId(),
    from,
    to,
    action,
    payload,
    timestamp: new Date().toISOString(),
    context,
  };

  const handler = getAgentHandler(to);
  
  if (!handler) {
    return {
      success: false,
      error: `Agent ${to} not registered`,
      from: to,
    };
  }

  try {
    const result = await handler(message);
    return {
      success: true,
      data: result,
      from: to,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      from: to,
    };
  }
}

// Request-response pattern
export async function requestFromAgent(
  requester: AgentType,
  target: AgentType,
  action: MessageAction,
  payload: Record<string, any>,
  context?: { projectId?: string; originalRequest?: string }
): Promise<A2AResponse> {
  return sendA2AMessage(requester, target, action, payload, context);
}

// Broadcast to multiple agents
export async function broadcastToAgents(
  from: AgentType,
  targets: AgentType[],
  action: MessageAction,
  payload: Record<string, any>
): Promise<Map<AgentType, A2AResponse>> {
  const results = new Map<AgentType, A2AResponse>();

  await Promise.all(
    targets.map(async (target) => {
      const result = await sendA2AMessage(from, target, action, payload);
      results.set(target, result);
    })
  );

  return results;
}

// Generate unique message ID
function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Message types for specific workflows
export const A2AActions = {
  // Research → Marketing
  RESEARCH_COMPLETE: 'research_complete',
  GET_MARKET_INSIGHTS: 'get_market_insights',
  
  // Marketing → Build
  REQUEST_LANDING_PAGE: 'request_landing_page',
  REQUEST_IMAGES: 'request_images',
  
  // Build → OpenHands
  BUILD_PRODUCT: 'build_product',
  DEPLOY_SITE: 'deploy_site',
  
  // Generic
  APPROVE: 'approve',
  REJECT: 'reject',
  STATUS_UPDATE: 'status_update',
  ERROR: 'error',
} as const;

// Workflow examples
export async function workflowRequestLandingPage(
  projectId: string,
  marketingCopy: {
    headline: string;
    features: Array<{ title: string; description: string }>;
    pricing: Array<any>;
  }
): Promise<A2AResponse> {
  return requestFromAgent('orchestrator', 'build', 'request_landing_page', {
    projectId,
    copy: marketingCopy,
  });
}

export async function workflowGetMarketResearch(
  projectId: string,
  productIdea: string
): Promise<A2AResponse> {
  return requestFromAgent('orchestrator', 'research', 'get_market_insights', {
    projectId,
    productIdea,
  });
}
