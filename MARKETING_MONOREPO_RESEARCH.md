# Monorepo Architecture - Marketing Sites Generation

## Executive Summary

Monorepo architecture for generating and deploying marketing landing pages using the same Next.js + PostgreSQL + Prisma stack as PM Analyzer.

---

## Part 1: Monorepo Structure

```
/fresh-industries
│
├── /apps
│   ├── /pm-analyzer              # Main product (existing)
│   │   ├── app/
│   │   ├── lib/
│   │   ├── components/
│   │   └── prisma/
│   │
│   ├── /marketing-sites         # Generated landing pages
│   │   ├── apps/
│   │   │   ├── sites/
│   │   │   │   ├── [project-id]/
│   │   │   │   │   ├── app/
│   │   │   │   │   │   ├── layout.tsx
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   └── globals.css
│   │   │   │   │   ├── components/
│   │   │   │   │   │   ├── Hero.tsx
│   │   │   │   │   │   ├── Features.tsx
│   │   │   │   │   │   ├── Pricing.tsx
│   │   │   │   │   │   └── Footer.tsx
│   │   │   │   │   ├── public/
│   │   │   │   │   │   ├── hero.jpg
│   │   │   │   │   │   └── icons/
│   │   │   │   │   └── package.json
│   │   │   │   ├── template-nextjs/
│   │   │   │   └── template-saas/
│   │   │   ├── components/       # Shared UI components
│   │   │   │   ├── ui/           # shadcn/ui
│   │   │   │   ├── marketing/    # Marketing-specific
│   │   │   │   └── layout/
│   │   │   └── lib/              # Utilities
│   │   │
│   │   └── prisma/              # Schema for marketing sites
│       ├── schema.prisma
│       └── migrations/
│
├── /packages
│   ├── /ui                      # Shared UI components
│   │   ├── components/
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   └── input.tsx
│   │   ├── hooks/
│   │   └── utils.ts
│   │
│   ├── /eslint-config
│   ├── /typescript-config
│   └── /tailwind-config
│
├── /tooling
│   ├── /eslint
│   ├── /prettier
│   ├── /turbo
│   └── /vitest
│
├── turbo.json
├── package.json
├── tsconfig.json
└── .gitignore
```

---

## Part 2: Tech Stack Consistency

### Same Stack as PM Analyzer

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Framework** | Next.js 16 (App Router) | All apps |
| **Language** | TypeScript | All apps |
| **Database** | PostgreSQL + Prisma | All apps |
| **Auth** | Better Auth | All apps |
| **Styling** | Tailwind CSS + shadcn/ui | All apps |
| **Deployment** | Vercel / Railway | All apps |

### Package.json (Root)

```json
{
  "name": "fresh-industries-monorepo",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "db:generate": "turbo run db:generate",
    "db:push": "turbo run db:push"
  },
  "devDependencies": {
    "turbo": "latest",
    "typescript": "latest",
    "eslint": "latest",
    "prettier": "latest"
  }
}
```

---

## Part 3: Generated Landing Page Structure

### Template: SaaS Landing Page

```
marketing-sites/apps/sites/[project-id]/
├── app/
│   ├── layout.tsx              # Root layout with fonts
│   ├── page.tsx               # Main landing page
│   └── globals.css            # Tailwind imports
│
├── components/
│   ├── marketing/
│   │   ├── Hero.tsx          # Hero section with CTA
│   │   ├── Features.tsx      # Feature grid
│   │   ├── Pricing.tsx       # Pricing cards
│   │   ├── Testimonials.tsx  # Social proof
│   │   ├── FAQ.tsx           # Accordion FAQ
│   │   └── CTASection.tsx    # Final CTA
│   │
│   ├── ui/                    # Shared components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   └── Input.tsx
│   │
│   └── layout/
│       ├── Header.tsx
│       └── Footer.tsx
│
├── public/
│   ├── images/
│   │   ├── hero.[hash].jpg   # Generated hero image
│   │   └── icons/
│   │       ├── feature-1.svg
│   │       ├── feature-2.svg
│   │       └── feature-3.svg
│   │
│   └── favicon.ico
│
├── package.json
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── prisma/
│   └── schema.prisma
└── .env.example
```

