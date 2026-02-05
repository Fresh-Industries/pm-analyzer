"use client";

import { useState, use, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface FeedbackItem {
  id: string;
  text: string;
  type: string | null;
  status: string;
  createdAt: string;
}

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

interface NewDecisionPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string; opportunityId?: string }>;
}

export default function NewDecisionPage({ params, searchParams }: NewDecisionPageProps) {
  const { id: projectId } = use(params);
  const resolvedSearchParams = use(searchParams);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    scope: "",
    nonGoals: "",
    risks: "",
    confidence: "medium",
  });

  // Fetch opportunity data if coming from analysis
  useEffect(() => {
    if (resolvedSearchParams.opportunityId) {
      fetchOpportunity();
    }
  }, [resolvedSearchParams.opportunityId]);

  const fetchOpportunity = async () => {
    setAnalyzing(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/analyze`);
      if (res.ok) {
        const analysis = await res.json();
        const opp = analysis.opportunities?.find((o: Opportunity) => o.id === resolvedSearchParams.opportunityId);
        if (opp) {
          setOpportunity(opp);
          // Auto-fill form
          setFormData({
            title: opp.title,
            summary: opp.description,
            scope: `Build/improve: ${opp.title}\n\nBased on ${opp.feedbackCount} customer feedback items.`,
            nonGoals: `- Mobile-specific changes (future iteration)\n- Related features not mentioned in feedback\n- Performance optimizations beyond scope`,
            risks: `- Customer requirements may evolve\n- Dependencies on other teams\n- Technical complexity unknown`,
            confidence: opp.impact === "high" ? "high" : opp.impact === "low" ? "low" : "medium",
          });
        }
      }
    } catch (err) {
      console.error("Failed to fetch opportunity:", err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/projects/${projectId}/decisions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          linkedFeedbackIds: opportunity?.feedbackIds || [],
        }),
      });

      if (!res.ok) throw new Error("Failed to create decision");

      router.push(`/projects/${projectId}/decisions`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-10 px-4 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/projects/${projectId}/decisions`}
            className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1 mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Decisions
          </Link>
          <h1 className="text-3xl font-semibold text-gray-900">Create Decision</h1>
          <p className="text-gray-500 mt-1">
            {opportunity
              ? "Review and edit the auto-generated decision"
              : "Document a product decision and prepare for handoff"}
          </p>
        </div>

        {/* Auto-filled indicator */}
        {opportunity && (
          <Card className="mb-6 bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-blue-700">
                <Loader2 className={`w-4 h-4 ${analyzing ? "animate-spin" : ""}`} />
                <span className="font-medium">
                  {analyzing ? "Auto-generating from analysis..." : "Auto-filled from analysis"}
                </span>
              </div>
              <p className="text-sm text-blue-600 mt-1">
                Based on: {opportunity.title} ({opportunity.feedbackCount} items, {opportunity.impact} impact)
              </p>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Decision Details</CardTitle>
              <CardDescription>
                What decision are you making and why?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g., Implement dark mode for dashboard"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="summary">Summary *</Label>
                <textarea
                  id="summary"
                  name="summary"
                  rows={3}
                  placeholder="What decision are you making and why?"
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  value={formData.summary}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="confidence">Confidence</Label>
                  <select
                    id="confidence"
                    name="confidence"
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    value={formData.confidence}
                    onChange={handleChange}
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Scope & Boundaries</CardTitle>
              <CardDescription>
                What's included and what's NOT included
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="scope">Scope (what's included)</Label>
                <textarea
                  id="scope"
                  name="scope"
                  rows={4}
                  placeholder="What will be built?"
                  className="w-full px-3 py-2 border rounded-lg text-sm font-mono"
                  value={formData.scope}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nonGoals">Non-goals (what's NOT included)</Label>
                <textarea
                  id="nonGoals"
                  name="nonGoals"
                  rows={3}
                  placeholder="What won't be built? What are you explicitly NOT doing?"
                  className="w-full px-3 py-2 border rounded-lg text-sm font-mono"
                  value={formData.nonGoals}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Risks & Mitigation</CardTitle>
              <CardDescription>
                What could go wrong and how to handle it
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="risks">Risks</Label>
                <textarea
                  id="risks"
                  name="risks"
                  rows={3}
                  placeholder="What risks exist? How will you mitigate them?"
                  className="w-full px-3 py-2 border rounded-lg text-sm font-mono"
                  value={formData.risks}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
          </Card>

          {/* Evidence Source */}
          {opportunity && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Based on Evidence</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  This decision is based on {opportunity.feedbackCount} customer feedback items
                  about "{opportunity.title}" with {opportunity.impact} impact score.
                </p>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? (
                <>Creating...</>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" /> Create & Send
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
