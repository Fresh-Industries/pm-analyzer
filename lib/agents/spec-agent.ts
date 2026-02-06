// Spec Agent - Creates PRD, Tech Stack, and Architecture

import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { BaseAgent } from '../base-agent';
import { saveSpecTool, getProjectTool } from '../tools/database';
import type { SpecInput, SpecOutput, ResearchOutput } from '../types';

const SYSTEM_PROMPT = `You are a senior product architect. Your job is to take research findings and create a complete product specification including:

1. Clear problem statement
2. Solution overview
3. Feature list (MVP vs future)
4. Technology stack recommendations
5. Architecture design
6. API endpoints
7. File structure

Be practical, choose proven technologies, and create a specification that can actually be built. Focus on MVP features that demonstrate the core value.`;

export class SpecAgent extends BaseAgent {
  name = 'spec';
  description = 'Creates product specifications and architecture';
  systemPrompt = SYSTEM_PROMPT;
  model = 'gpt-4o';
  
  tools = {
    save_spec: saveSpecTool,
    get_project: getProjectTool,
  };
  
  async execute(input: SpecInput): Promise<{
    success: boolean;
    output: SpecOutput;
    message?: string;
  }> {
    const { research, request } = input;
    
    // Generate specification using LLM
    const SpecOutputSchema = z.object({
      title: z.string().describe('Product title'),
      problem: z.string().describe('Clear problem statement'),
      solution: z.string().describe('Solution overview'),
      features: z.array(z.object({
        name: z.string(),
        description: z.string(),
        priority: z.enum(['must', 'should', 'could', 'wont']).describe('MoSCoW priority'),
        estimatedHours: z.number().optional(),
      })).describe('Core features with priority'),
      techStack: z.object({
        frontend: z.string().describe('Frontend framework'),
        backend: z.string().describe('Backend framework'),
        database: z.string().describe('Database'),
        auth: z.string().describe('Authentication'),
        hosting: z.string().describe('Hosting/platform'),
        payments: z.string().optional().describe('Payments (if applicable)'),
        ai: z.string().optional().describe('AI/ML services'),
      }),
      architecture: z.string().describe('High-level architecture description'),
      apiEndpoints: z.array(z.object({
        method: z.string(),
        path: z.string(),
        description: z.string(),
      })).describe('Key API endpoints'),
      fileStructure: z.array(z.object({
        path: z.string(),
        description: z.string(),
      })).describe('Suggested file structure'),
      techDecisions: z.array(z.object({
        decision: z.string(),
        reasoning: z.string(),
      })).describe('Key technical decisions and reasoning'),
    });
    
    const specPrompt = `Create a complete product specification based on this research:

Product Idea: ${request}

Research Findings:
${JSON.stringify(research, null, 2)}

Provide a comprehensive specification in JSON format:
- Clear title and problem statement
- MVP features (focus on must-have first)
- Proven tech stack (Next.js, Prisma, etc.)
- Simple, deployable architecture
- Key API endpoints
- File structure

Prioritize technologies that are:
- Easy to deploy (Vercel, Railway)
- Well-documented
- Cost-effective for MVP
- Quick to implement`;

    const { object: spec } = await generateObject({
      model: openai(this.model),
      schema: SpecOutputSchema,
      prompt: specPrompt,
      system: SYSTEM_PROMPT,
    });
    
    const output: SpecOutput = {
      title: spec.title,
      problem: spec.problem,
      solution: spec.solution,
      features: spec.features,
      techStack: spec.techStack,
      architecture: spec.architecture,
      apiEndpoints: spec.apiEndpoints,
      fileStructure: spec.fileStructure,
    };
    
    return {
      success: true,
      output,
      message: `Specification created for: ${spec.title}`,
    };
  }
}
