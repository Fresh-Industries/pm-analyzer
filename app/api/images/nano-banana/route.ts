// Nano Banana Image Generation API Route

import { NextRequest, NextResponse } from 'next/server';
import { nanoBananaTool, generateHeroPrompt, generateFeaturePrompt, generateSocialPrompt } from '@/lib/agents/tools/nano-banana';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    let result;

    switch (type) {
      case 'hero':
        result = await nanoBananaTool.execute(
          generateHeroPrompt(data.productName, data.tagline)
        );
        break;

      case 'feature':
        result = await nanoBananaTool.execute(
          generateFeaturePrompt(data.featureTitle, data.iconName)
        );
        break;

      case 'social':
        result = await nanoBananaTool.execute(
          generateSocialPrompt(data.productName, data.headline, data.platform)
        );
        break;

      case 'custom':
        result = await nanoBananaTool.execute({
          prompt: data.prompt,
          aspectRatio: data.aspectRatio || '16:9',
          resolution: data.resolution || '1024x1024',
        });
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid type. Use: hero, feature, social, or custom' },
          { status: 400 }
        );
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Generation failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      imageUrl: result.data?.imageUrl,
      width: result.data?.width,
      height: result.data?.height,
      mock: result.data?.mock,
    });
  } catch (error: any) {
    console.error('Nano Banana API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// Batch generation endpoint
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { images } = body;

    const results = await Promise.all(
      images.map((img: any) =>
        nanoBananaTool.execute({
          prompt: img.prompt,
          aspectRatio: img.aspectRatio || '16:9',
          resolution: img.resolution || '1024x1024',
        })
      )
    );

    return NextResponse.json({
      success: true,
      results: results.map((r, i) => ({
        success: r.success,
        imageUrl: r.data?.imageUrl,
        error: r.error,
      })),
    });
  } catch (error: any) {
    console.error('Batch generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Batch generation failed' },
      { status: 500 }
    );
  }
}
