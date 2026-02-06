// Agent Message Types - A2A Protocol (Simplified)

export type AgentType = 
  | 'orchestrator'
  | 'research'
  | 'spec'
  | 'build'
  | 'marketing'
  | 'feedback'
  | 'iterate';

export type MessageAction =
  | 'task_request'
  | 'task_complete'
  | 'task_failed'
  | 'checkpoint'
  | 'approval'
  | 'human_input';

export interface AgentMessage {
  id: string;
  from: AgentType;
  to: AgentType;
  action: MessageAction;
  payload: Record<string, any>;
  timestamp: string;
  requiresApproval?: boolean;
}

export interface TaskContext {
  originalRequest: string;
  userId?: string;
  projectId?: string;
  messages: AgentMessage[];
  checkpoints: string[];
  humanApprovals: Record<string, boolean>;
}

export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
}

// Tool definition (MCP-style)
export interface ToolDefinition {
  name: string;
  description: string;
  parameters: z.ZodObject<any>;
  execute: (args: Record<string, any>) => Promise<ToolResult>;
}

// Research Agent specific types
export interface ResearchInput {
  request: string;
  constraints?: {
    budget?: string;
    timeline?: string;
    techPreference?: string;
  };
}

export interface ResearchOutput {
  marketSize?: string;
  competitors: CompetitorInfo[];
  opportunities: string[];
  risks: string[];
  recommendations: string[];
}

export interface CompetitorInfo {
  name: string;
  url?: string;
  features: string[];
  pricing?: string;
  strengths?: string[];
  weaknesses?: string[];
}

// Spec Agent specific types
export interface SpecInput {
  research: ResearchOutput;
  request: string;
}

export interface SpecOutput {
  title: string;
  problem: string;
  solution: string;
  features: Array<{
    name: string;
    description: string;
    priority: 'must' | 'should' | 'could' | 'wont';
    estimatedHours?: number;
  }>;
  techStack: {
    frontend: string;
    backend: string;
    database: string;
    auth: string;
    hosting: string;
    payments?: string;
    ai?: string;
  };
  architecture: string;
  apiEndpoints: Array<{
    method: string;
    path: string;
    description: string;
  }>;
  fileStructure: Array<{
    path: string;
    description: string;
  }>;
}

// Build Agent specific types
export interface BuildInput {
  spec: SpecOutput;
  projectId: string;
}

export interface BuildOutput {
  githubUrl: string;
  deployedUrl?: string;
  status: string;
  filesCreated: number;
  technologies: string[];
  logs?: string;
}

// Marketing Agent specific types
export interface MarketingInput {
  build: BuildOutput;
  projectId?: string;
}

export interface MarketingOutput {
  positioning: {
    tagline: string;
    oneLiner: string;
    targetAudience: string;
    mainBenefit: string;
    differentiation: string;
  };
  landingPage: {
    heroHeadline: string;
    heroSubheadline: string;
    keyBenefits: string[];
    features: Array<{
      title: string;
      description: string;
      icon: string;
    }>;
    cta: {
      primary: string;
      secondary: string;
    };
    socialProof: string[];
  };
  socialPosts: {
    twitter: string;
    linkedin: string;
    hackerNews: string;
    productHunt: {
      title: string;
      subtitle: string;
      description: string;
      tagline: string;
    };
  };
  emailSequence: Array<{
    subject: string;
    previewText: string;
    body: string;
    timing: string;
  }>;
}

// Feedback Agent specific types
export interface FeedbackInput {
  productUrl: string;
  launchChannels: string[];
}

export interface FeedbackOutput {
  sentiment: 'positive' | 'neutral' | 'negative';
  score: number; // 1-10
  highlights: string[];
  concerns: string[];
  suggestions: string[];
  rawFeedback: { channel: string; text: string; sentiment: string }[];
}

// Iterate Agent specific types
export interface IterateInput {
  feedback: FeedbackOutput;
  currentSpec: SpecOutput;
}

export interface IterateOutput {
  prioritizedImprovements: {
    item: string;
    impact: 'high' | 'medium' | 'low';
    effort: 'high' | 'medium' | 'low';
    reasoning: string;
  }[];
  nextSprint: {
    items: string[];
    goal: string;
    estimatedDays: number;
  };
}
