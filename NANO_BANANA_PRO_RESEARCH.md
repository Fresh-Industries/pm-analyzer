# Nano Banana Pro Research - AI Image Generation for Marketing Assets

## Executive Summary

Research on integrating **Nano Banana Pro** (Gemini 3 Pro Image) into the Marketing Agent for generating marketing visual assets. Key findings:
- **Commercial use allowed** for marketing materials
- **High-resolution output:** Up to 4K
- **Superior text rendering** for headlines, CTAs
- **Character consistency** for brand assets
- **API integration** via Google Gemini API

---

## Part 1: What is Nano Banana Pro?

### The Two Models

| Feature | Nano Banana (V1) | Nano Banana Pro (V2) |
|---------|-------------------|----------------------|
| **Model** | Gemini 2.5 Flash Image | Gemini 3 Pro Image |
| **Speed** | Fast | 2-5x slower |
| **Resolution** | 1K | Up to 4K |
| **Text Rendering** | Good | **Sharp, professional** |
| **Character Consistency** | Good | **Superior** |
| **Credits per image** | 2 | 8 (1K/2K) or 16 (4K) |

### Why Pro for Marketing

- ✅ Print materials (4K resolution)
- ✅ Posters with text (multilingual support)
- ✅ Image series (character consistency)
- ✅ Professional marketing (photography control)
- ✅ Vertical content (Stories, Reels 9:16)

---

## Part 2: Commercial Use & Pricing

### Commercial Rights

**Yes!** Nano Banana Pro supports commercial use for:
- Professional content
- Marketing materials
- Social media assets
- AI-generated UGC

All outputs include **SynthID watermarking** for transparency.

### Pricing Structure

| Plan | Price | Credits | Pro Images |
|------|-------|---------|------------|
| **Monthly** | $9.99/mo | 100 | ~6-12 images |
| **Pro** | $29.99/mo | 500 | ~31-62 images |
| **Enterprise** | $79.99/mo | 1600 | ~100-200 images |

### Credit Usage

| Model | Resolution | Credits |
|-------|------------|---------|
| Nano Banana | 1K | 2 credits |
| Nano Banana Pro | 1K-2K | 8 credits |
| Nano Banana Pro | 4K | 16 credits |

---

## Part 3: Core Features for Marketing

### 1. Text Rendering (Critical for Marketing)

Nano Banana Pro excels at rendering sharp, professional text:
- Headlines on hero images
- CTA buttons with text
- Product names
- Multilingual support

**Pro tip:** Add "crisp, sharp, professional text rendering, perfect legibility" to prompts.

### 2. Character Consistency

Maintain the same person/avatar across multiple marketing images:
- Brand mascot consistency
- Founder/team photos
- Customer testimonials with same person

### 3. Multi-Image Fusion

Blend multiple images seamlessly:
- Product + lifestyle backgrounds
- Before/after comparisons
- Feature collages

### 4. Brand Consistency

Template support for:
- Real estate listings
- Product catalogs
- Social media templates
- Email newsletter headers

---

## Part 4: 6-Step Prompting Methodology

This is Google's official methodology for getting professional results:

### Step 1: Define Context and Purpose
```
What for?    → Image type (ad, poster, infographic, hero)
Who?         → Target audience
Where?       → Platform (Instagram, email, print)
```

**Example:** "Hero image for SaaS landing page, target: startup founders, platform: web"

### Step 2: Describe Subject and Action
```
Who/what?    → Main subject
What doing?  → Action or pose
Where?       → Setting/location
```

**Example:** "Confident entrepreneur at standing desk, laptop open, modern office"

### Step 3: Plan Layout
```
Framing      → Wide shot, close-up, etc.
Layout       → Arrangement of elements
Focus        → What should stand out
Background   → Colors, environment
```

### Step 4: Specify Style
**Method 1: References**
- "Apple Keynote presentation style"
- "Dribbble poster aesthetic"
- "in the style of [magazine/artist]"

**Method 2: Upload references**
- Upload 3-5 reference images
- AI describes style → use in prompt

### Step 5: Add Technical Parameters
```
Lighting     → Studio, natural, golden hour
Camera       → 35mm, 50mm, 85mm lens
Depth        → Shallow or deep
Aspect Ratio → 1:1, 16:9, 9:16
Resolution   → 1K, 2K, 4K
```

### Step 6: Iterate and Refine
The model preserves context:
- "Make the headline larger"
- "Add more whitespace"
- "Darker background"
- "Shift product to right"

---

## Part 5: Marketing Asset Types to Generate

### For Landing Pages

| Asset | Dimensions | Purpose |
|-------|------------|---------|
| Hero background | 1920x1080 | Above the fold |
| Feature icons | 256x256 | Feature grid |
| Product screenshot | 1200x800 | Product showcase |
| Customer photos | 400x400 | Testimonials |

### For Social Media

