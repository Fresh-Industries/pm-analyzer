"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, AlertTriangle, Scale, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CreateDecisionPageProps {
  params: Promise<{ id: string }>;
}

export default function CreateDecisionPage({ params }: CreateDecisionPageProps) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    scope: "",
    nonGoals: "",
    acceptanceCriteria: "",
    risks: "",
    confidence: 70,
    linkedFeedbackIds: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/projects/${projectId}/decisions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          summary: formData.summary,
          scope: formData.scope,
          nonGoals: formData.nonGoals,
          acceptanceCriteria: formData.acceptanceCriteria,
          risks: formData.risks,
          confidence: formData.confidence / 100, // Convert to 0-1 scale
          linkedFeedbackIds: formData.linkedFeedbackIds
            .split(",")
            .map((id) => id.trim())
            .filter(Boolean),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create decision");
      }

      const decision = await response.json();
      
      // Redirect to the new decision page
      router.push(`/projects/${projectId}/decisions/${decision.id}`);
    } catch (err: any) {
      setError(err.message || "An error occurred while creating the decision");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getConfidenceLabel = (value: number) => {
    if (value >= 80) return "High Confidence";
    if (value >= 60) return "Medium Confidence";
    if (value >= 40) return "Low Confidence";
    return "Very Low Confidence";
  };

  const getConfidenceColor = (value: number) => {
    if (value >= 80) return "text-green-600";
    if (value >= 60) return "text-blue-600";
    if (value >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl space-y-8">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link 
          href={`/projects/${projectId}/decisions`} 
          className="hover:text-gray-900 flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Decisions
        </Link>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-gray-900">
          Create New Decision
        </h1>
        <p className="text-gray-500">
          Document a product decision with full context for your team.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Start with the high-level summary of what you're deciding.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Decision Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Migrate to Supabase for Auth"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="summary">Summary *</Label>
              <Textarea
                id="summary"
                placeholder="Brief description of the decision and why it matters..."
                value={formData.summary}
                onChange={(e) =>
                  setFormData({ ...formData, summary: e.target.value })
                }
                required
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedFeedbackIds">
                Linked Feedback IDs (optional)
              </Label>
              <Input
                id="linkedFeedbackIds"
                placeholder="Comma-separated IDs from your feedback list"
                value={formData.linkedFeedbackIds}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    linkedFeedbackIds: e.target.value,
                  })
                }
              />
              <p className="text-xs text-gray-500">
                Link this decision to specific feedback items by their IDs
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Scope */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="w-5 h-5" /> Scope
            </CardTitle>
            <CardDescription>
              What exactly will be built or changed? Be specific.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              id="scope"
              placeholder="• Implement user authentication with Supabase&#10;• Add role-based access control&#10;• Create password reset flow..."
              value={formData.scope}
              onChange={(e) =>
                setFormData({ ...formData, scope: e.target.value })
              }
              rows={5}
            />
          </CardContent>
        </Card>

        {/* Non-Goals */}
        <Card>
          <CardHeader>
            <CardTitle>Out of Scope</CardTitle>
            <CardDescription>
              What won't be included in this decision? Clear boundaries prevent scope creep.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              id="nonGoals"
              placeholder="• Social login integration (Google, GitHub)&#10;• Two-factor authentication&#10;• SSO for enterprise customers..."
              value={formData.nonGoals}
              onChange={(e) =>
                setFormData({ ...formData, nonGoals: e.target.value })
              }
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Acceptance Criteria */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" /> Acceptance Criteria
            </CardTitle>
            <CardDescription>
              How will you know this decision was implemented correctly?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              id="acceptanceCriteria"
              placeholder="- Users can sign up with email and password&#10;- Existing users can log in&#10;- Password reset emails are delivered within 30 seconds..."
              value={formData.acceptanceCriteria}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  acceptanceCriteria: e.target.value,
                })
              }
              rows={5}
            />
          </CardContent>
        </Card>

        {/* Risks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" /> Risks & Considerations
            </CardTitle>
            <CardDescription>
              What could go wrong? What tradeoffs are you making?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              id="risks"
              placeholder="• Vendor lock-in with Supabase&#10;• Learning curve for the team&#10;• Potential cost increases at scale..."
              value={formData.risks}
              onChange={(e) =>
                setFormData({ ...formData, risks: e.target.value })
              }
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Confidence */}
        <Card>
          <CardHeader>
            <CardTitle>Confidence Level</CardTitle>
            <CardDescription>
              How confident are you that this is the right decision?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`font-medium ${getConfidenceColor(formData.confidence)}`}>
                  {getConfidenceLabel(formData.confidence)}
                </span>
                <span className="text-lg font-bold">{formData.confidence}%</span>
              </div>
              <Slider
                value={[formData.confidence]}
                onValueChange={([value]) =>
                  setFormData({ ...formData, confidence: value })
                }
                min={0}
                max={100}
                step={5}
                className="py-4"
              />
            </div>
            <div className="flex gap-2 text-xs text-gray-500">
              <span>0-40%: Research more</span>
              <span>•</span>
              <span>40-60%: Prototyping recommended</span>
              <span>•</span>
              <span>60-80%: Good for small scope</span>
              <span>•</span>
              <span>80%+: Ready to execute</span>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Create Decision
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
