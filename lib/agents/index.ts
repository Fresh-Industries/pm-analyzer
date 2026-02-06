// Product Builder Agents - Agent Infrastructure

// Tool types for all agents
export * from './tools';
export * from './messages';
export * from './base-agent';

// A2A Protocol - Agent-to-Agent Communication
export {
  sendA2AMessage,
  broadcastToAgents,
  registerAgent,
  getAgentHandler,
  requestFromAgent,
  workflowRequestLandingPage,
  workflowGetMarketResearch,
  A2AActions,
  type A2AMessage,
  type A2AResponse,
  type Workflow,
} from './a2a-protocol';

// Orchestrator
export {
  orchestrator,
  workflows,
  type WorkflowStep,
} from './orchestrator';

// Agent implementations
export { ResearchAgent } from './research-agent';
export { SpecAgent } from './spec-agent';
export { BuildAgent } from './build-agent';
export { MarketingAgent } from './marketing-agent';
export { FeedbackAgent } from './feedback-agent';

// Types
export type { ResearchInput, ResearchOutput } from './types';
export type { SpecInput, SpecOutput } from './types';
export type { BuildInput, BuildOutput } from './types';
export type { MarketingInput, MarketingOutput } from './types';
export type { FeedbackInput, FeedbackOutput } from './types';
