"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Megaphone, Loader2, Copy, CheckCircle, Mail, Twitter, Linkedin, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MarketingPanel() {
  const params = useParams();
  const projectId = params.id as string;
  
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'complete'>('idle');
  const [campaign, setCampaign] = useState<any>(null);
  const [build, setBuild] = useState<any>(null);
  
  useEffect(() => {
    fetchBuild();
  }, [projectId]);
  
  const fetchBuild = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/agents/build`);
      const data = await res.json();
      if (data.status === 'complete') {
        setBuild(data.latest);
      }
    } catch (error) {
      console.error('Failed to fetch build:', error);
    }
  };
  
  const handleGenerate = async () => {
    if (!build) {
      alert('Please run the build first!');
      return;
    }
    
    setLoading(true);
    setStatus('loading');
    
    try {
      const res = await fetch(`/api/projects/${projectId}/agents/marketing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ build }),
      });
      
      const data = await res.json();
      setCampaign(data.output);
      setStatus('complete');
    } catch (error) {
      console.error('Marketing generation failed:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };
  
  if (status === 'loading') {
    return (
      <Card className="border-pink-200 bg-pink-50">
        <CardContent className="p-8 text-center">
          <Megaphone className="w-12 h-12 text-pink-600 mx-auto mb-4 animate-pulse" />
          <h3 className="text-lg font-semibold text-pink-900 mb-2">
            Creating Marketing Materials...
          </h3>
          <p className="text-pink-700 mb-4">
            Generating landing page, social posts, and email sequence
          </p>
          <Loader2 className="w-5 h-5 animate-spin mx-auto text-pink-500" />
        </CardContent>
      </Card>
    );
  }
  
  if (status === 'complete' && campaign) {
    return (
      <div className="space-y-6">
        {/* Success Header */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold text-green-900">
                Marketing Materials Ready!
              </h3>
            </div>
            <p className="text-green-700">
              Your complete launch campaign is ready to deploy.
            </p>
          </CardContent>
        </Card>
        
        {/* Positioning */}
        <Card>
          <CardHeader>
            <CardTitle>Positioning</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Tagline</p>
              <p className="font-medium text-lg">{campaign.positioning?.tagline}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">One-Liner</p>
              <p className="font-medium">{campaign.positioning?.oneLiner}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Target Audience</p>
                <p className="font-medium">{campaign.positioning?.targetAudience}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Main Benefit</p>
                <p className="font-medium">{campaign.positioning?.mainBenefit}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Tabs for Different Content */}
        <Tabs defaultValue="landing" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="landing">Landing Page</TabsTrigger>
            <TabsTrigger value="social">Social Media</TabsTrigger>
            <TabsTrigger value="email">Email Sequence</TabsTrigger>
            <TabsTrigger value="hackerNews">Hacker News</TabsTrigger>
          </TabsList>
          
          {/* Landing Page Tab */}
          <TabsContent value="landing" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Hero Section
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Headline</p>
                  <p className="font-medium text-xl">{campaign.landingPage?.heroHeadline}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Subheadline</p>
                  <p className="text-gray-700">{campaign.landingPage?.heroSubheadline}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => copyToClipboard(campaign.landingPage?.heroHeadline)}>
                    <Copy className="w-4 h-4 mr-1" /> Copy Headline
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Key Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {campaign.landingPage?.keyBenefits?.map((benefit: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-1" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>CTA</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Badge className="bg-green-600 text-lg px-4 py-2">
                    {campaign.landingPage?.cta?.primary}
                  </Badge>
                  <Badge variant="outline" className="text-lg px-4 py-2">
                    {campaign.landingPage?.cta?.secondary}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Social Media Tab */}
          <TabsContent value="social" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Twitter className="w-5 h-5 text-blue-400" />
                  Twitter / X Post
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-100 p-4 rounded-lg whitespace-pre-wrap text-sm">
                  {campaign.socialPosts?.twitter}
                </pre>
                <Button size="sm" className="mt-2" onClick={() => copyToClipboard(campaign.socialPosts?.twitter)}>
                  <Copy className="w-4 h-4 mr-1" /> Copy
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Linkedin className="w-5 h-5 text-blue-700" />
                  LinkedIn Post
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-100 p-4 rounded-lg whitespace-pre-wrap text-sm">
                  {campaign.socialPosts?.linkedin}
                </pre>
                <Button size="sm" className="mt-2" onClick={() => copyToClipboard(campaign.socialPosts?.linkedin)}>
                  <Copy className="w-4 h-4 mr-1" /> Copy
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Email Tab */}
          <TabsContent value="email" className="space-y-4 mt-4">
            {campaign.emailSequence?.map((email: any, i: number) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    {email.timing}: {email.subject}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">Preview Text: {email.previewText}</p>
                    <pre className="bg-gray-100 p-4 rounded-lg whitespace-pre-wrap text-sm">
                      {email.body}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
          
          {/* Hacker News Tab */}
          <TabsContent value="hackerNews" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Show HN</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Title</p>
                  <p className="font-medium">{campaign.socialPosts?.productHunt?.title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tagline</p>
                  <p className="font-medium">{campaign.socialPosts?.productHunt?.tagline}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Description</p>
                  <pre className="bg-gray-100 p-4 rounded-lg whitespace-pre-wrap text-sm">
                    {campaign.socialPosts?.productHunt?.description}
                  </pre>
                </div>
                <Button size="sm" onClick={() => copyToClipboard(campaign.socialPosts?.productHunt?.description)}>
                  <Copy className="w-4 h-4 mr-1" /> Copy for HN
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setStatus('idle')}>
            Generate New Campaign
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-pink-600" />
          Marketing Agent
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!build ? (
          <div className="text-center py-8">
            <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              Complete a build first to generate marketing materials
            </p>
            <Button asChild variant="outline">
              <a href={`/projects/${projectId}/agents/build`}>
                Go to Build
              </a>
            </Button>
          </div>
        ) : (
          <>
            <div className="p-4 bg-pink-50 rounded-lg">
              <p className="text-sm text-pink-700">
                📢 Ready to create launch campaign for:
              </p>
              <h4 className="font-medium mt-2">{build.title || 'Product'}</h4>
              <p className="text-sm text-gray-600 mt-1">
                {build.githubUrl ? '✅ GitHub repo created' : ''}
              </p>
            </div>
            
            <Button 
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-pink-600 hover:bg-pink-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Megaphone className="w-4 h-4 mr-2" />
                  Generate Campaign
                </>
              )}
            </Button>
            
            <p className="text-xs text-gray-500 text-center">
              Creates landing page, social posts, and email sequence
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
