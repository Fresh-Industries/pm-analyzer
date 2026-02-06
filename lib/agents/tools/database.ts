// Database Tool - Save and retrieve agent outputs

import { tool } from 'ai';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import type { ToolDefinition } from './types';

// Save research results
export const saveResearchTool: ToolDefinition = {
  name: 'save_research',
  description: 'Save research findings to the database for a project.',  
  parameters: z.object({
    projectId: z.string().describe('The project ID'),
    research: z.record(z.any()).describe('Research data to save'),
    summary: z.string().describe('Brief summary of research'),
  }),
  
  execute: async ({ projectId, research, summary }) => {
    try {
      const result = await prisma.researchResult.create({
        data: {
          projectId,
          summary,
          details: research as any,
        },
      });
      
      return { success: true, data: { id: result.id } };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};

// Save spec
export const saveSpecTool: ToolDefinition = {
  name: 'save_spec',
  description: 'Save product specification to the database.',
  
  parameters: z.object({
    projectId: z.string().describe('The project ID'),
    spec: z.record(z.any()).describe('Spec data to save'),
  }),
  
  execute: async ({ projectId, spec }) => {
    try {
      const result = await prisma.productSpec.create({
        data: {
          projectId,
          content: spec as any,
        },
      });
      
      return { success: true, data: { id: result.id } };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};

// Get project by ID
export const getProjectTool: ToolDefinition = {
  name: 'get_project',
  description: 'Get project details by ID.',
  
  parameters: z.object({
    projectId: z.string().describe('The project ID'),
  }),
  
  execute: async ({ projectId }) => {
    try {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          researchResults: { orderBy: { createdAt: 'desc' }, take: 1 },
          productSpecs: { orderBy: { createdAt: 'desc' }, take: 1 },
          builds: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
      });
      
      if (!project) {
        return { success: false, error: 'Project not found' };
      }
      
      return { success: true, data: { project } };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};

// Create project
export const createProjectTool: ToolDefinition = {
  name: 'create_project',
  description: 'Create a new project for the product builder.',
  
  parameters: z.object({
    name: z.string().describe('Project name'),
    description: z.string().optional().describe('Project description'),
    userId: z.string().optional().describe('User ID (optional)'),
  }),
  
  execute: async ({ name, description, userId }) => {
    try {
      const project = await prisma.project.create({
        data: {
          name,
          description,
          userId,
        },
      });
      
      return { success: true, data: { projectId: project.id } };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};

// Save build
export const saveBuildTool: ToolDefinition = {
  name: 'save_build',
  description: 'Save build output (GitHub URL, deployed URL, etc.)',
  
  parameters: z.object({
    projectId: z.string().describe('The project ID'),
    githubUrl: z.string().url().optional().describe('GitHub repository URL'),
    deployedUrl: z.string().url().optional().describe('Deployed application URL'),
    filesCreated: z.number().describe('Number of files created'),
    technologies: z.array(z.string()).describe('Technologies used'),
  }),
  
  execute: async ({ projectId, githubUrl, deployedUrl, filesCreated, technologies }) => {
    try {
      const build = await prisma.build.create({
        data: {
          projectId,
          githubUrl,
          deployedUrl,
          filesCreated,
          technologies,
        },
      });
      
      return { success: true, data: { buildId: build.id } };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};

// Save feedback analysis
export const saveFeedbackAnalysisTool: ToolDefinition = {
  name: 'save_feedback_analysis',
  description: 'Save feedback analysis results',
  
  parameters: z.object({
    projectId: z.string().describe('The project ID'),
    analysis: z.record(z.any()).describe('Feedback analysis data'),
  }),
  
  execute: async ({ projectId, analysis }) => {
    try {
      const result = await prisma.feedbackAnalysis.create({
        data: {
          projectId,
          sentiment: analysis.sentiment,
          score: analysis.score,
          highlights: analysis.highlights as any,
          concerns: analysis.concerns as any,
          suggestions: analysis.suggestions as any,
          themes: analysis.themes as any,
          rawFeedback: analysis.rawFeedback as any,
        },
      });
      
      return { success: true, data: { id: result.id } };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};