### Package.json (Generated Site)

```json
{
  "name": "marketing-site-[project-id]",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "16.x",
    "react": "^18",
    "react-dom": "^18",
    "@prisma/client": "^5.0",
    "lucide-react": "^0.400",
    "clsx": "^2.0",
    "tailwind-merge": "^2.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "typescript": "^5",
    "tailwindcss": "^3.4",
    "postcss": "^8",
    "autoprefixer": "^10",
    "prisma": "^5.0"
  }
}
```

---

## Part 4: Landing Page Components

### Hero.tsx

```tsx
import Image from 'next/image';
import { Button } from '@/components/ui/button';

interface HeroProps {
  headline: string;
  subheadline: string;
  ctaPrimary: string;
  ctaSecondary: string;
  heroImageUrl: string;
}

export function Hero({ headline, subheadline, ctaPrimary, ctaSecondary, heroImageUrl }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="space-y-8">
            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-slate-900">
              {headline}
            </h1>
            <p className="text-xl text-slate-600 max-w-lg">
              {subheadline}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                {ctaPrimary}
              </Button>
              <Button size="lg" variant="outline">
                {ctaSecondary}
              </Button>
            </div>
          </div>
          
          {/* Hero Image */}
          <div className="relative">
            <div className="aspect-video rounded-xl shadow-2xl overflow-hidden">
              <Image
                src={heroImageUrl}
                alt="Product screenshot"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

### Features.tsx

```tsx
import { Card, CardContent } from '@/components/ui/card';
import { Zap, Shield, Users, BarChart } from 'lucide-react';

const icons = {
  zap: Zap,
  shield: Shield,
  users: Users,
  barChart: BarChart,
};

interface Feature {
  title: string;
  description: string;
  icon: keyof typeof icons;
}

interface FeaturesProps {
  title: string;
  subtitle: string;
  features: Feature[];
}

