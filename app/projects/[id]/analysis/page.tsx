"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, TrendingUp, AlertTriangle, Zap, Target, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Opportunity {
  id: string;
  title: string;
  theme: string;
  description: string;
  impact: "high" | "medium" | "low";
  impactScore: number;
  feedbackCount: number;
  feedbackIds: string[];
}

interface Analysis {
  projectId: string;
  generatedAt: string;
  feedbackCount: number;
  themes: {
    bugs: number;
    features: number;
    other: number;
  };
  opportunities: Opportunity[];
  topKeywords: string[];
}

export default function AnalysisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = use(params) as { id: string };
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    fetchAnalysis();
  }, [projectId]);

  const fetchAnalysis = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/analyze`);
      if (res.ok) {
        const data = await res.json();
        setAnalysis(data);
      }
    } catch (error) {
      console.error("Failed to fetch analysis:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/analyze`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setAnalysis(data);
      }
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
        <p className="text-gray-500">Loading analysis...</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="container mx-auto py-10 px-4 space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Link href={`/projects/${projectId}`} className="hover:text-gray-900 flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" /> Back
              </Link>
              <span>/</span>
              <span>Analysis</span>
            </div>
            <h1 className="text-3xl font-semibold text-gray-900">Analysis</h1>
            <p className="text-gray-500">AI-powered insights from your feedback</p>
          </div>
        </div>

        <Card className="text-center py-16">
          <CardContent>
            <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No analysis yet
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Upload some feedback first, then click Analyze to get AI-powered insights.
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild variant="outline">
                <Link href={`/projects/${projectId}/feedback/new`}>
                  <Plus className="w-4 h-4 mr-2" /> Add Feedback
                </Link>
              </Button>
              <Button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" /> Analyze
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Link href={`/projects/${projectId}`} className="hover:text-gray-900 flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
            <span>/</span>
            <span>Analysis</span>
          </div>
          <h1 className="text-3xl font-semibold text-gray-900">Analysis</h1>
          <p className="text-gray-500">
            AI-powered insights from {analysis.feedbackCount} feedback items
          </p>
        </div>
        <Button
          onClick={handleAnalyze}
          disabled={analyzing}
          variant="outline"
        >
          {analyzing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Re-analyzing...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" /> Re-analyze
            </>
          )}
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-red-100 rounded">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{analysis.themes.bugs}</p>
              <p className="text-sm text-gray-500">Bugs</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-blue-100 rounded">
              <Zap className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{analysis.themes.features}</p>
              <p className="text-sm text-gray-500">Features</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-green-100 rounded">
              <Target className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{analysis.opportunities.length}</p>
              <p className="text-sm text-gray-500">Opportunities</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Opportunities */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" /> Top Opportunities
        </h2>
        <div className="grid gap-4">
          {analysis.opportunities.map((opp) => (
            <Card key={opp.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        className={
                          opp.impact === "high"
                            ? "bg-red-100 text-red-700"
                            : opp.impact === "medium"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                        }
                      >
                        {opp.impact.toUpperCase()} IMPACT
                      </Badge>
                      <Badge variant="outline">
                        Score: {opp.impactScore}
                      </Badge>
                      <Badge variant="secondary">
                        {opp.feedbackCount} items
                      </Badge>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {opp.title}
                    </h3>
                    <p className="text-gray-600">{opp.description}</p>
                  </div>
                  <Button asChild>
                    <Link href={`/projects/${projectId}/decisions/new`}>
                      Create Decision
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Top Keywords */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Common Topics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {analysis.topKeywords.map((keyword) => (
              <Badge key={keyword} variant="outline" className="text-sm">
                {keyword}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Generated At */}
      <p className="text-sm text-gray-400 text-center">
        Analysis generated at {new Date(analysis.generatedAt).toLocaleString()}
      </p>
    </div>
  );
}
