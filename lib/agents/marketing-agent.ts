// Marketing Agent V2 - Enhanced with A/B Variants, Timeline, and Predictions

import { openai } from '@ai-sdk/openai';
import { generateObject, generateText } from 'ai';
import { z } from 'zod';
import { BaseAgent } from '../base-agent';
import { saveCampaignTool } from '../tools/database';
import type { MarketingInput, MarketingOutput } from '../types';

const SYSTEM_PROMPT = `You are a senior growth marketer and conversion copywriter with 15 years of experience launching SaaS products. You've generated $50M+ in revenue and launched 200+ products.

Your expertise:
- Conversion-optimized landing pages (AIDA, PAS, Before/After/Bridge)
- Email marketing (drip sequences, personalization, segmentation)
- Social media (Twitter, LinkedIn, Product Hunt, Hacker News)
- A/B testing (headlines, CTAs, page layouts)
- Launch strategy (pre-launch, launch day, post-launch)

For each request:
1. Research the product thoroughly
2. Identify the ideal customer profile and pain points
3. Generate 3-5 A/B test variants for each major element
4. Provide specific recommendations for each platform
5. Include a launch timeline with day-by-day actions
6. Predict engagement metrics based on historical data

Always:
- Lead with benefits, not features
- Use concrete numbers and social proof
- Create urgency without being pushy
- Match tone to platform norms
- Provide actionable variants, not generic advice`;

export class MarketingAgent extends BaseAgent {
  name = 'marketing';
  description = 'Creates campaigns with A/B variants, timeline, and predictions';
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
    const { build, projectId, tone = 'professional', audience } = input;
    
    // Generate comprehensive marketing materials
    const MarketingOutputSchema = z.object({
      // Positioning
      positioning: z.object({
        tagline: z.string(),
        oneLiner: z.string(),
        targetAudience: z.string(),
        mainBenefit: z.string(),
        differentiation: z.string(),
        customerProfile: z.object({
          name: z.string(),
          role: z.string(),
          painPoints: z.array(z.string()),
          goals: z.array(z.string()),
        }),
      }),
      
      // Landing Page with A/B Variants
      landingPage: z.object({
        headlines: z.array(z.object({
          text: z.string(),
          rationale: z.string(),
          expectedImpact: z.enum(['high', 'medium', 'low']),
        })),
        subheadlines: z.array(z.object({
          text: z.string(),
          rationale: z.string(),
        })),
        keyBenefits: z.array(z.object({
          benefit: z.string(),
          supportingEvidence: z.string(),
        })),
        features: z.array(z.object({
          title: z.string(),
          description: z.string(),
          icon: z.string(),
        })),
        ctas: z.object({
          primary: z.array(z.object({
            text: z.string(),
            rationale: z.string(),
            urgency: z.string(),
          })),
          secondary: z.array(z.object({
            text: z.string(),
            rationale: z.string(),
          })),
        }),
        socialProof: z.array(z.object({
          type: z.string(), // "testimonial", "stats", "logo", "review"
          content: z.string(),
          attribution: z.string().optional(),
        })),
      }),
      
      // Social Media with Platform Optimization
      socialPosts: z.object({
        twitter: z.object({
          main: z.string(),
          variants: z.array(z.object({
            text: z.string(),
            type: z.enum(['question', 'stat', 'story', 'tip', 'announcement']),
          })),
          hashtags: z.array(z.string()),
          bestTime: z.string(),
          engagementPrediction: z.object({
            expectedImpressions: z.string(),
            expectedEngagement: z.string(),
            expectedClicks: z.string(),
            confidence: z.enum(['high', 'medium', 'low']),
          }),
        }),
        linkedin: z.object({
          main: z.string(),
          variants: z.array(z.object({
            text: z.string(),
            hookType: z.enum(['question', 'story', 'data', 'problem', 'solution']),
          })),
          bestTime: z.string(),
          engagementPrediction: z.object({
            expectedImpressions: z.string(),
            expectedEngagement: z.string(),
            expectedClicks: z.string(),
            confidence: z.enum(['high', 'medium', 'low']),
          }),
        }),
        hackerNews: z.object({
          title: z.string(),
          description: z.string(),
          engagementPrediction: z.object({
            expectedUpvotes: z.string(),
            expectedComments: z.string(),
            confidence: z.enum(['high', 'medium', 'low']),
          }),
          tips: z.array(z.string()),
        }),
        productHunt: z.object({
          title: z.string(),
          subtitle: z.string(),
          description: z.string(),
          tagline: z.string(),
          engagementPrediction: z.object({
            expectedUpvotes: z.string(),
            expectedComments: z.string(),
            confidence: z.enum(['high', 'medium', 'low']),
          }),
        }),
      }),
      
      // Email Sequence with Engagement Predictions
      emailSequence: z.array(z.object({
        day: z.number(), // 0, 1, 3, 5, 7
        subject: z.string(),
        previewText: z.string(),
        body: z.string(),
        engagementPrediction: z.object({
          expectedOpenRate: z.string(),
          expectedClickRate: z.string(),
          expectedConversionRate: z.string(),
          confidence: z.enum(['high', 'medium', 'low']),
        }),
        notes: z.string().optional(),
      })),
      
      // A/B Testing Strategy
      abTestingStrategy: z.object({
        recommendedTests: z.array(z.object({
          element: z.string(), // "headline", "cta", "hero_image", "social_proof"
          variants: z.array(z.object({
            name: z.string(),
            description: z.string(),
            hypothesis: z.string(),
            priority: z.number(),
          })),
          expectedImpact: z.string(),
          sampleSize: z.string(),
          duration: z.string(),
        })),
        controlVersion: z.string(),
      }),
      
      // Launch Timeline
      launchTimeline: z.array(z.object({
        day: z.number(), // -7, -3, -1, 0, 1, 3, 7, 14, 30
        phase: z.enum(['pre_launch', 'launch_day', 'post_launch']),
        action: z.string(),
        channel: z.string(),
        description: z.string(),
        priority: z.enum(['critical', 'high', 'medium', 'low']),
        deliverables: z.array(z.string()),
      })),
    });
    