export function Features({ title, subtitle, features }: FeaturesProps) {
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
            const Icon = icons[feature.icon];
            return (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-blue-600" />
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
```

### Pricing.tsx

```tsx
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';

interface PricingPlan {
  name: string;
  price: string;
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

export function Pricing({ title, subtitle, plans }: PricingProps) {
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
              className={`relative ${plan.popular ? 'border-blue-600 shadow-xl' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
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
                  <span className="text-lg font-normal text-slate-500">/mo</span>
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
```

---

## Part 5: Page.tsx (Main Page)

```tsx
import { Hero } from '@/components/marketing/Hero';
import { Features } from '@/components/marketing/Features';
import { Pricing } from '@/components/marketing/Pricing';
import { Testimonials } from '@/components/marketing/Testimonials';
import { FAQ } from '@/components/marketing/FAQ';
import { CTASection } from '@/components/marketing/CTASection';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

// This would be generated from marketing copy
const marketingData = {
  hero: {
    headline: "Ship Products Faster with AI-Powered Tools",
    subheadline: "The complete platform for building, launching, and growing your SaaS products. Powered by intelligent agents.",
    ctaPrimary: "Start Free",
    ctaSecondary: "Watch Demo",
    heroImageUrl: "/images/hero.jpg",
  },
  features: {
    title: "Everything you need",
    subtitle: "Powerful features to help you build and scale",
    features: [
      { title: "AI Research", description: "Market analysis and competitor research", icon: "zap" },
      { title: "Product Specs", description: "PRD and architecture generation", icon: "barChart" },
      { title: "Auto-Build", description: "Code generation with OpenHands", icon: "code" },
      { title: "Marketing", description: "Landing pages and launch campaigns", icon: "users" },
    ],
  },
  pricing: {
    title: "Simple, transparent pricing",
    subtitle: "Choose the plan that's right for you",
    plans: [
      {
        name: "Starter",
        price: "$29",
        description: "For individuals",
        features: ["5 projects", "Basic analytics", "Email support"],
        cta: "Start Free",
      },
      {
        name: "Growth",
        price: "$99",
        description: "For small teams",
        features: ["Unlimited projects", "Advanced analytics", "Priority support", "Team collaboration"],
        cta: "Get Started",
        popular: true,
      },
      {
        name: "Enterprise",
        price: "$299",
        description: "For large teams",
        features: ["Everything in Growth", "Custom integrations", "Dedicated support", "SLA"],
        cta: "Contact Sales",
      },
    ],
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero {...marketingData.hero} />
        <Features {...marketingData.features} />
        <Pricing {...marketingData.pricing} />
        <Testimonials />
        <FAQ />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
```

---

## Part 6: Marketing Agent V3 - Code Generation

### MarketingAgent Architecture

```typescript
interface MarketingAgentV3Input {
  build: BuildOutput;
  tone: 'professional' | 'casual' | 'urgent';
  template: 'saas' | 'mobile-app' | 'marketplace';
}

interface MarketingAgentV3Output {
  // Copy (from V2)
  positioning: Positioning;
  landingPageCopy: LandingPageCopy;
  socialPosts: SocialPosts;
  emailSequence: Email[];
  
  // Code (new in V3)
  siteCode: SiteCode;
  images: GeneratedImage[];
}

interface SiteCode {
  files: Array<{
    path: string;
    content: string;
  }>;
  dependencies: Record<string, string>;
  nextConfig: string;
  tailwindConfig: string;
}
```

### Generate Landing Page Code

```typescript
async function generateLandingPageCode(copy: LandingPageCopy): Promise<SiteCode> {
  const files: Array<{ path: string; content: string }> = [];
  
  // 1. Generate page.tsx
  files.push({
    path: 'app/page.tsx',
    content: generatePageComponent(copy),
  });
  
  // 2. Generate Hero component
  files.push({
    path: 'components/marketing/Hero.tsx',
    content: generateHeroComponent(copy.hero),
  });
  
  // 3. Generate Features component
  files.push({
    path: 'components/marketing/Features.tsx',
    content: generateFeaturesComponent(copy.features),
  });
  
  // 4. Generate Pricing component
  files.push({
    path: 'components/marketing/Pricing.tsx',
    content: generatePricingComponent(copy.pricing),
  });
  
  // 5. Generate layout, globals.css, etc.
  files.push(...generateSharedFiles());
  
  return {
    files,
    dependencies: {
      next: '14.x',
      react: '^18',
      'lucide-react': '^0.400',
      // ...
    },
    nextConfig: generateNextConfig(),
    tailwindConfig: generateTailwindConfig(),
  };
}
```

---

## Part 7: Deployment Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT PIPELINE                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Marketing Agent generates:                                   │
│     ├── Copy: headlines, benefits, CTAs                         │
│     ├── Image prompts: hero, icons                              │
│     └── Site code: Next.js app structure                        │
│                                                                  │
│  2. Nano Banana generates images                                 │
│     ├── hero.jpg                                                │
│     ├── feature-1.svg ...                                       │
│     └── social images                                           │
│                                                                  │
│  3. Build process (GitHub Actions)                               │
│     ├── Install dependencies                                    │
│     ├── Run Prisma migrations                                   │
│     └── Next.js build                                           │
│                                                                  │
│  4. Deploy to Vercel                                             │
│     ├── Preview URL: [project-id].vercel.app                     │
│     └── Production: [custom-domain.com]                         │
│                                                                  │
│  5. Store in database                                           │
│     └── Update project with live URL                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy-marketing-site.yml
name: Deploy Marketing Site

on:
  workflow_dispatch:
    inputs:
      project_id:
        required: true
        description: 'Project ID'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
        
      - name: Install pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 8
        
      - name: Install dependencies
        run: |
          cd apps/sites/${{ github.event.inputs.project_id }}
          pnpm install
        
      - name: Generate Prisma Client
        run: |
          cd apps/sites/${{ github.event.inputs.project_id }}
          npx prisma generate
        
      - name: Build
        run: |
          cd apps/sites/${{ github.event.inputs.project_id }}
          npx prisma generate
          npm run build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./apps/sites/${{ github.event.inputs.project_id }}
```

---

## Part 8: Database Schema

### Marketing Site Schema

```prisma
model MarketingSite {
  id            String   @id @default(cuid())
  projectId     String   @unique
  name          String
  slug          String   @unique
  
  // Template
  template      String   @default("saas") // saas, mobile-app, marketplace
  tone          String   @default("professional")
  
  // Copy
  headline      String
  subheadline   String?
  benefits      Json?
  ctaPrimary    String?
  ctaSecondary  String?
  
  // Generated Code
  siteCode      Json?    // Stored as JSON for now
  images        Json?    // Generated image URLs
  
  // Deployment
  githubRepo    String?
  vercelUrl     String?
  customDomain  String?
  
  // Status
  status        String   @default("draft") // draft, building, deployed, failed
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([projectId])
  @@index([slug])
}
```

---

## Part 9: File Structure Summary

### Generated Site (Per Project)

```
marketing-sites/apps/sites/[project-id]/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Main page (imports components)
│   └── globals.css             # Tailwind imports
│
├── components/
│   ├── ui/                     # Shared UI (from packages/ui)
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   └── Input.tsx
│   │
│   └── marketing/              # Marketing-specific
│       ├── Hero.tsx
│       ├── Features.tsx
│       ├── Pricing.tsx
│       ├── Testimonials.tsx
│       ├── FAQ.tsx
│       ├── CTASection.tsx
│       ├── Header.tsx
│       └── Footer.tsx
│
├── public/
│   └── images/
│       ├── hero.[hash].jpg
│       └── icons/
│           ├── feature-1.svg
│           ├── feature-2.svg
│           └── feature-3.svg
│
├── prisma/
│   └── schema.prisma
│
├── package.json
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── .env.example
```

---

## Part 10: Implementation Steps

### Phase 1: Monorepo Setup
- [ ] Create root package.json with workspaces
- [ ] Setup Turborepo
- [ ] Create packages/ui with shared components
- [ ] Configure TypeScript paths

### Phase 2: Marketing Agent V3
- [ ] Add site code generation to MarketingAgent
- [ ] Create landing page templates (SaaS, Mobile, Marketplace)
- [ ] Generate all necessary files

### Phase 3: Image Generation
- [ ] Add Nano Banana Pro integration
- [ ] Generate hero image + icons
- [ ] Store images in S3/R2

### Phase 4: Deployment
- [ ] Setup GitHub Actions workflow
- [ ] Configure Vercel deployment
- [ ] Update database with live URLs

### Phase 5: UI Dashboard
- [ ] Show generated sites in PM Analyzer
- [ ] Preview functionality
- [ ] Deploy button

---

## Summary

### Monorepo Benefits

| Benefit | Description |
|----------|-------------|
| **Code sharing** | Shared UI components across apps |
| **Consistency** | Same stack (Next.js, Prisma, TypeScript) |
| **Easy updates** | Update shared packages once |
| **CI/CD** | Single pipeline for all apps |

### What's Generated

| Output | Format | Location |
|--------|--------|----------|
| **Site code** | Next.js app | `/apps/sites/[project-id]/` |
| **Images** | JPG/SVG | `/public/images/` |
| **Database** | Prisma schema | `/prisma/schema.prisma` |

### Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 16 |
| **Language** | TypeScript |
| **Database** | PostgreSQL + Prisma |
| **Auth** | Better Auth |
| **Styling** | Tailwind + shadcn/ui |
| **Deployment** | Vercel |
| **Images** | Nano Banana Pro + R2 |

---

**Research completed:** February 5, 2026  
**Next:** Implementation of Marketing Agent V3 with code generation

---

**Want me to implement this monorepo architecture with Marketing Agent V3?**
