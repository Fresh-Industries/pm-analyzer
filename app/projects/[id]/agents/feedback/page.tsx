// Feedback Analyzer - Analyzes user feedback with AI

'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { MessageSquare, Loader2, Send, TrendingUp, AlertTriangle, CheckCircle, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface FeedbackItem {
  text: string;
  source?: string;
}

export default function FeedbackPage() {
  const params = useParams();
  const projectId = params.id as string;
  
  const [feedback, setFeedback] = useState<FeedbackItem[]>([
    { text: '', source: '' },
  ]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'complete'>('idle');
  const [result, setResult] = useState<any>(null);
  
  const addFeedback = () => {
    setFeedback([...feedback, { text: '', source: '' }]);
  };
  
  const updateFeedback = (index: number, field: keyof FeedbackItem, value: string) => {
    const updated = [...feedback];
    updated[index] = { ...updated[index], [field]: value };
    setFeedback(updated);
  };
  
  const removeFeedback = (index: number) => {
    setFeedback(feedback.filter((_, i) => i !== index));
  };
  
  const analyzeFeedback = async () => {
    const validFeedback = feedback.filter(f => f.text.trim());
    
    if (validFeedback.length === 0) {
      alert('Please add at least one feedback item');
      return;
    }
    
    setLoading(true);
    setStatus('analyzing');
    
    try {
      const res = await fetch(`/api/projects/${projectId}/agents/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback: validFeedback }),
      });
      
      const data = await res.json();
      setResult(data.output);
      setStatus('complete');
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };
  
  if (status === 'analyzing') {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-8 text-center">
          <MessageSquare className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Analyzing Feedback...
          </h3>
          <p className="text-blue-700 mb-4">
            Processing {feedback.length} feedback items with AI
          </p>
          <Loader2 className="w-5 h-5 animate-spin mx-auto text-blue-500" />
        </CardContent>
      </Card>
    );
  }
  
  if (status === 'complete' && result) {
    return (
      <div className="space-y-6">
        {/* Score Card */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">Product Score</p>
                <p className={`text-4xl font-bold ${getScoreColor(result.score)}`}>
                  {result.score}/10
                </p>
                <Badge className={`mt-2 ${
                  result.sentiment === 'positive' ? 'bg-green-100' :
                  result.sentiment === 'negative' ? 'bg-red-100' :
                  'bg-yellow-100'
                }`}>
                  {result.sentiment.charAt(0).toUpperCase() + result.sentiment.slice(1)}
                </Badge>
              </div>
              <TrendingUp className="w-12 h-12 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        {/* Results Tabs */}
        <Tabs defaultValue="concerns" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="concerns">Concerns</TabsTrigger>
            <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
            <TabsTrigger value="themes">Themes</TabsTrigger>
            <TabsTrigger value="raw">Raw Data</TabsTrigger>
          </TabsList>
          
          {/* Concerns */}
          <TabsContent value="concerns" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  Areas of Concern
                </CardTitle>
              </CardHeader>
              <CardContent>
                {result.concerns.length === 0 ? (
                  <p className="text-muted-foreground">No concerns identified 🎉</p>
                ) : (
                  <ul className="space-y-3">
                    {result.concerns.map((concern: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 p-3 bg-red-50 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <span>{concern}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Suggestions */}
          <TabsContent value="suggestions" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-600" />
                  Improvement Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.suggestions.map((suggestion: any, i: number) => (
                  <div key={i} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">{suggestion.item}</p>
                      <Badge className={getPriorityColor(suggestion.priority)}>
                        {suggestion.priority} priority
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {suggestion.reasoning}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Effort: {suggestion.effort}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Themes */}
          <TabsContent value="themes" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Feedback Themes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {result.themes.map((theme: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge className={
                          theme.sentiment === 'positive' ? 'bg-green-100' :
                          theme.sentiment === 'negative' ? 'bg-red-100' :
                          'bg-yellow-100'
                        }>
                          {theme.count}
                        </Badge>
                        <span>{theme.name}</span>
                      </div>
                      <Badge variant="outline">
                        {theme.sentiment}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Raw Data */}
          <TabsContent value="raw" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Analyzed Feedback</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {result.rawFeedback.map((item: any, i: number) => (
                  <div key={i} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={
                        item.sentiment === 'positive' ? 'bg-green-100' :
                        item.sentiment === 'negative' ? 'bg-red-100' :
                        'bg-yellow-100'
                      }>
                        {item.sentiment}
                      </Badge>
                      {item.source && (
                        <span className="text-xs text-muted-foreground">{item.source}</span>
                      )}
                    </div>
                    <p className="text-sm">{item.text}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setStatus('idle')}>
            New Analysis
          </Button>
        </div>
      </div>
    );
  }
  
  // Input Form
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Feedback Analyzer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Paste user feedback to analyze. The AI will identify themes, concerns, and suggestions.
        </p>
        
        {feedback.map((item, index) => (
          <div key={index} className="space-y-3 p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Feedback #{index + 1}</span>
              {feedback.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFeedback(index)}
                  className="text-red-600"
                >
                  Remove
                </Button>
              )}
            </div>
            <Textarea
              placeholder="Paste user feedback here..."
              value={item.text}
              onChange={(e) => updateFeedback(index, 'text', e.target.value)}
              className="min-h-[80px]"
            />
            <input
              type="text"
              placeholder="Source (optional, e.g., App Store, Twitter)"
              value={item.source || ''}
              onChange={(e) => updateFeedback(index, 'source', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
        ))}
        
        <Button variant="outline" onClick={addFeedback} className="w-full">
          + Add Another Feedback Item
        </Button>
        
        <Button
          onClick={analyzeFeedback}
          disabled={loading || feedback.every(f => !f.text.trim())}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Analyze Feedback
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
