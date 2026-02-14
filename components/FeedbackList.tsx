"use client";

import { useEffect, useState } from "react";
import {
  Search,
  ExternalLink,
  Copy,
  Check,
  AlertTriangle,
  Github,
  Bug,
  Terminal,
  Trash2,
  Quote,
  Sparkles,
  DollarSign,
  CheckSquare,
  Square,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Feedback } from "@/lib/api";
import { QuickDecisionDialog } from "./QuickDecisionDialog";

interface FeedbackListProps {
  feedbacks: Feedback[];
}

export function FeedbackList({ feedbacks }: FeedbackListProps) {
  const [items, setItems] = useState(feedbacks);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "sentry" | "pr">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedQuoteId, setCopiedQuoteId] = useState<string | null>(null);
  const [expandedSpec, setExpandedSpec] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showQuickDecision, setShowQuickDecision] = useState(false);

  useEffect(() => {
    setItems(feedbacks);
  }, [feedbacks]);

  const filtered = items.filter((f) => {
    const matchesSearch =
      f.text.toLowerCase().includes(search.toLowerCase()) ||
      f.source?.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "all" ||
      (filter === "sentry" && !!f.sentryIssueUrl) ||
      (filter === "pr" && !!f.githubPrUrl);

    return matchesSearch && matchesFilter;
  });

  const selectedItems = items.filter((f) => selectedIds.has(f.id));
  const totalSelectedRevenue = selectedItems.reduce(
    (sum, f) => sum + (f.revenue || 0),
    0
  );

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((f) => f.id)));
    }
  };

  const handleDelete = async (item: Feedback) => {
    const confirmed = window.confirm(
      "Delete this feedback? This action cannot be undone."
    );
    if (!confirmed) return;

    setDeletingId(item.id);
    try {
      const response = await fetch(`/api/feedback/${item.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        let message = "Failed to delete feedback";
        try {
          const data = await response.json();
          message = data?.error || data?.message || message;
        } catch {
          // ignore parse errors
        }
        throw new Error(message);
      }
      setItems((prev) => prev.filter((f) => f.id !== item.id));
      setSelectedIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(item.id);
        return newSet;
      });
      if (expandedSpec === item.id) setExpandedSpec(null);
      if (copiedId === item.id) setCopiedId(null);
      if (copiedQuoteId === item.id) setCopiedQuoteId(null);
    } catch (error: any) {
      alert(error.message || "Failed to delete feedback");
    } finally {
      setDeletingId((current) => (current === item.id ? null : current));
    }
  };

  const handleCopySpec = async (item: Feedback) => {
    try {
      const response = await fetch(`/api/feedback/${item.id}/implementation`);
      if (!response.ok) {
        const { message } = await response.json();
        throw new Error(message || "Failed to generate implementation text");
      }
      const data = await response.json();
      await navigator.clipboard.writeText(data.text);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error: any) {
      alert(error.message || "Unable to copy implementation text");
    }
  };

  const handleCopyAsQuote = async (item: Feedback) => {
    try {
      const customerTier = item.customerTier || "Unknown tier";
      const source = item.source || "Unknown source";
      const quote = `> "${item.text}"\n>\n> — ${customerTier} customer via ${source}`;
      await navigator.clipboard.writeText(quote);
      setCopiedQuoteId(item.id);
      setTimeout(() => setCopiedQuoteId(null), 2000);
    } catch (error: any) {
      alert(error.message || "Unable to copy quote");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending_analysis":
        return <Badge variant="secondary">Analyzing...</Badge>;
      case "analyzed":
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600">
            Ready for Implementation
          </Badge>
        );
      case "ready_for_implementation":
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600">
            Ready for Implementation
          </Badge>
        );
      case "shipped":
        return <Badge className="bg-green-500 hover:bg-green-600">Shipped</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRevenueBadge = (revenue: number | null | undefined) => {
    if (!revenue || revenue === 0) return null;
    return (
      <Badge
        variant="outline"
        className="text-[10px] bg-green-50 border-green-200 text-green-700"
      >
        <DollarSign className="w-3 h-3 mr-0.5" />
        ${revenue.toLocaleString()}/mo
      </Badge>
    );
  };

  const getCustomerTierBadge = (tier: string | null | undefined) => {
    if (!tier) return null;
    const colors: Record<string, string> = {
      enterprise: "bg-purple-100 border-purple-200 text-purple-700",
      pro: "bg-blue-100 border-blue-200 text-blue-700",
      starter: "bg-green-100 border-green-200 text-green-700",
    };
    const colorClass = colors[tier.toLowerCase()] || "bg-gray-100 border-gray-200";
    return (
      <Badge variant="outline" className={`text-[10px] ${colorClass}`}>
        {tier}
      </Badge>
    );
  };

  return (
    <div className="space-y-5">
      {/* Selection Header */}
      {selectedIds.size > 0 && (
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <span className="font-semibold">{selectedIds.size}</span> item
                {selectedIds.size !== 1 && "s"} selected
              </div>
              <div className="text-sm text-green-700">
                Potential impact:{" "}
                <span className="font-semibold">
                  ${totalSelectedRevenue.toLocaleString()}/mo
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedIds(new Set())}
              >
                Clear
              </Button>
              <Button
                size="sm"
                onClick={() => setShowQuickDecision(true)}
              >
                <Sparkles className="w-4 h-4 mr-1" />
                Create Decision
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
        <Input
          placeholder="Search feedback by keyword or source..."
          className="pl-10 h-12 rounded-2xl bg-white dark:bg-zinc-900"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex gap-2 flex-wrap">
        {[
          { key: "all", label: "All" },
          { key: "sentry", label: "Linked to Sentry" },
          { key: "pr", label: "Has PR" },
        ].map(({ key, label }) => (
          <Button
            key={key}
            size="sm"
            variant={filter === key ? "default" : "outline"}
            className="rounded-full"
            onClick={() => setFilter(key as any)}
          >
            {label}
          </Button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 dark:text-zinc-400 border-2 border-dashed rounded-2xl">
            No feedback found.
          </div>
        ) : (
          <>
            {/* Select All Row */}
            <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg">
              <Button
                variant="ghost"
                size="sm"
                className="p-0 h-auto"
                onClick={toggleAll}
              >
                {selectedIds.size === filtered.length ? (
                  <CheckSquare className="w-5 h-5 text-purple-600" />
                ) : (
                  <Square className="w-5 h-5 text-gray-400" />
                )}
              </Button>
              <span className="text-sm text-gray-600">
                Select all ({filtered.length} items)
              </span>
            </div>

            {filtered.map((item) => (
              <Card
                key={item.id}
                className={`overflow-hidden transition-all ${
                  selectedIds.has(item.id)
                    ? "ring-2 ring-purple-500 bg-purple-50/50"
                    : ""
                }`}
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-start flex-wrap gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Selection Checkbox */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-0 h-auto"
                        onClick={() => toggleSelection(item.id)}
                      >
                        {selectedIds.has(item.id) ? (
                          <CheckSquare className="w-5 h-5 text-purple-600" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-400" />
                        )}
                      </Button>

                      {getStatusBadge(item.status)}
                      {item.type && (
                        <Badge
                          variant="outline"
                          className="uppercase text-[10px]"
                        >
                          {item.type === "bug" ? (
                            <Bug className="w-3 h-3 mr-1" />
                          ) : (
                            <span className="w-3 h-3 mr-1">✨</span>
                          )}
                          {item.type}
                        </Badge>
                      )}
                      {getRevenueBadge(item.revenue)}
                      {getCustomerTierBadge(item.customerTier)}
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        {item.source} •{" "}
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>

                      <div className="flex items-center gap-1">
                        {item.sentryIssueUrl && (
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-red-50 border-red-200 text-red-700"
                          >
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Sentry
                          </Badge>
                        )}
                        {item.githubPrUrl && (
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-zinc-100 border-zinc-300"
                          >
                            <Github className="w-3 h-3 mr-1" />
                            PR
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {(item.status === "ready_for_implementation" ||
                        item.status === "analyzed") && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setExpandedSpec(
                              expandedSpec === item.id ? null : item.id
                            )
                          }
                        >
                          <Terminal className="w-4 h-4 mr-1" />
                          {expandedSpec === item.id ? "Hide" : "View"} Spec
                        </Button>
                      )}

                      {(item.status === "ready_for_implementation" ||
                        item.status === "analyzed") && (
                        <Button
                          size="sm"
                          onClick={() => handleCopySpec(item)}
                          disabled={copiedId === item.id}
                        >
                          {copiedId === item.id ? (
                            <>
                              <Check className="w-4 h-4 mr-1" /> Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 mr-1" /> Copy for Cursor
                            </>
                          )}
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopyAsQuote(item)}
                        disabled={copiedQuoteId === item.id}
                        title="Copy as formatted customer quote"
                      >
                        {copiedQuoteId === item.id ? (
                          <>
                            <Check className="w-4 h-4 mr-1" /> Copied!
                          </>
                        ) : (
                          <>
                            <Quote className="w-4 h-4 mr-1" /> Copy Quote
                          </>
                        )}
                      </Button>

                      {item.status === "shipped" && item.githubPrUrl && (
                        <Button size="sm" variant="outline" asChild>
                          <a
                            href={item.githubPrUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="w-4 h-4 mr-1" /> View PR
                          </a>
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(item)}
                        disabled={deletingId === item.id}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        {deletingId === item.id ? "Deleting..." : "Delete"}
                      </Button>
                    </div>
                  </div>

                  <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 pl-9">
                    {item.text}
                  </p>

                  {expandedSpec === item.id && item.spec && (
                    <div className="pl-9">
                      <SpecViewer spec={item.spec as any} />
                    </div>
                  )}

                  {item.sentryIssueUrl && item.errorFrequency && (
                    <div className="pl-9 text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                      <AlertTriangle className="w-3 h-3" />
                      Affecting{" "}
                      <span className="font-medium">
                        {item.errorFrequency} events
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </div>

      {/* Quick Decision Dialog */}
      {showQuickDecision && (
        <QuickDecisionDialog
          projectId={items[0]?.projectId || ""}
          selectedFeedback={selectedItems}
          onClose={() => {
            setShowQuickDecision(false);
            setSelectedIds(new Set());
          }}
        />
      )}
    </div>
  );
}

interface SpecViewerProps {
  spec: {
    title?: string;
    summary?: string;
    userStory?: string;
    acceptanceCriteria?: string[];
    technicalNotes?: string;
    reproductionSteps?: string[];
    expectedBehavior?: string;
    actualBehavior?: string;
    assumptions?: string[];
    risks?: string[];
    details?: {
      reproductionSteps?: string[];
      expectedBehavior?: string;
      actualBehavior?: string;
      userStory?: string;
      acceptanceCriteria?: string[];
      technicalNotes?: string;
    };
  };
}

function SpecViewer({ spec }: SpecViewerProps) {
  const normalized = normalizeSpec(spec);
  return (
    <div className="bg-zinc-50 dark:bg-zinc-900/60 rounded-2xl p-5 space-y-4 text-sm border border-zinc-200/50 dark:border-zinc-800/50">
      {normalized.title && (
        <div>
          <strong className="text-blue-600">Title:</strong> {normalized.title}
        </div>
      )}
      {normalized.summary && (
        <div>
          <strong className="text-blue-600">Summary:</strong> {normalized.summary}
        </div>
      )}
      {normalized.userStory && (
        <div>
          <strong className="text-green-600">User Story:</strong>
          <p className="mt-1 text-zinc-700 dark:text-zinc-300">
            {normalized.userStory}
          </p>
        </div>
      )}
      {normalized.acceptanceCriteria &&
        normalized.acceptanceCriteria.length > 0 && (
          <div>
            <strong className="text-purple-600">Acceptance Criteria:</strong>
            <ul className="mt-1 space-y-1">
              {normalized.acceptanceCriteria.map((crit: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-zinc-400">•</span>
                  <span>{crit}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      {normalized.technicalNotes && (
        <div>
          <strong className="text-orange-600">Technical Notes:</strong>
          <p className="mt-1 text-zinc-700 dark:text-zinc-300">
            {normalized.technicalNotes}
          </p>
        </div>
      )}
      {normalized.reproductionSteps &&
        normalized.reproductionSteps.length > 0 && (
          <div>
            <strong className="text-red-600">Reproduction Steps:</strong>
            <ul className="mt-1 space-y-1">
              {normalized.reproductionSteps.map((step: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-zinc-400">•</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      {normalized.expectedBehavior && (
        <div>
          <strong className="text-green-700">Expected Behavior:</strong>
          <p className="mt-1 text-zinc-700 dark:text-zinc-300">
            {normalized.expectedBehavior}
          </p>
        </div>
      )}
      {normalized.actualBehavior && (
        <div>
          <strong className="text-red-600">Actual Behavior:</strong>
          <p className="mt-1 text-zinc-700 dark:text-zinc-300">
            {normalized.actualBehavior}
          </p>
        </div>
      )}
      {normalized.assumptions && normalized.assumptions.length > 0 && (
        <div>
          <strong className="text-zinc-500">Assumptions:</strong>
          <ul className="mt-1 text-zinc-600 dark:text-zinc-400">
            {normalized.assumptions.map((a: string, i: number) => (
              <li key={i}>• {a}</li>
            ))}
          </ul>
        </div>
      )}
      {normalized.risks && normalized.risks.length > 0 && (
        <div>
          <strong className="text-red-500">Risks:</strong>
          <ul className="mt-1 text-red-600 dark:text-red-400">
            {normalized.risks.map((r: string, i: number) => (
              <li key={i}>• {r}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function normalizeSpec(spec: any) {
  const details = spec?.details ?? {};
  return {
    title: spec?.title,
    summary: spec?.summary,
    userStory: spec?.userStory ?? details.userStory,
    acceptanceCriteria: spec?.acceptanceCriteria ?? details.acceptanceCriteria,
    technicalNotes: spec?.technicalNotes ?? details.technicalNotes,
    reproductionSteps: spec?.reproductionSteps ?? details.reproductionSteps,
    expectedBehavior: spec?.expectedBehavior ?? details.expectedBehavior,
    actualBehavior: spec?.actualBehavior ?? details.actualBehavior,
    assumptions: spec?.assumptions,
    risks: spec?.risks,
  };
}
