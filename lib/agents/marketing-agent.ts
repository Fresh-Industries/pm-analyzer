// Marketing Agent V3 - Generates Complete Landing Page + Site Code

import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { BaseAgent } from '../base-agent';
import { saveCampaignTool } from '../tools/database';
import type { MarketingInput, MarketingOutput, MarketingSiteCode } from '../types';

const SYSTEM_PROMPT = `You are a senior full-stack developer and growth marketer. Your job is to generate a complete, production-ready Next.js landing page based on marketing copy.

You will generate:
1. Complete Next.js project structure
2. All necessary components (Hero, Features, Pricing, Testimonials, FAQ, CTA)
3. Proper Tailwind CSS styling
4. Responsive, accessible code
5. Image prompts for Nano Banana Pro

The landing page should be:
- Fast and performant (Next.js App Router)
- Beautiful and professional (Tailwind CSS)
- Accessible (proper ARIA labels)
- Responsive (mobile-first)
- Conversion-focused (clear CTAs)

Use shadcn/ui components pattern but implement simply since we're generating from scratch.`;

export class MarketingAgent extends BaseAgent {
  name = 'marketing';
  description = 'Generates landing page code + marketing assets';
  systemPrompt = SYSTEM_PROMPT;
  model = 'gpt-4o';
  
  tools = {
    save_campaign: saveCampaignTool,
  };
  
  async execute(input: MarketingInput): Promise<{
    success: boolean;
    output: MarketingOutput;
    message?: string;
  }> {
    const { build, projectId, tone = 'professional' } = input;
    
    // Generate complete landing page with code
    const LandingPageSchema = z.object({
      // Copy
      positioning: z.object({
        tagline: z.string(),
        oneLiner: z.string(),
        targetAudience: z.string(),
        mainBenefit: z.string(),
        differentiation: z.string(),
      }),
      
      // Page Copy
      hero: z.object({
        headline: z.string(),
        subheadline: z.string(),
        ctaPrimary: z.string(),
        ctaSecondary: z.string(),
      }),
      
      features: z.array(z.object({
        title: z.string(),
        description: z.string(),
        icon: z.string(), // icon name for lucide-react
      })),
      
      pricing: z.array(z.object({
        name: z.string(),
        price: z.string(),
        period: z.string().optional(),
        description: z.string(),
        features: z.array(z.string()),
        cta: z.string(),
        popular: z.boolean().optional(),
      })),
      
      testimonials: z.array(z.object({
        quote: z.string(),
        author: z.string(),
        role: z.string(),
        company: z.string().optional(),
      })),
      
      faq: z.array(z.object({
        question: z.string(),
        answer: z.string(),
      })),
      
      cta: z.object({
        headline: z.string(),
        subheadline: z.string(),
        cta: z.string(),
      }),
      
      // Image Prompts for Nano Banana
      imagePrompts: z.object({
        hero: z.object({
          prompt: z.string(),
          aspectRatio: z.enum(['1:1', '16:9', '9:16', '4:3']),
          resolution: z.enum(['1k', '2k', '4k']),
        }),
        features: z.array(z.object({
          icon: z.string(),
          prompt: z.string(),
          aspectRatio: z.enum(['1:1', '4:3']),
          resolution: z.enum(['1k', '2k']),
        })),
      }),
      
      // Site Configuration
      siteConfig: z.object({
        siteName: z.string(),
        primaryColor: z.string(),
        secondaryColor: z.string(),
      }),
    });
    
    const prompt = `Generate a complete landing page for this product:

Product: ${build.title || 'Product'}
Problem it solves: ${build.problem || 'Product problem'}
Solution: ${build.solution || 'Product solution'}
Key Features: ${build.features?.map((f: any) => f.name).join(', ') || 'Core features'}
Tech Stack: ${JSON.stringify(build.techStack || {})}
Tone: ${tone}

Generate in JSON format:
1. Complete landing page copy (hero, features, pricing, testimonials, FAQ, CTA)
2. Image prompts for Nano Banana Pro (hero + feature icons)
3. Site configuration (name, colors)

Make it:
- Professional and conversion-focused
- Based on the actual product features
- Include realistic pricing (3 tiers)
- Add 3-4 testimonials
- Include 4-6 FAQ items`;

    const { object: landingPage } = await generateObject({
      model: openai(this.model),
      schema: LandingPageSchema,
      prompt,
      system: SYSTEM_PROMPT,
    });
    
    // Generate site code
    const siteCode = await this.generateSiteCode(landingPage, tone);
    
    const output: MarketingOutput = {
      positioning: landingPage.positioning,
      hero: landingPage.hero,
      features: landingPage.features,
      pricing: landingPage.pricing,
      testimonials: landingPage.testimonials,
      faq: landingPage.faq,
      cta: landingPage.cta,
      imagePrompts: landingPage.imagePrompts,
      siteConfig: landingPage.siteConfig,
      siteCode,
      tone,
      audience: landingPage.positioning.targetAudience,
    };
    
    // Save to database
    await saveCampaignTool.execute({
      projectId,
      campaign: output,
    });
    
    return {
      success: true,
      output,
      message: `Landing page generated with ${output.siteCode?.files?.length || 0} files`,
    };
  }
  
