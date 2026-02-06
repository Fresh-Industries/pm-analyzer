"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Code2, Loader2, ArrowRight, Github, Globe, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function BuildPanel() {
  const params = useParams();
  const projectId = params.id as string;
  
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'complete' | 'failed'>('idle');
  const [progress, setProgress] = useState(0);
  const [build, setBuild] = useState<any>(null);
  const [spec, setSpec] = useState<any>(null);
  
  useEffect(() => {
    fetchSpec();
  }, [projectId]);
  
  const fetchSpec = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/agents/spec`);
      const data = await res.json();
      if (data.status === 'complete') {
        setSpec(data.latest);
      }
    } catch (error) {
      console.error('Failed to fetch spec:', error);
    }
  };
  
  const handleBuild = async () => {
    if (!spec) {
      alert('Please create a specification first!');
      return;
    }
    
    setLoading(true);
    setStatus('loading');
    setProgress(0);
    
    // Simulate progress (in real implementation, use WebSocket or polling)
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 5, 90));
    }, 2000);
    
    try {
      const res = await fetch(`/api/projects/${projectId}/agents/build`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spec: spec.details || spec }),
      });
      
      const data = await res.json();
      clearInterval(progressInterval);
      setProgress(100);
      
      if (data.success) {
        setBuild(data.output);
        setStatus('complete');
      } else {
        setStatus('failed');
      }
    } catch (error) {
      clearInterval(progressInterval);
      console.error('Build failed:', error);
      setStatus('failed');
    } finally {
      setLoading(false);
    }
  };
  
  if (status === 'loading') {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-8 text-center">
          <Code2 className="w-12 h-12 text-green-600 mx-auto mb-4 animate-pulse" />
          <h3 className="text-lg font-semibold text-green-900 mb-2">
            Building Your Product...
          </h3>
          <p className="text-green-700 mb-4">
            OpenHands is implementing features based on your spec
          </p>
          <Progress value={progress} className="w-full max-w-md mx-auto mb-2" />
          <p className="text-sm text-green-600">{progress}% complete</p>
        </CardContent>
      </Card>
    );
  }
  
  if (status === 'complete' && build) {
    return (
      <div className="space-y-6">
        {/* Success Header */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold text-green-900">
                Build Complete!
              </h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {build.githubUrl && (
                <a 
                  href={build.githubUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-white rounded-lg border hover:bg-gray-50"
                >
                  <Github className="w-6 h-6" />
                  <div>
                    <p className="text-sm text-gray-500">GitHub PR</p>
                    <p className="font-medium">View Pull Request</p>
                  </div>
                </a>
              )}
              
              {build.deployedUrl && (
                <a 
                  href={build.deployedUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-white rounded-lg border hover:bg-gray-50"
                >
                  <Globe className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Live Demo</p>
                    <p className="font-medium">View Deployment</p>
                  </div>
                </a>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Build Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Build Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold">{build.filesCreated || 0}</p>
                <p className="text-sm text-gray-500">Files Created</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold">{build.technologies?.length || 0}</p>
                <p className="text-sm text-gray-500">Technologies</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Badge variant="outline">{build.status}</Badge>
                <p className="text-sm text-gray-500 mt-1">Status</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Technologies */}
        <Card>
          <CardHeader>
            <CardTitle>Tech Stack</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {build.technologies?.map((tech: string, i: number) => (
                <Badge key={i} variant="secondary">
                  {tech}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Logs */}
        {build.logs && (
          <Card>
            <CardHeader>
              <CardTitle>Build Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto max-h-64">
                {build.logs}
              </pre>
            </CardContent>
          </Card>
        )}
        
        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setStatus('idle')}>
            New Build
          </Button>
          <Button asChild>
            <a href={`/projects/${projectId}/agents/marketing`}>
              Create Campaign <ArrowRight className="w-4 h-4 ml-2" />
            </a>
          </Button>
        </div>
      </div>
    );
  }
  
  if (status === 'failed') {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            Build Failed
          </h3>
          <p className="text-red-700 mb-4">
            Something went wrong. Check the logs or try again.
          </p>
          <Button variant="outline" onClick={() => setStatus('idle')}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code2 className="w-5 h-5 text-green-600" />
          Build Agent
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!spec ? (
          <div className="text-center py-8">
            <Code2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              Create a specification first
            </p>
            <Button asChild variant="outline">
              <a href={`/projects/${projectId}/agents/spec`}>
                Go to Spec
              </a>
            </Button>
          </div>
        ) : (
          <>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700">
                🏗️ Ready to build from specification:
              </p>
              <h4 className="font-medium mt-2">{spec.title || 'Product'}</h4>
              <p className="text-sm text-gray-600 mt-1">
                {spec.features?.length || 0} features to implement
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {spec.techStack && (
                  <>
                    <Badge variant="outline">{spec.techStack.frontend}</Badge>
                    <Badge variant="outline">{spec.techStack.backend}</Badge>
                    <Badge variant="outline">{spec.techStack.database}</Badge>
                  </>
                )}
              </div>
            </div>
            
            <Button 
              onClick={handleBuild}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Building...
                </>
              ) : (
                <>
                  <Code2 className="w-4 h-4 mr-2" />
                  Build with OpenHands
                </>
              )}
            </Button>
            
            <p className="text-xs text-gray-500 text-center">
              This will create a GitHub repo and use OpenHands to implement features
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
