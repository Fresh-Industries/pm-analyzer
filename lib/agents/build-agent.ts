// Build Agent - Creates GitHub repo and uses OpenHands to generate code

import { BaseAgent } from '../base-agent';
import { runOpenHandsAgent } from '@/lib/coding-agent';
import { createGithubRepo, pushScaffold, createPR } from '@/lib/github';
import { saveBuildTool } from '../tools/database';
import type { BuildInput, BuildOutput, SpecOutput } from '../types';

const SYSTEM_PROMPT = `You are a build coordinator. Your job is to:

1. Create a GitHub repository for the project
2. Push an initial scaffold based on the specification
3. Use OpenHands to implement the features
4. Deploy the result to a live URL

You coordinate the build process and report progress back to the user.`;

export class BuildAgent extends BaseAgent {
  name = 'build';
  description = 'Builds products using OpenHands';
  systemPrompt = SYSTEM_PROMPT;
  model = 'gpt-4o';
  
  tools = {
    save_build: saveBuildTool,
    github_create_repo: {
      execute: async (input: { name: string; description: string }) => {
        return await createGithubRepo(input.name, input.description);
      },
      description: 'Create a GitHub repository',
    },
    github_push: {
      execute: async (input: { repoUrl: string; files: Record<string, string> }) => {
        // Files is a map of path -> content
        const files = Object.entries(input.files).map(([path, content]) => ({
          path,
          content,
        }));
        return await pushScaffold(input.repoUrl, files);
      },
      description: 'Push initial scaffold to repo',
    },
  };
  
  async execute(input: BuildInput): Promise<{
    success: boolean;
    output: BuildOutput;
    message?: string;
  }> {
    const { spec, projectId } = input;
    
    try {
      // Step 1: Create GitHub repo
      this.reportProgress(10, 'Creating GitHub repository...');
      const repo = await createGithubRepo(
        slugify(spec.title),
        spec.solution.slice(0, 200)
      );
      
      // Step 2: Create scaffold files from spec
      this.reportProgress(20, 'Creating scaffold files...');
      const scaffoldFiles = generateScaffold(spec);
      
      // Step 3: Push scaffold
      this.reportProgress(30, 'Pushing scaffold to GitHub...');
      await pushScaffold(repo.html_url, scaffoldFiles);
      
      // Step 4: Run OpenHands to implement features
      this.reportProgress(40, 'OpenHands implementing features...');
      
      const openHandsResult = await runOpenHandsAgent({
        title: spec.title,
        summary: spec.solution,
        type: 'FEATURE' as const,
        details: {
          features: spec.features,
          techStack: spec.techStack,
          architecture: spec.architecture,
          apiEndpoints: spec.apiEndpoints,
        },
      }, repo.html_url);
      
      this.reportProgress(80, 'Build complete, PR created!');
      
      const output: BuildOutput = {
        githubUrl: openHandsResult.githubPrUrl,
        status: 'complete',
        filesCreated: countFiles(spec.fileStructure),
        technologies: Object.values(spec.techStack),
        logs: openHandsResult.logs,
      };
      
      // Save build to database
      await saveBuildTool.execute({
        projectId,
        build: output,
      });
      
      return {
        success: true,
        output,
        message: `Build complete! PR: ${openHandsResult.githubPrUrl}`,
      };
    } catch (error: any) {
      return {
        success: false,
        output: {
          githubUrl: '',
          status: 'failed',
          filesCreated: 0,
          technologies: [],
          logs: error.message,
        },
        message: `Build failed: ${error.message}`,
      };
    }
  }
  
  private reportProgress(percent: number, message: string) {
    console.log(`[Build Agent] ${percent}% - ${message}`);
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function generateScaffold(spec: SpecOutput): Array<{ path: string; content: string }> {
  const files: Array<{ path: string; content: string }> = [];
  
  // package.json
  files.push({
    path: 'package.json',
    content: JSON.stringify({
      name: slugify(spec.title),
      version: '0.1.0',
      private: true,
      scripts: {
        dev: 'next dev',
        build: 'next build',
        start: 'next start',
        lint: 'next lint',
      },
      dependencies: generateDependencies(spec.techStack),
    }, null, 2),
  });
  
  // next.config.js
  files.push({
    path: 'next.config.js',
    content: '/** @type {import("next").NextConfig} */\nconst nextConfig = {};\n\nmodule.exports = nextConfig;\n',
  });
  
  // tsconfig.json
  files.push({
    path: 'tsconfig.json',
    content: JSON.stringify({
      compilerOptions: {
        target: 'es5',
        lib: ['dom', 'dom.iterable', 'esnext'],
        allowJs: true,
        skipLibCheck: true,
        strict: true,
        noEmit: true,
        esModuleInterop: true,
        module: 'esnext',
        moduleResolution: 'bundler',
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: 'preserve',
        incremental: true,
        plugins: [{ name: 'next' }],
        paths: { '@/*': ['./*'] },
      },
      include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
      exclude: ['node_modules'],
    }, null, 2),
  });
  
  // README.md
  files.push({
    path: 'README.md',
    content: `# ${spec.title}

${spec.problem}

## Solution

${spec.solution}

## Tech Stack

- Frontend: ${spec.techStack.frontend}
- Backend: ${spec.techStack.backend}
- Database: ${spec.techStack.database}
- Auth: ${spec.techStack.auth}
- Hosting: ${spec.techStack.hosting}

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

## Features

${spec.features.map(f => `- ${f.name}: ${f.description}`).join('\n')}
`,
  });
  
  // Prisma schema if needed
  if (spec.techStack.database.includes('Prisma') || spec.techStack.database.includes('PostgreSQL')) {
    files.push({
      path: 'prisma/schema.prisma',
      content: `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Add your models here
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
`,
    });
  }
  
  return files;
}

function generateDependencies(techStack: any): Record<string, string> {
  const deps: Record<string, string> = {
    'next': '14.x',
    'react': '^18',
    'react-dom': '^18',
  };
  
  // Add based on tech stack
  if (techStack.frontend?.includes('Tailwind')) {
    deps['tailwindcss'] = '^3.4.0';
    deps['postcss'] = '^8';
    deps['autoprefixer'] = '^10';
  }
  
  if (techStack.auth?.includes('Better') || techStack.auth?.includes('Auth')) {
    deps['better-auth'] = 'latest';
  }
  
  if (techStack.database?.includes('Prisma')) {
    deps['prisma'] = '^5.0.0';
    deps['@prisma/client'] = '^5.0.0';
  }
  
  return deps;
}

function countFiles(fileStructure: any[]): number {
  if (!fileStructure) return 0;
  return fileStructure.length + 5; // + scaffold files
}
