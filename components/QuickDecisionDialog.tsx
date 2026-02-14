"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Loader2,
  AlertTriangle,
  Scale,
  CheckCircle,
  X,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Feedback } from "@/lib/api";

interface QuickDecisionDialogProps {
  projectId: string;
  selectedFeedback: Feedback[];
  onClose: () => void;
}

export function QuickDecisionDialog({
  projectId,
  selectedFeedback,
  onClose,
}: QuickDecisionDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-generate title from feedback
  const generateTitle = () => {
    const types = selectedFeedback.map((f) => f.type).filter(Boolean);
    const type = types[0] || "feature";
    const count = selectedFeedback.length;
    return `${type === "bug" ? "Fix" : "Implement"} ${count} item${count > 1 ? "s" : ""} from customer feedback`;
  };

  // Auto-generate summary
  const generateSummary = () => {
    const uniqueSources = [...new Set(selectedFeedback.map((f) => f.source).filter(Boolean))];
    const totalRevenue = selectedFeedback.reduce((sum, f) => sum + (f.revenue || 0), 0);
    const tiers = [...new Set(selectedFeedback.map((f) => f.customerTier).filter(Boolean))];

    return `Address ${selectedFeedback.length} feedback item${selectedFeedback.length > 1 ? "s" : ""} from ${uniqueSources.join(", ")} (potential impact: $${totalRevenue.toLocaleString()}/mo from ${tiers.join(", ")} customers)`;
  };

  // Auto-generate scope from feedback text
  const generateScope = () => {
    return selectedFeedback
      .map((f, i) => `${i + 1}. ${f.text}`)
      .join("\n");
  };

  const [formData, setFormData] = useState({
    title: generateTitle(),
    summary: generateSummary(),
    scope: generateScope(),
    nonGoals: "",
    acceptanceCriteria: "",
    risks: "",
    confidence: 70,
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
          confidence: formData.confidence / 100,
          linkedFeedbackIds: selectedFeedback.map((f) => f.id),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create decision");
      }

      const decision = await response.json();
      onClose();
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

  // Calculate total potential revenue
  const totalRevenue = selectedFeedback.reduce((sum, f) => sum + (f.revenue || 0), 0);
  const bugCount = selectedFeedback.filter((f) => f.type === "bug").length;
  const featureCount = selectedFeedback.filter((f) => f.type === "feature").length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Quick Decision Builder</h2>
              <p className="text-sm text-gray-500">
                Creating decision from {selectedFeedback.length} feedback item
                {selectedFeedback.length > 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Impact Summary */}
        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="flex gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Total Impact:</span>
              <span className="font-semibold text-green-600">
                ${totalRevenue.toLocaleString()}/mo
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Bugs:</span>
              <span className="font-semibold text-red-600">{bugCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Features:</span>
              <span className="font-semibold text-blue-600">
                {featureCount}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

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
            </CardContent>
          </Card>

          {/* Scope */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5" /> Scope
              </CardTitle>
              <CardDescription>
                What exactly will be built or changed? (Pre-filled from feedback)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                id="scope"
                placeholder="• ..."
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
                What won't be included in this decision?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                id="nonGoals"
                placeholder="• ..."
                value={formData.nonGoals}
                onChange={(e) =>
                  setFormData({ ...formData, nonGoals: e.target.value })
                }
                rows={3}
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
                How will you know this was implemented correctly?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                id="acceptanceCriteria"
                placeholder="- ..."
                value={formData.acceptanceCriteria}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    acceptanceCriteria: e.target.value,
                  })
                }
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Risks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" /> Risks
              </CardTitle>
              <CardDescription>What could go wrong?</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                id="risks"
                placeholder="• ..."
                value={formData.risks}
                onChange={(e) =>
                  setFormData({ ...formData, risks: e.target.value })
                }
                rows={3}
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
                  <span
                    className={`font-medium ${getConfidenceColor(
                      formData.confidence
                    )}`}
                  >
                    {getConfidenceLabel(formData.confidence)}
                  </span>
                  <span className="text-lg font-bold">
                    {formData.confidence}%
                  </span>
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
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
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
    </div>
  );
}

// Import useRouter at top
import { useRouter } from "next/navigation";
