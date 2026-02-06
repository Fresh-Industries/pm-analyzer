"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Megaphone, Loader2, Copy, CheckCircle, Mail, Twitter, Linkedin, Globe, Target, Calendar, TrendingUp, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function MarketingPanel() {
  const params = useParams();
  const projectId = params.id as string;
  
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'complete'>('idle');
  const [campaign, setCampaign] = useState<any>(null);
  const [build, setBuild] = useState<any>(null);
  const [tone, setTone] = useState<'professional' | 'casual' | 'urgent'>('professional');
  
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
        body: JSON.stringify({ build, tone }),
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
            Creating Marketing Campaign V2...
          </h3>
          <p className="text-pink-700 mb-4">
            Generating A/B variants, engagement predictions, and launch timeline
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
                Marketing Campaign V2 Ready!
              </h3>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="outline">{campaign.tone}</Badge>
              <Badge variant="outline">{campaign.audience}</Badge>
              <Badge className="bg-blue-100 text-blue-700">
                {campaign.landingPage?.headlines?.length || 0} A/B Variants
              </Badge>
              <Badge className="bg-purple-100 text-purple-700">
                {campaign.launchTimeline?.length || 0} Timeline Actions
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        {/* Engagement Predictions Summary */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{campaign.emailSequence?.[0]?.engagementPrediction?.expectedOpenRate || '25%'}</p>
              <p className="text-sm text-gray-500">Expected Email Opens</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <BarChart className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{campaign.socialPosts?.twitter?.engagementPrediction?.expectedClicks || '3%'}</p>
              <p className="text-sm text-gray-500">Expected Twitter CTR</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Target className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{campaign.abTestingStrategy?.recommendedTests?.length || 0}</p>
              <p className="text-sm text-gray-500">A/B Tests Recommended</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{campaign.launchTimeline?.length || 0}</p>
              <p className="text-sm text-gray-500">Launch Actions</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Tabs for Different Content */}
        <Tabs defaultValue="positioning" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="positioning">Positioning</TabsTrigger>
            <TabsTrigger value="landing">Landing Page</TabsTrigger>
            <TabsTrigger value="social">Social Media</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="abTests">A/B Tests</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>
          
          {/* Positioning Tab */}
          <TabsContent value="positioning" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Customer Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{campaign.positioning?.customerProfile?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Role</p>
                    <p className="font-medium">{campaign.positioning?.customerProfile?.role || 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-2">Pain Points</p>
                  <div className="flex flex-wrap gap-2">
                    {campaign.positioning?.customerProfile?.painPoints?.map((point: string, i: number) => (
                      <Badge key={i} variant="secondary">{point}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-2">Goals</p>
                  <div className="flex flex-wrap gap-2">
                    {campaign.positioning?.customerProfile?.goals?.map((goal: string, i: number) => (
                      <Badge key={i} variant="outline">{goal}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Positioning Statement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Tagline</p>
                  <p className="font-medium text-xl">{campaign.positioning?.tagline}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">One-Liner</p>
                  <p className="font-medium">{campaign.positioning?.oneLiner}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Main Benefit</p>
                  <p className="font-medium">{campaign.positioning?.mainBenefit}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Differentiation</p>
                  <p className="font-medium">{campaign.positioning?.differentiation}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Landing Page Tab with A/B Variants */}
          <TabsContent value="landing" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Headline A/B Variants ({campaign.landingPage?.headlines?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {campaign.landingPage?.headlines?.map((headline: any, i: number) => (
                  <div key={i} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <Badge variant={headline.expectedImpact === 'high' ? 'default' : 'secondary'} className="mb-2">
                          {headline.expectedImpact} impact
                        </Badge>
                        <p className="font-medium text-lg">{headline.text}</p>
                        <p className="text-sm text-gray-500 mt-1">{headline.rationale}</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => copyToClipboard(headline.text)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Primary CTAs A/B Variants</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {campaign.landingPage?.ctas?.primary?.map((cta: any, i: number) => (
                  <div key={i} className="p-3 border rounded-lg flex items-center justify-between">
                    <div>
                      <Badge variant="default" className="mb-1">{cta.urgency}</Badge>
                      <p className="font-medium">{cta.text}</p>
                      <p className="text-sm text-gray-500">{cta.rationale}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard(cta.text)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Key Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {campaign.landingPage?.keyBenefits?.map((benefit: any, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-1" />
                      <div>
                        <span className="font-medium">{benefit.benefit}</span>
                        <p className="text-sm text-gray-500">{benefit.supportingEvidence}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Social Media Tab */}
          <TabsContent value="social" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Twitter className="w-5 h-5 text-blue-400" />
                  Twitter with Predictions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-gray-100 rounded-lg">
                  <p className="whitespace-pre-wrap">{campaign.socialPosts?.twitter?.main}</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-lg font-bold text-green-700">{campaign.socialPosts?.twitter?.engagementPrediction?.expectedImpressions}</p>
                    <p className="text-sm text-gray-500">Impressions</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-lg font-bold text-blue-700">{campaign.socialPosts?.twitter?.engagementPrediction?.expectedEngagement}</p>
                    <p className="text-sm text-gray-500">Engagement</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <p className="text-lg font-bold text-purple-700">{campaign.socialPosts?.twitter?.engagementPrediction?.expectedClicks}</p>
                    <p className="text-sm text-gray-500">Clicks</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {campaign.socialPosts?.twitter?.hashtags?.map((tag: string, i: number) => (
                    <Badge key={i} variant="outline">{tag}</Badge>
                  ))}
                </div>
                <Button size="sm" onClick={() => copyToClipboard(campaign.socialPosts?.twitter?.main)}>
                  <Copy className="w-4 h-4 mr-1" /> Copy Tweet
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Linkedin className="w-5 h-5 text-blue-700" />
                  LinkedIn
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-100 p-4 rounded-lg whitespace-pre-wrap text-sm">
                  {campaign.socialPosts?.linkedin?.main}
                </pre>
                <Button size="sm" className="mt-2" onClick={() => copyToClipboard(campaign.socialPosts?.linkedin?.main)}>
                  <Copy className="w-4 h-4 mr-1" /> Copy LinkedIn Post
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Product Hunt Submission</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Title</p>
                  <p className="font-medium">{campaign.socialPosts?.productHunt?.title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tagline</p>
                  <p className="font-medium">{campaign.socialPosts?.productHunt?.tagline}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <p className="text-lg font-bold text-yellow-700">{campaign.socialPosts?.productHunt?.engagementPrediction?.expectedUpvotes}</p>
                    <p className="text-sm text-gray-500">Expected Upvotes</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-lg font-bold text-gray-700">{campaign.socialPosts?.productHunt?.engagementPrediction?.expectedComments}</p>
                    <p className="text-sm text-gray-500">Expected Comments</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Email Tab */}
          <TabsContent value="email" className="space-y-4 mt-4">
            {campaign.emailSequence?.map((email: any, i: number) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Mail className="w-5 h-5" />
                      Day {email.day}: {email.subject}
                    </span>
                    <Badge variant={email.engagementPrediction?.confidence === 'high' ? 'default' : 'secondary'}>
                      {email.engagementPrediction?.confidence} confidence
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <p className="text-lg font-bold text-green-700">{email.engagementPrediction?.expectedOpenRate}</p>
                      <p className="text-xs text-gray-500">Open Rate</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-blue-700">{email.engagementPrediction?.expectedClickRate}</p>
                      <p className="text-xs text-gray-500">Click Rate</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-purple-700">{email.engagementPrediction?.expectedConversionRate}</p>
                      <p className="text-xs text-gray-500">Conversion</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Preview Text</p>
                    <p className="font-medium">{email.previewText}</p>
                  </div>
                  <pre className="bg-gray-100 p-4 rounded-lg whitespace-pre-wrap text-sm max-h-64 overflow-y-auto">
                    {email.body}
                  </pre>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
          
          {/* A/B Tests Tab */}
          <TabsContent value="abTests" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  A/B Testing Strategy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-4">
                  Control: {campaign.abTestingStrategy?.controlVersion}
                </p>
                <div className="space-y-4">
                  {campaign.abTestingStrategy?.recommendedTests?.map((test: any, i: number) => (
                    <div key={i} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="outline">{test.element}</Badge>
                        <Badge>Priority: {test.priority}</Badge>
                      </div>
                      <p className="font-medium mb-2">{test.expectedImpact}</p>
                      <p className="text-sm text-gray-500 mb-2">{test.hypothesis}</p>
                      <div className="flex gap-4 text-sm">
                        <span>Sample: {test.sampleSize}</span>
                        <span>Duration: {test.duration}</span>
                      </div>
                      <div className="mt-3 space-y-2">
                        {test.variants?.map((variant: any, j: number) => (
                          <div key={j} className="p-2 bg-gray-50 rounded text-sm">
                            <p className="font-medium">{variant.name}: {variant.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Launch Timeline ({campaign.launchTimeline?.length} actions)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {campaign.launchTimeline?.map((item: any, i: number) => (
                    <div key={i} className={`p-4 rounded-lg border-l-4 ${
                      item.phase === 'pre_launch' ? 'border-blue-500' :
                      item.phase === 'launch_day' ? 'border-green-500' :
                      'border-purple-500'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge>{item.phase.replace('_', ' ')}</Badge>
                          <Badge variant={item.priority === 'critical' ? 'destructive' : 'outline'}>
                            {item.priority}
                          </Badge>
                          <span className="text-sm text-gray-500">Day {item.day}</span>
                        </div>
                        <Badge variant="outline">{item.channel}</Badge>
                      </div>
                      <p className="font-medium">{item.action}</p>
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {item.deliverables?.map((d: string, j: number) => (
                          <Badge key={j} variant="secondary" className="text-xs">{d}</Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
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
          Marketing Agent V2
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
            <div className="p-4 bg-pink-50 rounded-lg space-y-3">
              <p className="text-sm text-pink-700">
                📢 Ready to create launch campaign for:
              </p>
              <h4 className="font-medium">{build.title || 'Product'}</h4>
              
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Tone</p>
                <Select value={tone} onValueChange={(v) => setTone(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Target className="w-4 h-4" />
                <span>3-5 A/B headline variants</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                <span>Engagement predictions</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Launch timeline</span>
              </div>
              <div className="flex items-center gap-1">
                <BarChart className="w-4 h-4" />
                <span>A/B testing strategy</span>
              </div>
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
                  Generate Campaign V2
                </>
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
