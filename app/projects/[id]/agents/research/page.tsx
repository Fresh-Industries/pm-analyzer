"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { BrainCircuit, Loader2, ArrowRight, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ResearchPanel() {
  const params = useParams();
  const projectId = params.id as string;
  
  const [request, setRequest] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'complete'>('idle');
  
  const handleResearch = async () => {
    if (!request.trim()) return;
    
    setLoading(true);
    setStatus('loading');
    
    try {
      const res = await fetch(`/api/projects/${projectId}/agents/research`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request }),
      });
      
      const data = await res.json();
      setResult(data);
      setStatus('complete');
    } catch (error) {
      console.error('Research failed:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (status === 'loading') {
    return (
      <Card className="border-purple-200 bg-purple-50">
        <CardContent className="p-8 text-center">
          <BrainCircuit className="w-12 h-12 text-purple-600 mx-auto mb-4 animate-pulse" />
          <h3 className="text-lg font-semibold text-purple-900 mb-2">
            Researching Market...
          </h3>
          <p className="text-purple-700 mb-4">
            Finding competitors, market size, and opportunities
          </p>
          <Loader2 className="w-5 h-5 animate-spin mx-auto text-purple-500" />
        </CardContent>
      </Card>
    );
  }
  
  if (status === 'complete' && result?.success) {
    return (
      <div className="space-y-6">
        {/* Success Card */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold text-green-900">
                Research Complete!
              </h3>
            </div>
            <p className="text-green-700">
              Found {result.output.competitors.length} competitors and {result.output.opportunities.length} opportunities
            </p>
          </CardContent>
        </Card>
        
        {/* Competitors */}
        <Card>
          <CardHeader>
            <CardTitle>Competitors Found</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {result.output.competitors.slice(0, 5).map((comp: any, i: number) => (
                <div key={i} className="p-3 border rounded-lg">
                  <h4 className="font-medium">{comp.name}</h4>
                  {comp.pricing && (
                    <p className="text-sm text-gray-600">💰 {comp.pricing}</p>
                  )}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {comp.features?.slice(0, 3).map((f: string, j: number) => (
                      <span key={j} className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Opportunities */}
        <Card>
          <CardHeader>
            <CardTitle>Opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.output.opportunities.map((opp: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>{opp}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        
        {/* Risks */}
        <Card>
          <CardHeader>
            <CardTitle>Risks</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.output.risks.map((risk: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-red-600">⚠</span>
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        
        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.output.recommendations.map((rec: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-blue-600">💡</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        
        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setStatus('idle')}>
            New Research
          </Button>
          <Button asChild>
            <a href={`/projects/${projectId}/agents/spec`}>
              Create Spec <ArrowRight className="w-4 h-4 ml-2" />
            </a>
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-purple-600" />
          Research Agent
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>What should we research?</Label>
          <Input
            placeholder="e.g., Build a SaaS for dog walkers"
            value={request}
            onChange={(e) => setRequest(e.target.value)}
          />
          <p className="text-sm text-gray-500">
            The agent will research competitors, market size, and opportunities
          </p>
        </div>
        
        <Button 
          onClick={handleResearch} 
          disabled={loading || !request.trim()}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Researching...
            </>
          ) : (
            <>
              <BrainCircuit className="w-4 h-4 mr-2" />
              Start Research
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
