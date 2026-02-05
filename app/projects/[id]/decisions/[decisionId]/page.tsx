"use client";

import { useState, use } from "react";
import Link from "next/link";
import { notFound, useRouter, useParams } from "next/navigation";
import { ArrowLeft, Copy, Check, ExternalLink, FileText, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DecisionPageProps {
  params: Promise<{ id: string; decisionId: string }>;
}

export default function DecisionDetailPage({ params }: DecisionPageProps) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;
  const decisionId = resolvedParams.decisionId;
  const router = useRouter();
  const [copied, setCopied] = useState<string | null>(null);

  // In real app, fetch from API
  const decision = {
    id: decisionId,
    title: "Implement dark mode for dashboard",
    summary: "Add dark mode toggle to user settings and apply dark theme across dashboard components. Based on customer feedback requesting reduced eye strain during late-night work sessions.",
    scope: "- Dashboard main view\n- Navigation sidebar\n- User settings page\n- All dashboard components",
    nonGoals: "- Mobile-specific dark mode (future iteration)\n- Email templates\n- Public marketing pages",
    risks: "- Third-party iframe content may not support dark mode\n- Some legacy charts may need CSS overrides",
    confidence: "high",
    status: "draft",
    linkedFeedbackIds: ["1", "2", "3"],
    createdAt: new Date().toISOString(),
  };

  const formatForCursor = () => {
    return `## Feature: ${decision.title}

**Summary:** ${decision.summary}

**Scope:**
${decision.scope}

**Non-Goals:**
${decision.nonGoals}

**Risks:**
${decision.risks}

**Confidence:** ${decision.confidence}

Implement this feature following the scope above. Focus on the user experience and ensure accessibility in dark mode.`;
  };

  const formatForLinear = () => {
    return `${decision.title}

${decision.summary}

Scope:
${decision.scope}

Non-Goals:
${decision.nonGoals}`;
  };

  const formatForSlack = () => {
    return `📋 *New Product Decision: ${decision.title}*

*Summary:* ${decision.summary}

*Confidence:* ${decision.confidence.toUpperCase()}

*Scope:*
${decision.scope.split('\n').map(l => `• ${l}`).join('\n')}

Next steps: Check PM Analyzer for full decision details.`;
  };

  const handleCopy = async (type: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  if (!decision) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-10 px-4 max-w-4xl space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Link href={`/projects/${projectId}/decisions`} className="hover:text-gray-900 flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" /> Back to Decisions
              </Link>
            </div>
            <h1 className="text-3xl font-semibold text-gray-900">{decision.title}</h1>
            <div className="flex items-center gap-3">
              <Badge variant="outline">{decision.status}</Badge>
              <Badge variant="secondary">{decision.confidence} confidence</Badge>
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
                {decision.scope}
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
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Send className="w-5 h-5" /> Handoff
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Copy this decision to your preferred tool for implementation:
            </p>

            <div className="grid gap-3">
              <Button
                variant="outline"
                className="justify-start h-auto py-3"
                onClick={() => handleCopy("cursor", formatForCursor())}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="p-2 bg-gray-100 rounded">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Copy for Cursor/Claude Code</p>
                    <p className="text-xs text-gray-500">Implementation brief with full details</p>
                  </div>
                  {copied === "cursor" && <Check className="w-4 h-4 text-green-500 ml-auto" />}
                </div>
              </Button>

              <Button
                variant="outline"
                className="justify-start h-auto py-3"
                onClick={() => handleCopy("linear", formatForLinear())}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="p-2 bg-gray-100 rounded">
                    <ExternalLink className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Copy for Linear</p>
                    <p className="text-xs text-gray-500">Issue description format</p>
                  </div>
                  {copied === "linear" && <Check className="w-4 h-4 text-green-500 ml-auto" />}
                </div>
              </Button>

              <Button
                variant="outline"
                className="justify-start h-auto py-3"
                onClick={() => handleCopy("slack", formatForSlack())}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="p-2 bg-gray-100 rounded">
                    <Send className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Copy for Slack</p>
                    <p className="text-xs text-gray-500">Short summary for stakeholders</p>
                  </div>
                  {copied === "slack" && <Check className="w-4 h-4 text-green-500 ml-auto" />}
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Linked Feedback */}
        {decision.linkedFeedbackIds.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Linked Feedback</CardTitle>
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