    const prompt = `Create comprehensive marketing materials for this product:

Product: ${build.title || 'Product'}
Problem it solves: ${build.problem || 'See product'}
Solution: ${build.solution || 'Your solution'}
Key Features: ${JSON.stringify(build.features || [])}
Tech Stack: ${JSON.stringify(build.techStack || [])}
Target Audience: ${audience || 'General SaaS buyers'}
Tone: ${tone} (professional, casual, or urgent)

Generate in JSON format:
1. Positioning with customer profile
2. Landing page with 3-5 A/B headline variants and 3 CTA variants
3. Platform-optimized social posts with engagement predictions
4. Email sequence (5 emails) with open/click predictions
5. A/B testing strategy for first 30 days
6. Launch timeline (Day -7 to Day 30)

Engagement predictions should be realistic based on:
- Product Hunt typically: 100-500 upvotes, 10-50 comments
- Twitter: 1-10% engagement rate for good content
- Email: 20-40% open rate, 2-5% click rate for SaaS
- LinkedIn: 2-5% engagement rate`;

    const { object: marketing } = await generateObject({
      model: openai(this.model),
      schema: MarketingOutputSchema,
      prompt,
      system: SYSTEM_PROMPT,
    });
    
    const output: MarketingOutput = {
      positioning: marketing.positioning,
      landingPage: marketing.landingPage,
      socialPosts: marketing.socialPosts,
      emailSequence: marketing.emailSequence,
      abTestingStrategy: marketing.abTestingStrategy,
      launchTimeline: marketing.launchTimeline,
      tone,
      audience: audience || marketing.positioning.targetAudience,
    };
    
    // Save to database
    await saveCampaignTool.execute({
      projectId,
      campaign: output,
    });
    
    return {
      success: true,
      output,
      message: `Marketing campaign created with ${output.landingPage.headlines.length} headline variants and ${output.launchTimeline.length} timeline actions`,
    };
  }
}
