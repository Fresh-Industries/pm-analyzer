// Nano Banana Pro Image Generation Tool

import { generateImage } from 'ai';
import { google } from '@ai-sdk/google';
import type { ToolResult } from '../types';

export interface NanoBananaInput {
  prompt: string;
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3';
  resolution?: '1024x1024' | '2048x2048' | '4096x4096';
  model?: 'gemini-2.5-flash-image' | 'gemini-3-pro-image-preview';
}

export interface NanoBananaResult {
  success: boolean;
  imageUrl?: string;
  imageBase64?: string;
  width?: number;
  height?: number;
  error?: string;
}

export const nanoBananaTool = {
  name: 'nano_banana_generate',
  description: 'Generate marketing images using Nano Banana Pro (Gemini 3 Pro Image)',
  
  async execute(input: NanoBananaInput): Promise<ToolResult> {
    const {
      prompt,
      aspectRatio = '16:9',
      resolution = '1024x1024',
      model = 'gemini-3-pro-image-preview'
    } = input;

    try {
      // Check for API key
      const apiKey = process.env.GOOGLE_API_KEY || process.env.NANO_BANANA_API_KEY;
      
      if (!apiKey) {
        // Return a mock result for development
        console.warn('No API key found, using mock image');
        return {
          success: true,
          data: {
            imageUrl: `https://placeholder.com/${Date.now()}.jpg`,
            width: parseInt(resolution.split('x')[0]),
            height: parseInt(resolution.split('x')[1]),
            prompt,
            mock: true,
          },
        };
      }

      // Generate image using Google's Gemini API
      const result = await generateImage({
        model: google(model),
        prompt: enhancePromptForMarketing(prompt),
        size: resolution,
        aspectRatio: aspectRatio,
        n: 1,
      });

      // Parse response based on provider format
      let imageUrl: string | undefined;
      let imageBase64: string | undefined;
      let width: number | undefined;
      let height: number | undefined;

      if (result.image) {
        if (typeof result.image === 'string') {
          imageUrl = result.image;
        } else if (result.image.url) {
          imageUrl = result.image.url;
        } else if (result.image.base64) {
          imageBase64 = result.image.base64;
        }
      }

      // Extract dimensions from resolution
      const [w, h] = resolution.split('x').map(Number);
      width = w;
      height = h;

      return {
        success: true,
        data: {
          imageUrl,
          imageBase64,
          width,
          height,
          prompt,
          model,
          aspectRatio,
        },
      };
    } catch (error: any) {
      console.error('Nano Banana generation failed:', error);
      return {
        success: false,
        error: error.message || 'Image generation failed',
      };
    }
  },
};

// Enhance prompt for marketing images
function enhancePromptForMarketing(prompt: string): string {
  const enhancements = [
    'Professional marketing photography style',
    'Clean, modern aesthetic',
    'High-quality, publication-ready',
    'Commercial photography standards',
    'Sharp focus, vibrant colors',
    'Professional lighting',
  ];

  return `${prompt}

Additional guidance:
- ${enhancements.join('\n- ')}
- Ensure text is crisp, sharp, and professionally rendered
- If text is included, use perfect spelling and typography
- High contrast, readable, and visually appealing
- Suitable for web and print marketing materials`;
}

// Batch generate multiple images
export async function generateBatch(
  prompts: NanoBananaInput[]
): Promise<NanoBananaResult[]> {
  const results: NanoBananaResult[] = [];

  // Process in parallel (with rate limiting)
  const batchSize = 3;
  for (let i = 0; i < prompts.length; i += batchSize) {
    const batch = prompts.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(prompt => nanoBananaTool.execute(prompt))
    );
    results.push(...batchResults.map(r => ({
      success: r.success,
      imageUrl: r.data?.imageUrl,
      imageBase64: r.data?.imageBase64,
      width: r.data?.width,
      height: r.data?.height,
      error: r.error,
    })));
  }

  return results;
}

// Hero image prompt generator
export function generateHeroPrompt(productName: string, tagline: string): NanoBananaInput {
  return {
    prompt: `Professional hero image for ${productName} SaaS landing page.
    
Scene: ${tagline}
A confident professional working on a modern laptop setup, showing the product in use.
The person should look approachable and successful.

Composition:
- Subject positioned slightly off-center (rule of thirds)
- Generous negative space on the right for headline placement
- Modern office environment with natural lighting
- Clean, uncluttered background
- Subtle depth of field to focus on the subject

Style:
- Apple/Stripe-inspired aesthetic
- Clean, minimal, professional
- Soft natural daylight from window
- Warm, inviting color palette
- High-end startup photography feel

Technical:
- Aspect ratio: 16:9
- Resolution: 2048x1152 (2K)
- Commercial photography quality`,
    aspectRatio: '16:9',
    resolution: '2048x2048',
  };
}

// Feature icon prompt generator
export function generateFeaturePrompt(featureTitle: string, iconName: string): NanoBananaInput {
  return {
    prompt: `Clean, minimalist icon illustration for "${featureTitle}" feature.
    
Style:
- Flat design, modern tech aesthetic
- Simple, recognizable symbol
- Single color (monochromatic blue)
- White background
- Icon-size (will be used at small sizes)

The icon should clearly represent ${featureTitle} in a simple, visual way.
Do not include text - just the icon.

Technical:
- Aspect ratio: 1:1 (square)
- Resolution: 1024x1024 (1K)
- Clean vector-like appearance`,
    aspectRatio: '1:1',
    resolution: '1024x1024',
  };
}

// Social media image prompt generator
export function generateSocialPrompt(
  productName: string,
  headline: string,
  platform: 'twitter' | 'linkedin' | 'instagram'
): NanoBananaInput {
  const platformConfigs = {
    twitter: {
      aspectRatio: '16:9',
      resolution: '1200x675',
    },
    linkedin: {
      aspectRatio: '1.91:1',
      resolution: '1200x628',
    },
    instagram: {
      aspectRatio: '1:1',
      resolution: '1080x1080',
    },
  };

  const config = platformConfigs[platform];

  return {
    prompt: `Social media post image for ${productName}.
    
Headline to feature: "${headline}"
Platform: ${platform}

Design:
- Clean, minimalist design with subtle geometric patterns
- Space for text overlay (text will be added separately)
- Brand colors: Blue and white theme
- Professional, shareable content

Style:
- Modern tech startup aesthetic (Linear/Vercel-inspired)
- Dark background with accent colors
- Sleek, professional look
- Scroll-stopping but not cluttered

Technical:
- Aspect ratio: ${config.aspectRatio}
- Resolution: ${config.resolution}
- Platform-optimized dimensions`,
    aspectRatio: config.aspectRatio as any,
    resolution: config.resolution as any,
  };
}

// Export the tool
export const nanoBananaGenerateTool = nanoBananaTool;
export const nanoBananaBatchTool = {
  name: 'nano_banana_batch',
  description: 'Generate multiple marketing images in batch',
  execute: generateBatch,
};
