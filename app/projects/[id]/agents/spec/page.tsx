"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { FileText, Loader2, ArrowRight, BookOpen, Code, Database, Globe, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SpecPanel() {
  const params = useParams();
  const projectId = params.id as string;
  
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'complete'>('idle');
  const [spec, setSpec] = useState<any>(null);
  const [research, setResearch] = useState<any>(null);
  
  useEffect(() => {
    // Fetch existing research
    fetchResearch();
  }, [projectId]);
  
  const fetchResearch = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/agents/research`);
      const data = await res.json();
      if (data.status === 'complete') {
        setResearch(data.latest);
      }
    } catch (error) {
      console.error('Failed to fetch research:', error);
    }
  };
  
  const handleCreateSpec = async () => {
    if (!research) {
      alert('Please run research first!');
      return;
    }
    
    setLoading(true);
    setStatus('loading');
    
    try {
      const res = await fetch(`/api/projects/${projectId}/agents/spec`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request: research.project?.name || 'Product',
          research: research.details,
        }),
      });
      
      const data = await res.json();
      setSpec(data.output);
      setStatus('complete');
    } catch (error) {
      console.error('Spec generation failed:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (status === 'loading') {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-8 text-center">
          <FileText className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Creating Specification...
          </h3>
          <p className="text-blue-700 mb-4">
            Generating PRD, tech stack, and architecture
          </p>
          <Loader2 className="w-5 h-5 animate-spin mx-auto text-blue-500" />
        </CardContent>
      </Card>
    );
  }
  
  if (status === 'complete' && spec) {
    return (
      <div className="space-y-6">
        {/* Success Header */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold text-green-900">
                Specification Complete!
              </h3>
            </div>
            <h1 className="text-2xl font-bold mb-2">{spec.title}</h1>
            <p className="text-green-700">{spec.problem}</p>
          </CardContent>
        </Card>
        
        {/* Solution */}
        <Card>
          <CardHeader>
            <CardTitle>Solution</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{spec.solution}</p>
          </CardContent>
        </Card>
        
        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {spec.features?.map((feature: any, i: number) => (
                <div key={i} className="flex items-start gap-3 p-3 border rounded-lg">
                  <Badge variant={feature.priority === 'must' ? 'default' : 'secondary'}>
                    {feature.priority}
                  </Badge>
                  <div>
                    <h4 className="font-medium">{feature.name}</h4>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Tech Stack */}
        <Card>
          <CardHeader>
            <CardTitle>Tech Stack</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Frontend</p>
                  <p className="font-medium">{spec.techStack?.frontend}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Code className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-500">Backend</p>
                  <p className="font-medium">{spec.techStack?.backend}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-500">Database</p>
                  <p className="font-medium">{spec.techStack?.database}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-500">Auth</p>
                  <p className="font-medium">{spec.techStack?.auth}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Architecture */}
        <Card>
          <CardHeader>
            <CardTitle>Architecture</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{spec.architecture}</p>
          </CardContent>
        </Card>
        
        {/* File Structure */}
        <Card>
          <CardHeader>
            <CardTitle>File Structure</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
              {spec.fileStructure?.map((file: any, i: number) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-blue-400">{file.path}</span>
                  <span className="text-gray-500">-</span>
                  <span className="text-gray-400">{file.description}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* API Endpoints */}
        <Card>
          <CardHeader>
            <CardTitle>API Endpoints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {spec.apiEndpoints?.map((endpoint: any, i: number) => (
                <div key={i} className="flex items-center gap-3 p-2 border rounded">
                  <Badge variant="outline" className="font-mono">
                    {endpoint.method}
                  </Badge>
                  <code className="text-sm">{endpoint.path}</code>
                  <span className="text-gray-500 text-sm">- {endpoint.description}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setStatus('idle')}>
            New Spec
          </Button>
          <Button asChild>
            <a href={`/projects/${projectId}/agents/build`}>
              Build Now <ArrowRight className="w-4 h-4 ml-2" />
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
          <FileText className="w-5 h-5 text-blue-600" />
          Spec Agent
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!research ? (
          <div className="text-center py-8">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              Run research first to generate a specification
            </p>
            <Button asChild variant="outline">
              <a href={`/projects/${projectId}/agents/research`}>
                Go to Research
              </a>
            </Button>
          </div>
        ) : (
          <>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                📋 Ready to create specification based on research:
              </p>
              <h4 className="font-medium mt-2">{research.project?.name || 'Product'}</h4>
              <p className="text-sm text-gray-600 mt-1">
                {research.competitors?.length || 0} competitors analyzed
              </p>
            </div>
            
            <Button 
              onClick={handleCreateSpec}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Spec...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Specification
                </>
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
