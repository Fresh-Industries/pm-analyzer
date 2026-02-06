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
  parameters: any;
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

// Marketing Agent V3 Types
export interface MarketingInput {
  build: BuildOutput;
  projectId?: string;
  tone?: 'professional' | 'casual' | 'urgent';
  audience?: string;
}

// Generated site code
export interface MarketingSiteCode {
  files: Array<{
    path: string;
    content: string;
  }>;
  siteName: string;
  template: string;
}

export interface ImagePrompt {
  prompt: string;
  aspectRatio: '1:1' | '16:9' | '9:16' | '4:3';
  resolution: '1k' | '2k' | '4k';
}

export interface FeatureImagePrompt {
  icon: string;
  prompt: string;
  aspectRatio: '1:1' | '4:3';
  resolution: '1k' | '2k';
}

export interface MarketingOutput {
  // Copy (from V2)
  positioning: {
    tagline: string;
    oneLiner: string;
    targetAudience: string;
    mainBenefit: string;
    differentiation: string;
  };
  
  // Hero
  hero: {
    headline: string;
    subheadline: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  
  // Features
  features: Array<{
    title: string;
    description: string;
    icon: string;
  }>;
  
  // Pricing
  pricing: Array<{
    name: string;
    price: string;
    period?: string;
    description: string;
    features: string[];
    cta: string;
    popular?: boolean;
  }>;
  
  // Testimonials
  testimonials: Array<{
    quote: string;
    author: string;
    role: string;
    company?: string;
  }>;
  
  // FAQ
  faq: Array<{
    question: string;
    answer: string;
  }>;
  
  // CTA
  cta: {
    headline: string;
    subheadline: string;
    cta: string;
  };
  
  // Image Prompts for Nano Banana
  imagePrompts: {
    hero: ImagePrompt;
    features: FeatureImagePrompt[];
  };
  
  // Generated Site Code (V3)
  siteCode?: MarketingSiteCode;
  
  // Site Configuration
  siteConfig: {
    siteName: string;
    primaryColor: string;
    secondaryColor: string;
  };
  
  // Metadata
  tone: string;
  audience: string;
}

// Feedback Agent specific types
export interface FeedbackItem {
  text: string;
  source?: string;
  createdAt?: Date;
}

export interface ProductInfo {
  id?: string;
  name: string;
  description?: string;
}

export interface FeedbackInput {
  feedback: FeedbackItem[];
  productInfo?: ProductInfo;
}

export interface FeedbackOutput {
  sentiment: 'positive' | 'neutral' | 'negative';
  score: number; // 1-10
  highlights: string[];
  concerns: string[];
  suggestions: Array<{
    item: string;
    priority: 'high' | 'medium' | 'low';
    effort: 'high' | 'medium' | 'low';
    reasoning: string;
  }>;
  themes: Array<{
    name: string;
    count: number;
    sentiment: 'positive' | 'neutral' | 'negative';
  }>;
  rawFeedback: Array<{
    text: string;
    sentiment: 'positive' | 'neutral' | 'negative';
    source?: string;
  }>;
}

// Iterate Agent specific types
export interface IterateInput {
  feedback: FeedbackOutput;
  currentSpec: SpecOutput;
}

export interface IterateOutput {
  prioritizedImprovements: Array<{
    item: string;
    impact: 'high' | 'medium' | 'low';
    effort: 'high' | 'medium' | 'low';
    reasoning: string;
  }>;
  nextSprint: {
    items: string[];
    goal: string;
    estimatedDays: number;
  };
}