| Platform | Dimensions | Purpose |
|----------|------------|---------|
| Twitter/X | 1200x675 | Link preview |
| LinkedIn | 1200x627 | Article cover |
| Instagram Square | 1080x1080 | Feed post |
| Instagram Story | 1080x1920 | Story/Reels |
| Product Hunt | 1200x628 | Launch thumbnail |

### For Email

| Asset | Dimensions | Purpose |
|-------|------------|---------|
| Header | 600x200 | Email top image |
| Banner | 600x150 | Promotional banner |
| Footer | 600x100 | Email signature |

### For Ads

| Platform | Dimensions | Purpose |
|----------|------------|---------|
| Google Display | 300x250 | Rectangle ad |
| Facebook | 1200x628 | Link ad |
| LinkedIn Sponsored | 1200x627 | Sponsored content |

---

## Part 6: Integration Architecture

### How It Fits Our Marketing Agent

```
┌─────────────────────────────────────────────────────────────────┐
│                    MARKETING AGENT V3                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  INPUT                                                           │
│  ├── Product spec, positioning, campaign copy                    │
│  └── Tone (professional/casual/urgent)                           │
│                                                                  │
│  PROCESSING                                                      │
│  ├── Generate marketing copy (V2)                                │
│  ├── Generate image prompts for each asset                       │
│  │   ├── Hero image prompt                                       │
│  │   ├── Feature icons prompts                                    │
│  │   ├── Social media prompts                                    │
│  │   ├── Ad creative prompts                                     │
│  │   └── Email header prompts                                    │
│  └── Call Nano Banana Pro API for images                        │
│                                                                  │
│  OUTPUT                                                          │
│  ├── Landing page: hero.jpg, icons/*.png                         │
│  ├── Social: twitter.jpg, linkedin.jpg, instagram.jpg            │
│  ├── Email: header.png, banner.png                               │
│  └── Ads: display-ad.jpg, facebook-ad.jpg                       │
│                                                                  │
│  INTEGRATION                                                     │
│  ├── gemini-api via @ai-sdk/google                               │
│  └── Store assets in Supabase Storage / S3                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Image Prompts Generated

**Hero Image Prompt:**
```
Hero background image for SaaS landing page, target: startup founders
Confident entrepreneur at standing desk, laptop open, modern office with natural lighting
Layout: Subject slightly off-center left, generous negative space right for headline
Style: Clean, professional, Apple-inspired aesthetic
Lighting: Soft natural daylight from left
Aspect ratio: 16:9, Resolution: 2K
Background: Soft gray-blue gradient, minimal distractions
Include: Modern furniture, plants, warm professional atmosphere
```

**Social Media Prompt:**
```
Social media post image for tech product announcement
Clean, minimalist design with subtle geometric patterns
Layout: Center-aligned, space for overlay text (will be added later)
Style: Modern tech aesthetic, Dribbble trending style
Colors: Primary blue (#2563EB), white background
Aspect ratio: 1:1, Resolution: 1K
Include: Professional, shareable, platform-optimized
```

---

## Part 7: API Integration

### Google Gemini API (nano-banana.pro)

```typescript
import { google } from '@ai-sdk/google';

async function generateMarketingImage(prompt: string): Promise<Buffer> {
  const result = await generateImage({
    model: google('gemini-3-pro-image-preview'),
    prompt: prompt,
    size: '1024x1024', // or '2048x2048', '4096x4096'
    n: 1,
  });
  
  return result.image;
}
```

### Alternative: Nano Banana API

```typescript
import { nanobanana } from '@nanobanana/sdk';

const client = new nanobanana({
  apiKey: process.env.NANO_BANANA_KEY,
});

async function generateAsset(prompt: string, options: {
  resolution: '1k' | '2k' | '4k';
  aspectRatio: '1:1' | '16:9' | '9:16';
}) {
  const image = await client.images.generate({
    model: 'pro',
    prompt,
    resolution: options.resolution,
    aspectRatio: options.aspectRatio,
  });
  
  return image.url;
}
```

---

## Part 8: Implementation Plan

### Phase 1: Image Prompt Generator (Easy)
- [ ] Extend MarketingAgent to generate image prompts
- [ ] Create prompt templates for each asset type
- [ ] Add to V2 output structure

### Phase 2: API Integration (Medium)
- [ ] Add Nano Banana Pro API client
- [ ] Create image generation tool
- [ ] Handle credits/billing

### Phase 3: Asset Management (Medium)
- [ ] Upload to Supabase Storage / S3
- [ ] Store URLs in database
- [ ] Download and serve images

### Phase 4: UI Updates (Easy)
- [ ] Show generated images in Marketing UI
- [ ] Download buttons for each asset
- [ ] Regenerate individual images

---

## Part 9: Cost Analysis

### Per Marketing Campaign

| Asset Type | Count | Credits Each | Total Credits |
|------------|-------|---------------|---------------|
| Hero image | 1 | 8 | 8 |
| Feature icons | 4 | 2 | 8 |
| Social posts | 4 | 2 | 8 |
| Email headers | 2 | 2 | 4 |
| Ad creatives | 3 | 4 | 12 |
| **Total** | **14** | - | **~40 credits** |

### Cost Estimate

| Plan | Cost per Campaign | Campaigns/Month |
|------|-------------------|-----------------|
| Monthly ($9.99) | ~$3.20 | ~3 |
| Pro ($29.99) | ~$2.40 | ~12 |
| Enterprise ($79.99) | ~$2.00 | ~40 |

**Recommendation:** Pro plan ($29.99/mo) supports ~12 campaigns/month

---

## Part 10: Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Image generation time | <30 sec | Per image |
| Credit cost per campaign | <$3 | Total credits × CPM |
| Human edits needed | <20% | Regeneration rate |
| Asset variety score | >3 variants | A/B test options |

### Quality Checklist

- [ ] Sharp, readable text
- [ ] Consistent brand style
- [ ] Platform-optimized dimensions
- [ ] Professional, shareable
- [ ] No watermarks (use Pro plan)

---

## Part 11: Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| API rate limits | Medium | Queue system, retry logic |
| Credit exhaustion | High | Monthly budgets, alerts |
| Inconsistent style | Medium | Prompt templates, references |
| Text rendering issues | Medium | Iteration prompts, quality check |

---

## Part 12: Sample Prompts

### Hero Image (SaaS)
```
Hero background image for productivity SaaS landing page, target: remote workers
Young professional at home office setup, focused on laptop screen, genuine smile
Layout: Subject right-aligned, generous negative space left for headline placement
Style: Clean, modern, Notion-inspired aesthetic
Lighting: Soft natural light from window, warm tones
Aspect ratio: 16:9, Resolution: 2K
Include: Modern furniture, plant, coffee cup, clean desk, professional yet approachable
Exclude: Stock photo look, fake poses, unnatural lighting
```

### Feature Icon (Simple)
```
Icon for "Real-time Collaboration" feature
Simple, minimal illustration style
Single object: Two chat bubbles connecting
Colors: Primary blue (#2563EB), white background
Style: Flat design, rounded corners, modern tech
Size: Square 1:1, Resolution: 1K
Include: Clean, scalable, icon-style graphics
```

### Social Media Post
```
Social media announcement image for new product launch
Minimalist design with geometric shapes and product placeholder
Layout: Center-aligned, space for text overlay (we'll add text later)
Style: Modern tech startup aesthetic, similar to Linear or Vercel
Colors: Dark background (#0F172A), accent in cyan (#22D3EE)
Aspect ratio: 1:1, Resolution: 1K
Include: Professional, sleek, platform-native look
```

### Email Header
```
Email newsletter header image for weekly tech digest
Professional, clean design
Layout: Horizontal banner, space for headline text
Style: Editorial tech publication (like TechCrunch)
Colors: White background, bold accent text area
Aspect ratio: 3:1 (600x200), Resolution: 1K
Include: Trustworthy, readable, professional
```

### Ad Creative
```
Facebook ad creative for productivity tool
Engaging visual with clear focal point
Layout: Product or person on left, text space right
Style: High-converting ad aesthetic, similar to Facebook best practices
Colors: Attention-grabbing but not garish, professional
Aspect ratio: 1.91:1 (1200x628), Resolution: 1K
Include: Eye-catching, scroll-stopping, brand-consistent
```

---

## Part 13: Resources

### Official Documentation
- **Google AI Image Generation:** https://ai.google.dev/gemini-api/docs/image-generation
- **Nano Banana Pro:** https://www.nano-banana.ai/
- **Nano Banana API:** https://nanobanana.im/

### Tutorials & Guides
- **Complete Guide for Marketers:** https://blog.novaexpress.ai/2026/01/29/nano-banana-pro-the-complete-guide-for-marketers-2026/
- **Google AI Studio:** https://aistudio.google.com/

### Pricing
- **Nano Banana Pricing:** https://www.nano-banana.ai/#pricing

---

## Summary

### What Nano Banana Pro Adds

| Asset | Use Case | Dimensions |
|-------|----------|------------|
| Hero image | Landing page above fold | 1920x1080 |
| Feature icons | Product features grid | 256x256 |
| Social posts | Twitter, LinkedIn, IG | 1080x1080 |
| Email headers | Newsletter top | 600x200 |
| Ad creatives | Facebook, Google Ads | 1200x628 |

### Key Benefits

1. **Professional text rendering** - Sharp headlines, CTAs
2. **Brand consistency** - Same style across all assets
3. **Cost-effective** - ~$2-3 per campaign
4. **Fast generation** - <30 seconds per image
5. **Commercial rights** - Full marketing use

### Next Steps

1. Add image prompt generation to MarketingAgent V3
2. Integrate Nano Banana Pro API
3. Create asset storage
4. Update UI with image gallery
5. Test with real campaigns

---

**Research completed:** February 5, 2026  
**Sources:** nano-banana.ai, Google AI Developer Docs, Nova Express Blog
