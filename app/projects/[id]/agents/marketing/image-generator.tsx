"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Image as ImageIcon, Loader2, Download, RefreshCw, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ImagePrompts {
  hero?: {
    prompt: string;
    aspectRatio: string;
    resolution: string;
  };
  features?: Array<{
    icon: string;
    prompt: string;
    aspectRatio: string;
    resolution: string;
  }>;
}

interface GeneratedImages {
  hero?: string;
  features?: Record<string, string>;
}

interface ImageGeneratorProps {
  productName: string;
  tagline: string;
  imagePrompts?: ImagePrompts;
  onImagesGenerated?: (images: GeneratedImages) => void;
}

export default function ImageGenerator({
  productName,
  tagline,
  imagePrompts,
  onImagesGenerated,
}: ImageGeneratorProps) {
  const params = useParams();
  const projectId = params.id as string;

  const [loading, setLoading] = useState<'idle' | 'generating' | 'complete'>('idle');
  const [generating, setGenerating] = useState<string | null>(null);
  const [images, setImages] = useState<GeneratedImages>({});
  const [activeTab, setActiveTab] = useState('hero');

  const generateImage = async (type: string, promptData: any) => {
    setGenerating(type);
    
    try {
      const res = await fetch('/api/images/nano-banana', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, data: promptData }),
      });

      const data = await res.json();

      if (data.success) {
        setImages(prev => ({
          ...prev,
          [type]: data.imageUrl,
        }));

        if (onImagesGenerated) {
          onImagesGenerated({
            ...images,
            [type]: data.imageUrl,
          });
        }
      }
    } catch (error) {
      console.error(`Failed to generate ${type} image:`, error);
    } finally {
      setGenerating(null);
    }
  };

  const generateAllImages = async () => {
    setLoading('generating');

    // Generate all images
    if (imagePrompts?.hero) {
      await generateImage('hero', {
        productName,
        tagline: imagePrompts.hero.prompt,
      });
    }

    if (imagePrompts?.features) {
      for (const feature of imagePrompts.features) {
        await generateImage(`feature-${feature.icon}`, {
          featureTitle: feature.icon,
          iconName: feature.icon,
        });
      }
    }

    setLoading('complete');
  };

  const downloadImage = async (url: string, filename: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Failed to download image:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          Image Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Generate All Button */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">
              Generate marketing images using Nano Banana Pro
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Requires: GOOGLE_API_KEY or NANO_BANANA_API_KEY
            </p>
          </div>
          <Button
            onClick={generateAllImages}
            disabled={loading === 'generating'}
          >
            {loading === 'generating' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <ImageIcon className="w-4 h-4 mr-2" />
                Generate All Images
              </>
            )}
          </Button>
        </div>

        {/* Image Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="hero">Hero Image</TabsTrigger>
            <TabsTrigger value="features">Feature Icons</TabsTrigger>
          </TabsList>

          {/* Hero Tab */}
          <TabsContent value="hero" className="space-y-4 mt-4">
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
              {images.hero ? (
                <div className="space-y-4">
                  <img
                    src={images.hero}
                    alt="Hero"
                    className="w-full max-w-2xl mx-auto rounded-lg shadow-lg"
                  />
                  <div className="flex justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => generateImage('hero', { productName, tagline })}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Regenerate
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadImage(images.hero!, 'hero.jpg')}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              ) : generating === 'hero' ? (
                <div className="space-y-4">
                  <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-500" />
                  <p className="text-gray-500">Generating hero image...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <ImageIcon className="w-12 h-12 mx-auto text-gray-300" />
                  <p className="text-gray-500">Click "Generate All Images" to create</p>
                </div>
              )}
            </div>

            {imagePrompts?.hero && (
              <div className="text-sm text-gray-500">
                <p className="font-medium mb-2">Prompt:</p>
                <p className="bg-gray-50 p-3 rounded text-left">
                  {imagePrompts.hero.prompt.slice(0, 200)}...
                </p>
              </div>
            )}
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-4 mt-4">
            <div className="grid grid-cols-4 gap-4">
              {imagePrompts?.features?.map((feature, index) => {
                const imageKey = `feature-${feature.icon}`;
                const hasImage = images[imageKey];

                return (
                  <div
                    key={index}
                    className="border rounded-lg p-4 text-center"
                  >
                    {hasImage ? (
                      <div className="space-y-2">
                        <img
                          src={images[imageKey]!}
                          alt={feature.icon}
                          className="w-20 h-20 mx-auto object-contain"
                        />
                        <p className="text-xs font-medium capitalize">
                          {feature.icon}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => generateImage(imageKey, {
                            featureTitle: feature.icon,
                            iconName: feature.icon,
                          })}
                        >
                          <RefreshCw className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : generating === imageKey ? (
                      <div className="w-20 h-20 mx-auto flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                      </div>
                    ) : (
                      <div className="w-20 h-20 mx-auto flex items-center justify-center bg-gray-50 rounded">
                        <Plus className="w-6 h-6 text-gray-300" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={async () => {
                for (const feature of imagePrompts?.features || []) {
                  await generateImage(`feature-${feature.icon}`, {
                    featureTitle: feature.icon,
                    iconName: feature.icon,
                  });
                }
              }}
              disabled={generating !== null}
            >
              {generating !== null ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Generate All Icons
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>

        {/* Status */}
        {loading === 'complete' && (
          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
            <Badge variant="secondary">Complete</Badge>
            <span className="text-sm text-green-700">
              All images generated successfully!
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