  private async generateSiteCode(landingPage: any, tone: string): Promise<MarketingSiteCode> {
    // Generate complete Next.js site code
    const files: Array<{ path: string; content: string }> = [];
    
    // 1. package.json
    files.push({
      path: 'package.json',
      content: this.generatePackageJson(landingPage.siteConfig.siteName),
    });
    
    // 2. tsconfig.json
    files.push({
      path: 'tsconfig.json',
      content: this.generateTsConfig(),
    });
    
    // 3. next.config.js
    files.push({
      path: 'next.config.js',
      content: this.generateNextConfig(),
    });
    
    // 4. tailwind.config.ts
    files.push({
      path: 'tailwind.config.ts',
      content: this.generateTailwindConfig(landingPage.siteConfig),
    });
    
    // 5. app/layout.tsx
    files.push({
      path: 'app/layout.tsx',
      content: this.generateLayout(landingPage.siteConfig.siteName),
    });
    
    // 6. app/globals.css
    files.push({
      path: 'app/globals.css',
      content: this.generateGlobalsCss(),
    });
    
    // 7. app/page.tsx
    files.push({
      path: 'app/page.tsx',
      content: this.generatePage(landingPage),
    });
    
    // 8. Components
    files.push({
      path: 'components/Hero.tsx',
      content: this.generateHero(landingPage.hero),
    });
    
    files.push({
      path: 'components/Features.tsx',
      content: this.generateFeatures(landingPage.features),
    });
    
    files.push({
      path: 'components/Pricing.tsx',
      content: this.generatePricing(landingPage.pricing),
    });
    
    files.push({
      path: 'components/Testimonials.tsx',
      content: this.generateTestimonials(landingPage.testimonials),
    });
    
    files.push({
      path: 'components/FAQ.tsx',
      content: this.generateFAQ(landingPage.faq),
    });
    
    files.push({
      path: 'components/CTA.tsx',
      content: this.generateCTA(landingPage.cta),
    });
    
    files.push({
      path: 'components/Footer.tsx',
      content: this.generateFooter(landingPage.siteConfig.siteName),
    });
    
    // 9. Prisma schema (optional for static site)
    files.push({
      path: 'prisma/schema.prisma',
      content: this.generatePrismaSchema(),
    });
    
    // 10. .env.example
    files.push({
      path: '.env.example',
      content: this.generateEnvExample(),
    });
    
    // 11. README.md
    files.push({
      path: 'README.md',
      content: this.generateReadme(landingPage.siteConfig.siteName),
    });
    
    return {
      files,
      siteName: landingPage.siteConfig.siteName,
      template: 'landing-page',
    };
  }
  
