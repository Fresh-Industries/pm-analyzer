"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Copy, Check, ExternalLink, Send, Terminal, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Decision {
  id: string;
  title: string;
  summary: string;
  scope: string;
  nonGoals: string;
  acceptanceCriteria: string;
  risks: string;
  confidenceScore: number;
  confidence: "high" | "medium" | "low";
  status: string;
  linkedFeedbackIds: string[];
  createdAt: string;
}

interface DecisionPageProps {
  params: Promise<{ id: string; decisionId: string }>;
}

export default function DecisionDetailPage({ params }: DecisionPageProps) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;
  const decisionId = resolvedParams.decisionId;
  const [decision, setDecision] = useState<Decision | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetchDecision();
  }, [projectId, decisionId]);

  const fetchDecision = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/decisions/${decisionId}`);
      if (!res.ok) {
        if (res.status === 404) {
          setError("Decision not found");
          return;
        }
        throw new Error("Failed to fetch decision");
      }
      const data = await res.json();
      setDecision(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const encodeUri = (str: string) => encodeURIComponent(str);

  const cursorUrl = decision ? `https://cursor.sh/?command=ToggleTerminal` : "#";
  const linearUrl = decision ? `https://linear.app/new?title=${encodeUri(decision.title)}&description=${encodeUri(`${decision.summary}\n\nScope:\n${decision.scope}\n\nNon-Goals:\n${decision.nonGoals || "None"}\n\nRisks:\n${decision.risks || "None"}`)}` : "#";
  const slackUrl = decision ? `https://slack.com/app_redirect?channel=general&text=${encodeUri(`📋 *New Product Decision: ${decision.title}*\n\n*Summary:* ${decision.summary}\n*Confidence:* ${decision.confidence.toUpperCase()}\n\nCheck PM Analyzer for full details.`)}` : "#";

  const formatForCursor = () => {
    if (!decision) return "";
    let text = `## Feature: ${decision.title}\n\n**Summary:** ${decision.summary}\n\n**Scope:**\n${decision.scope}`;
    
    if (decision.acceptanceCriteria) {
      text += `\n\n**Acceptance Criteria:**\n${decision.acceptanceCriteria}`;
    }
    
    text += `\n\n**Non-Goals:**\n${decision.nonGoals || "None"}\n\n**Risks:**\n${decision.risks || "None"}\n\n**Confidence:** ${decision.confidence}`;
    
    if (decision.linkedFeedbackIds && decision.linkedFeedbackIds.length > 0) {
      text += `\n\n---\n*Based on ${decision.linkedFeedbackIds.length} customer feedback items*`;
    }
    
    return text;
  };

  const formatForLinear = () => {
    if (!decision) return "";
    let text = `${decision.title}\n\n${decision.summary}\n\n**Scope:**\n${decision.scope}`;
    
    if (decision.acceptanceCriteria) {
      text += `\n\n**Acceptance Criteria:**\n${decision.acceptanceCriteria}`;
    }
    
    text += `\n\n**Non-Goals:**\n${decision.nonGoals || "None"}`;
    
    return text;
  };

  const formatForSlack = () => {
    if (!decision) return "";
    const scopeLines = decision.scope.split('\n').filter(Boolean);
    return `📋 *New Product Decision: ${decision.title}*\n\n*Summary:* ${decision.summary}\n\n*Confidence:* ${decision.confidence.toUpperCase()}\n\n*Scope:*\n${scopeLines.map(l => `• ${l}`).join('\n')}${decision.acceptanceCriteria ? `\n\n*Acceptance Criteria:*\n${decision.acceptanceCriteria}` : ""}\n\nNext steps: Check PM Analyzer for full decision details.`;
  };

  const formatForJson = () => {
    if (!decision) return "";
    return JSON.stringify({
      title: decision.title,
      summary: decision.summary,
      scope: decision.scope,
      acceptanceCriteria: decision.acceptanceCriteria,
      nonGoals: decision.nonGoals,
      risks: decision.risks,
      confidence: decision.confidence,
      linkedFeedbackCount: decision.linkedFeedbackIds?.length || 0,
    }, null, 2);
  };

  const handleCopy = async (type: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-gray-500">Loading decision...</p>
        </div>
      </div>
    );
  }

  if (error || !decision) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <p className="text-red-600 mb-4">{error || "Decision not found"}</p>
            <Button asChild>
              <Link href={`/projects/${projectId}/decisions`}>Back to Decisions</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-10 px-4 max-w-4xl space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Link href={`/projects/${projectId}/decisions`} className="hover:text-gray-900 flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" /> Back
              </Link>
            </div>
            <h1 className="text-3xl font-semibold text-gray-900">{decision.title}</h1>
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant="outline">{decision.status}</Badge>
              <Badge 
                variant="secondary"
                className={
                  decision.confidence === "high" ? "bg-green-100 text-green-700" :
                  decision.confidence === "medium" ? "bg-yellow-100 text-yellow-700" :
                  "bg-red-100 text-red-700"
                }
              >
                {decision.confidence.toUpperCase()} CONFIDENCE
              </Badge>
              <span className="text-sm text-gray-500">
                {new Date(decision.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{decision.summary}</p>
          </CardContent>
        </Card>

        {/* Scope & Boundaries */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Scope</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap text-sm text-gray-700">
                {decision.scope || "Not specified"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Non-Goals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap text-sm text-gray-700">
                {decision.nonGoals || "None specified"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Acceptance Criteria */}
        {decision.acceptanceCriteria && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Acceptance Criteria</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap text-sm text-gray-700">
                {decision.acceptanceCriteria}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Risks */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Risks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap text-sm text-gray-700">
              {decision.risks || "None identified"}
            </div>
          </CardContent>
        </Card>

        {/* Handoff Actions */}
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Terminal className="w-5 h-5" /> Send to Engineering
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Open directly in your tools:
            </p>

            <div className="grid gap-3">
              {/* Send to Cursor */}
              <a href={cursorUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="w-full justify-start h-auto py-3">
                  <div className="flex items-center gap-3 w-full">
                    <div className="p-2 bg-gray-900 rounded">
                      <Terminal className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">🚀 Open in Cursor</p>
                      <p className="text-xs text-gray-500">Implementation brief with full details</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
                  </div>
                </Button>
              </a>

              {/* Add to Linear */}
              <a href={linearUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="w-full justify-start h-auto py-3">
                  <div className="flex items-center gap-3 w-full">
                    <div className="p-2 bg-blue-100 rounded">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">📋 Add to Linear</p>
                      <p className="text-xs text-gray-500">Create issue with description</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
                  </div>
                </Button>
              </a>

              {/* Send to Slack */}
              <a href={slackUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="w-full justify-start h-auto py-3">
                  <div className="flex items-center gap-3 w-full">
                    <div className="p-2 bg-purple-100 rounded">
                      <Send className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">💬 Send to Slack</p>
                      <p className="text-xs text-gray-500">Notify stakeholders</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
                  </div>
                </Button>
              </a>
            </div>

            <div className="border-t pt-4 mt-4">
              <p className="text-sm text-gray-500 mb-3">Or copy to clipboard:</p>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleCopy("cursor", formatForCursor())}
                >
                  {copied === "cursor" ? (
                    <><Check className="w-4 h-4 mr-1" /> Copied!</>
                  ) : (
                    <><Copy className="w-4 h-4 mr-1" /> Copy for Cursor</>
                  )}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleCopy("linear", formatForLinear())}
                >
                  {copied === "linear" ? (
                    <><Check className="w-4 h-4 mr-1" /> Copied!</>
                  ) : (
                    <><Copy className="w-4 h-4 mr-1" /> Copy for Linear</>
                  )}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleCopy("slack", formatForSlack())}
                >
                  {copied === "slack" ? (
                    <><Check className="w-4 h-4 mr-1" /> Copied!</>
                  ) : (
                    <><Copy className="w-4 h-4 mr-1" /> Copy for Slack</>
                  )}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleCopy("json", formatForJson())}
                >
                  {copied === "json" ? (
                    <><Check className="w-4 h-4 mr-1" /> Copied!</>
                  ) : (
                    <><Copy className="w-4 h-4 mr-1" /> Copy JSON</>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Linked Feedback */}
        {decision.linkedFeedbackIds && decision.linkedFeedbackIds.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Linked Evidence</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                {decision.linkedFeedbackIds.length} customer feedback items informed this decision
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
