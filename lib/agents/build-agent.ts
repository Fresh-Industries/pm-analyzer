// Build Agent - Communicates via A2A Protocol

import { BaseAgent } from '../base-agent';
import { requestFromAgent, A2AActions } from '../a2a-protocol';
import { runOpenHandsAgent } from '@/lib/coding-agent';
import { createGithubRepo, pushScaffold } from '@/lib/github';
import { saveBuildTool } from '../tools/database';
import type { BuildInput, BuildOutput } from '../types';

const SYSTEM_PROMPT = `You are a build coordinator. You build products and communicate with other agents via A2A protocol.

Your responsibilities:
1. Build full products using OpenHands
2. Generate landing page code from marketing copy
3. Deploy to GitHub and Vercel
4. Return results to requesting agent

You communicate with:
- OpenHands: Build products
- Marketing Agent: Return landing page code
`;

export class BuildAgent extends BaseAgent {
  name = 'build';
  description = 'Builds products and landing pages';
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
        const files = Object.entries(input.files).map(([path, content]) => ({
          path,
          content,
        }));
        return await pushScaffold(input.repoUrl, files);
      },
      description: 'Push files to GitHub',
    },
  };

  // A2A message handler
  async handleA2AMessage(message: {
    from: string;
    action: string;
    payload: any;
    context?: any;
  }): Promise<any> {
    switch (message.action) {
      case 'build_product':
        return this.buildProduct(message.payload);
      
      case 'generate_landing_page_code':
        return this.generateLandingPageCode(message.payload);
      
      default:
        return { error: `Unknown action: ${message.action}` };
    }
  }
  
  async execute(input: BuildInput): Promise<{
    success: boolean;
    output: BuildOutput;
    message?: string;
  }> {
    const { spec, projectId } = input;
    
    // If this is from A2A, handle it
    if (input['fromA2A']) {
      return this.handleA2AMessage(input as any);
    }

    // Standalone: build full product
    return this.buildProduct({ spec, projectId });
  }

  // A2A: Build product using OpenHands
  private async buildProduct(payload: any): Promise<BuildOutput> {
    const { spec, projectId } = payload;

    try {
      // Step 1: Create GitHub repo
      this.reportProgress(10, 'Creating GitHub repository...');
      const repo = await createGithubRepo(
        slugify(spec.title),
        spec.solution.slice(0, 200)
      );

      // Step 2: Run OpenHands
      this.reportProgress(40, 'OpenHands building product...');
      const openHandsResult = await runOpenHandsAgent({
        title: spec.title,
        summary: spec.solution,
        type: 'FEATURE' as const,
        details: {
          features: spec.features,
          techStack: spec.techStack,
          architecture: spec.architecture,
        },
      }, repo.html_url);

      this.reportProgress(80, 'Build complete!');

      const output: BuildOutput = {
        githubUrl: openHandsResult.githubPrUrl,
        status: 'complete',
        filesCreated: countFiles(spec.fileStructure),
        technologies: Object.values(spec.techStack),
        logs: openHandsResult.logs,
      };

      // Save to database
      await saveBuildTool.execute({
        projectId,
        build: output,
      });

      return output;
    } catch (error: any) {
      return {
        githubUrl: '',
        status: 'failed',
        filesCreated: 0,
        technologies: [],
        logs: error.message,
      };
    }
  }

  // A2A: Generate landing page code from marketing copy
  private async generateLandingPageCode(payload: any): Promise<any> {
    const { projectId, copy } = payload;

    try {
      this.reportProgress(10, 'Generating landing page code...');

      // Generate Next.js landing page code
      const siteCode = await this.generateNextJS LandingPage(copy);

      // Create GitHub repo for landing page
      const repoName = `landing-page-${projectId}`;
      this.reportProgress(30, 'Creating GitHub repository...');
      const repo = await createGithubRepo(repoName, 'Marketing landing page');

      // Push code to GitHub
      this.reportProgress(50, 'Pushing to GitHub...');
      await pushScaffold(repo.html_url, siteCode.files);

      // Return result
      const result = {
        success: true,
        siteUrl: `https://${repoName}.vercel.app`,
        githubUrl: repo.html_url,
        filesCreated: siteCode.files.length,
      };

      this.reportProgress(100, 'Landing page ready!');

      return result;
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Generate Next.js landing page code
  private async generateNextJSLandingPage(copy: any): Promise<{ files: Array<{ path: string; content: string }> }> {
    const files: Array<{ path: string; content: string }> = [];

    // Generate all files (simplified for A2A)
    files.push({
      path: 'app/page.tsx',
      content: generatePageCode(copy),
    });

    files.push({
      path: 'app/layout.tsx',
      content: generateLayoutCode(),
    });

    files.push({
      path: 'app/globals.css',
      content: generateGlobalsCss(),
    });

    files.push({
      path: 'package.json',
      content: generatePackageJson(),
    });

    files.push({
      path: 'tailwind.config.ts',
      content: generateTailwindConfig(),
    });

    return { files };
  }

  private reportProgress(percent: number, message: string) {
    console.log(`[Build Agent] ${percent}% - ${message}`);
  }
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

function countFiles(fileStructure: any[]): number {
  if (!fileStructure) return 0;
  return fileStructure.length + 5;
}

// Simplified code generators (for A2A responses)
function generatePageCode(copy: any): string {
  return `'use client';

import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Pricing from '@/components/Pricing';
import Testimonials from '@/components/Testimonials';
import FAQ from '@/components/FAQ';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero 
        headline="${copy.hero?.headline || 'Welcome'}"
        subheadline="${copy.hero?.subheadline || ''}"
        ctaPrimary="${copy.hero?.ctaPrimary || 'Get Started'}"
        ctaSecondary="${copy.hero?.ctaSecondary || 'Learn More'}"
      />
      <Features 
        title="Features"
        features={${JSON.stringify(copy.features || [])}}
      />
      <Pricing 
        plans={${JSON.stringify(copy.pricing || [])}}
      />
      <Testimonials />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}
`;
}

function generateLayoutCode(): string {
  return `import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Landing Page',
  description: 'Generated by AI',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
`;
}

function generateGlobalsCss(): string {
  return `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --primary: 221.2 83.2% 53.3%;
}

body {
  @apply bg-white text-slate-900;
}
`;
}

function generatePackageJson(): string {
  return JSON.stringify({
    name: 'landing-page',
    version: '1.0.0',
    private: true,
    scripts: {
      dev: 'next dev',
      build: 'next build',
      start: 'next start',
    },
    dependencies: {
      next: '14.x',
      react: '^18',
      'lucide-react': '^0.400',
    },
    devDependencies: {
      typescript: '^5',
      tailwindcss: '^3.4',
    },
  }, null, 2);
}

function generateTailwindConfig(): string {
  return `import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {} },
  plugins: [],
};

export default config;
`;
}