  private generatePackageJson(siteName: string): string {
    return JSON.stringify({
      name: siteName.toLowerCase().replace(/\s+/g, '-'),
      version: '1.0.0',
      private: true,
      scripts: {
        dev: 'next dev',
        build: 'next build',
        start: 'next start',
        lint: 'next lint',
      },
      dependencies: {
        next: '14.x',
        react: '^18',
        'react-dom': '^18',
        'lucide-react': '^0.400',
        clsx: '^2.0',
        'tailwind-merge': '^2.0',
        '@prisma/client': '^5.0',
      },
      devDependencies: {
        '@types/node': '^20',
        '@types/react': '^18',
        '@types/react-dom': '^18',
        typescript: '^5',
        tailwindcss: '^3.4',
        postcss: '^8',
        autoprefixer: '^10',
        prisma: '^5.0',
        eslint: '^8',
        'eslint-config-next': '14.x',
      },
    }, null, 2);
  }
  
  private generateTsConfig(): string {
    return JSON.stringify({
      compilerOptions: {
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
    }, null, 2);
  }
  
  private generateNextConfig(): string {
    return `/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'your-storage.com'],
  },
};

module.exports = nextConfig;
`;
  }
  
  private generateTailwindConfig(siteConfig: any): string {
    return `import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '${siteConfig.primaryColor || '#2563EB'}',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '${siteConfig.secondaryColor || '#F59E0B'}',
          foreground: '#000000',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
`;
  }
  
  private generateLayout(siteName: string): string {
    return `import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '${siteName}',
  description: '${siteName} - Transform the way you work',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
`;
  }
  
  private generateGlobalsCss(): string {
    return `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
`;
  }
  
  private generatePage(landingPage: any): string {
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
        headline="${landingPage.hero.headline}"
        subheadline="${landingPage.hero.subheadline}"
        ctaPrimary="${landingPage.hero.ctaPrimary}"
        ctaSecondary="${landingPage.hero.ctaSecondary}"
      />
      <Features 
        title="Features"
        subtitle="Everything you need to succeed"
        features={${JSON.stringify(landingPage.features)}}
      />
      <Pricing 
        title="Pricing"
        subtitle="Simple, transparent pricing"
        plans={${JSON.stringify(landingPage.pricing)}}
      />
      <Testimonials 
        title="What our customers say"
        testimonials={${JSON.stringify(landingPage.testimonials)}}
      />
      <FAQ 
        title="Frequently asked questions"
        faqs={${JSON.stringify(landingPage.faq)}}
      />
      <CTA 
        headline="${landingPage.cta.headline}"
        subheadline="${landingPage.cta.subheadline}"
        cta="${landingPage.cta.cta}"
      />
      <Footer siteName="${landingPage.siteConfig.siteName}" />
    </main>
  );
}
`;
  }
  
  private generateHero(hero: any): string {
    return `import { Button } from '@/components/ui/button';

interface HeroProps {
  headline: string;
  subheadline: string;
  ctaPrimary: string;
  ctaSecondary: string;
}

export default function Hero({ headline, subheadline, ctaPrimary, ctaSecondary }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-slate-900 mb-6">
            {headline}
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            {subheadline}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              {ctaPrimary}
            </Button>
            <Button size="lg" variant="outline">
              {ctaSecondary}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
`;
  }
  
  private generateFeatures(features: any[]): string {
    return `import { Card, CardContent } from '@/components/ui/card';
import { 
  Zap, Shield, Users, BarChart, 
  Globe, Smartphone, Cloud, Lock 
} from 'lucide-react';

const iconMap: Record<string, any> = {
  Zap, Shield, Users, BarChart, Globe, Smartphone, Cloud, Lock
};

interface Feature {
  title: string;
  description: string;
  icon: string;
}

interface FeaturesProps {
  title: string;
  subtitle: string;
  features: Feature[];
}

export default function Features({ title, subtitle, features }: FeaturesProps) {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
            {title}
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = iconMap[feature.icon] || Zap;
            return (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
`;
  }
  
  private generatePricing(plans: any[]): string {
    return `import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface PricingPlan {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  cta: string;
  popular?: boolean;
}

interface PricingProps {
  title: string;
  subtitle: string;
  plans: PricingPlan[];
}

export default function Pricing({ title, subtitle, plans }: PricingProps) {
  return (
    <section className="py-20 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
            {title}
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index}
              className={\`relative \${plan.popular ? 'border-primary shadow-xl' : ''}\`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-4xl font-bold">
                  {plan.price}
                  {plan.period && <span className="text-lg font-normal text-slate-500">/{plan.period}</span>}
                </div>
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-500" />
                      <span className="text-slate-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  variant={plan.popular ? 'default' : 'outline'}
                >
                  {plan.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
`;
  }
  
  private generateTestimonials(testimonials: any[]): string {
    return `interface Testimonial {
  quote: string;
  author: string;
  role: string;
  company?: string;
}

interface TestimonialsProps {
  title: string;
  testimonials: Testimonial[];
}

export default function Testimonials({ title, testimonials }: TestimonialsProps) {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
            {title}
          </h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="p-6 bg-slate-50 rounded-xl">
              <p className="text-slate-600 mb-4 italic">"{testimonial.quote}"</p>
              <div>
                <p className="font-semibold text-slate-900">{testimonial.author}</p>
                <p className="text-sm text-slate-500">
                  {testimonial.role}
                  {testimonial.company && \`, \${testimonial.company}\`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
`;
  }
  
  private generateFAQ(faq: any[]): string {
    return `import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface FAQ {
  question: string;
  answer: string;
}

interface FAQProps {
  title: string;
  faqs: FAQ[];
}

export default function FAQ({ title, faqs }: FAQProps) {
  return (
    <section className="py-20 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
            {title}
          </h2>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((item, index) => (
              <AccordionItem key={index} value={\`item-\${index}\`} className="bg-white rounded-lg px-4">
                <AccordionTrigger className="text-left">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-slate-600">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
`;
  }
  
  private generateCTA(cta: any): string {
    return `import { Button } from '@/components/ui/button';

interface CTAProps {
  headline: string;
  subheadline: string;
  cta: string;
}

export default function CTA({ headline, subheadline, cta }: CTAProps) {
  return (
    <section className="py-20 bg-primary">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
          {headline}
        </h2>
        <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
          {subheadline}
        </p>
        <Button size="lg" variant="secondary" className="text-primary">
          {cta}
        </Button>
      </div>
    </section>
  );
}
`;
  }
  
  private generateFooter(siteName: string): string {
    return `export default function Footer({ siteName }: { siteName: string }) {
  return (
    <footer className="py-12 bg-slate-900">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-white font-semibold mb-4">{siteName}</h3>
            <p className="text-slate-400 text-sm">
              Transform the way you work with our powerful platform.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#" className="hover:text-white">Features</a></li>
              <li><a href="#" className="hover:text-white">Pricing</a></li>
              <li><a href="#" className="hover:text-white">Integrations</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#" className="hover:text-white">About</a></li>
              <li><a href="#" className="hover:text-white">Blog</a></li>
              <li><a href="#" className="hover:text-white">Careers</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#" className="hover:text-white">Privacy</a></li>
              <li><a href="#" className="hover:text-white">Terms</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-400">
          © {new Date().getFullYear()} {siteName}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
`;
  }
  
  private generatePrismaSchema(): string {
    return `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id())
  email     String   @unique @default(cuid
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
`;
  }
  
  private generateEnvExample(): string {
    return `# Database
DATABASE_URL="postgresql://user:password@localhost:5432/db"

# Optional Analytics
NEXT_PUBLIC_ANALYTICS_ID=
`;
  }
  
  private generateReadme(siteName: string): string {
    return `# ${siteName}

Marketing landing page for ${siteName}.

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to view the landing page.

## Deployment

Deploy to Vercel:

\`\`\`bash
vercel deploy
\`\`\`

## Customization

Edit \`app/page.tsx\` to update content.
`;
  }
}
