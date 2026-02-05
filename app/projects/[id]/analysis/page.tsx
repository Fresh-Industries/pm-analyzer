"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, TrendingUp, AlertTriangle, Zap, Loader2, ChevronDown, ChevronUp, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Example {
  text: string;
}

interface Opportunity {
  id: string;
  title: string;
  category: "bug" | "feature";
  description: string;
  impact: "high" | "medium" | "low";
  impactScore: number;
  feedbackCount: number;
  enterpriseCount: number;
  examples: string[];
  feedbackIds: string[];
}

interface Analysis {
  projectId: string;
  generatedAt: string;
  feedbackCount: number;
  summary: {
    bugs: number;
    features: number;
    other: number;
  };
  opportunities: Opportunity[];
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
  const [expandedOpp, setExpandedOpp] = useState<string | null>(null);

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
          </div>
        </div>

        <Card className="text-center py-16">
          <CardContent>
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No analysis yet
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Upload some feedback first, then click Analyze to get insights grouped by topic.
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild variant="outline">
                <Link href={`/projects/${projectId}/feedback/new`}>
                  Add Feedback
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
            {analysis.feedbackCount} items analyzed, grouped by topic
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

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-red-100 rounded">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{analysis.summary.bugs}</p>
              <p className="text-sm text-gray-500">Bugs reported</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-blue-100 rounded">
              <Zap className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{analysis.summary.features}</p>
              <p className="text-sm text-gray-500">Features requested</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-purple-100 rounded">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{analysis.opportunities.length}</p>
              <p className="text-sm text-gray-500">Topics found</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Opportunities */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" /> What to Work On
        </h2>
        <div className="grid gap-4">
          {analysis.opportunities.map((opp) => (
            <Card key={opp.id} className="overflow-hidden">
              <CardContent className="p-0">
                {/* Header - always visible */}
                <div className="p-6">
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
                          {opp.impact.toUpperCase()} PRIORITY
                        </Badge>
                        <Badge variant="outline">
                          Score: {opp.impactScore}
                        </Badge>
                        {opp.enterpriseCount > 0 && (
                          <Badge variant="secondary">
                            {opp.enterpriseCount} enterprise
                          </Badge>
                        )}
                        <Badge variant="outline">
                          {opp.feedbackCount} mentions
                        </Badge>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {opp.title}
                      </h3>
                      <p className="text-gray-600">{opp.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant={expandedOpp === opp.id ? "secondary" : "default"}
                        size="sm"
                        onClick={() => setExpandedOpp(expandedOpp === opp.id ? null : opp.id)}
                      >
                        {expandedOpp === opp.id ? (
                          <>
                            <ChevronUp className="w-4 h-4 mr-1" /> Hide examples
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4 mr-1" /> Show examples
                          </>
                        )}
                      </Button>
                      <Button asChild>
                        <Link href={`/projects/${projectId}/decisions/new?opportunityId=${opp.id}`}>
                          Create Decision
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Expanded examples */}
                {expandedOpp === opp.id && (
                  <div className="border-t bg-gray-50 p-6">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      What customers are saying:
                    </h4>
                    <div className="space-y-3">
                      {opp.examples.map((example, i) => (
                        <div
                          key={i}
                          className="bg-white p-4 rounded-lg border text-sm text-gray-700 italic"
                        >
                          "{example}"
                        </div>
                      ))}
                    </div>
                    {opp.feedbackCount > 3 && (
                      <p className="text-sm text-gray-500 mt-3">
                        +{opp.feedbackCount - 3} more similar reports
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Generated At */}
      <p className="text-sm text-gray-400 text-center">
        Analysis generated at {new Date(analysis.generatedAt).toLocaleString()}
      </p>
    </div>
  );
}
