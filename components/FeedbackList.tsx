"use client";

import { useState } from "react";
import {
  Search,
  ExternalLink,
  Copy,
  Check,
  AlertTriangle,
  Github,
  Bug,
  Terminal,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Feedback } from "@/lib/api";

interface FeedbackListProps {
  feedbacks: Feedback[];
}

export function FeedbackList({ feedbacks }: FeedbackListProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "sentry" | "pr">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedSpec, setExpandedSpec] = useState<string | null>(null);

  const filtered = feedbacks.filter((f) => {
    const matchesSearch =
      f.text.toLowerCase().includes(search.toLowerCase()) ||
      f.source?.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "all" ||
      (filter === "sentry" && !!f.sentryIssueUrl) ||
      (filter === "pr" && !!f.githubPrUrl);

    return matchesSearch && matchesFilter;
  });

  const handleCopySpec = async (item: Feedback) => {
    if (!item.spec) {
      alert("No spec available for this feedback");
      return;
    }

    const spec = item.spec as any;
    const implementationText = generateImplementationText(item, spec);

    await navigator.clipboard.writeText(implementationText);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending_analysis":
        return <Badge variant="secondary">Analyzing...</Badge>;
      case "analyzed":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Ready for Implementation</Badge>;
      case "ready_for_implementation":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Ready for Implementation</Badge>;
      case "shipped":
        return <Badge className="bg-green-500 hover:bg-green-600">Shipped</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search feedback..."
          className="pl-8"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button
          size="sm"
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
        >
          All
        </Button>
        <Button
          size="sm"
          variant={filter === "sentry" ? "default" : "outline"}
          onClick={() => setFilter("sentry")}
        >
          Linked to Sentry
        </Button>
        <Button
          size="sm"
          variant={filter === "pr" ? "default" : "outline"}
          onClick={() => setFilter("pr")}
        >
          Has PR
        </Button>
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No feedback found.
          </div>
        ) : (
          filtered.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-start flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getStatusBadge(item.status)}
                    {item.type && (
                      <Badge variant="outline" className="uppercase text-[10px]">
                        {item.type === "bug" ? (
                          <Bug className="w-3 h-3 mr-1" />
                        ) : (
                          <span className="w-3 h-3 mr-1">✨</span>
                        )}
                        {item.type}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {item.source} •{" "}
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>

                    {/* Integration badges */}
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
                          className="text-[10px] bg-gray-100 border-gray-300"
                        >
                          <Github className="w-3 h-3 mr-1" />
                          PR
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.status === "ready_for_implementation" && (
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

                    {item.status === "ready_for_implementation" && (
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
                  </div>
                </div>

                <p className="text-sm leading-relaxed">{item.text}</p>

                {/* Expanded spec view */}
                {expandedSpec === item.id && item.spec && (
                  <SpecViewer spec={item.spec as any} />
                )}

                {/* Show extra info for Sentry bugs */}
                {item.sentryIssueUrl && item.errorFrequency && (
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <AlertTriangle className="w-3 h-3" />
                    Affecting{" "}
                    <span className="font-medium">
                      {item.errorFrequency} events
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

interface SpecViewerProps {
  spec: {
    title?: string;
    userStory?: string;
    acceptanceCriteria?: string[];
    technicalNotes?: string;
    assumptions?: string[];
    risks?: string[];
  };
}

function SpecViewer({ spec }: SpecViewerProps) {
  return (
    <div className="bg-muted/50 rounded-lg p-4 space-y-3 text-sm">
      {spec.title && (
        <div>
          <strong className="text-blue-600">Title:</strong> {spec.title}
        </div>
      )}
      {spec.userStory && (
        <div>
          <strong className="text-green-600">User Story:</strong>
          <p className="mt-1 text-gray-700">{spec.userStory}</p>
        </div>
      )}
      {spec.acceptanceCriteria && spec.acceptanceCriteria.length > 0 && (
        <div>
          <strong className="text-purple-600">Acceptance Criteria:</strong>
          <ul className="mt-1 space-y-1">
            {spec.acceptanceCriteria.map((crit, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-gray-400">•</span>
                <span>{crit}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {spec.technicalNotes && (
        <div>
          <strong className="text-orange-600">Technical Notes:</strong>
          <p className="mt-1 text-gray-700">{spec.technicalNotes}</p>
        </div>
      )}
      {spec.assumptions && spec.assumptions.length > 0 && (
        <div>
          <strong className="text-gray-500">Assumptions:</strong>
          <ul className="mt-1 text-gray-600">
            {spec.assumptions.map((a, i) => (
              <li key={i}>• {a}</li>
            ))}
          </ul>
        </div>
      )}
      {spec.risks && spec.risks.length > 0 && (
        <div>
          <strong className="text-red-500">Risks:</strong>
          <ul className="mt-1 text-red-600">
            {spec.risks.map((r, i) => (
              <li key={i}>• {r}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function generateImplementationText(item: Feedback, spec: any): string {
  const lines = [
    `## ${item.type === "bug" ? "Bug Fix" : "Feature Implementation"}`,
    ``,
    `**Feedback:** ${item.text}`,
    ``,
    `---`,
    ``,
    `**User Story**${spec.userStory ? ":" : ""}`,
    spec.userStory || "",
    ``,
    `**Acceptance Criteria:**`,
    ...(spec.acceptanceCriteria || []).map((crit: string) => `- [ ] ${crit}`),
    ``,
  ];

  if (spec.technicalNotes) {
    lines.push(`**Technical Notes:**`);
    lines.push(spec.technicalNotes);
    lines.push(``);
  }

  if (spec.assumptions && spec.assumptions.length > 0) {
    lines.push(`**Assumptions:**`);
    lines.push(...spec.assumptions.map((a: string) => `- ${a}`));
    lines.push(``);
  }

  if (spec.risks && spec.risks.length > 0) {
    lines.push(`**Risks to Consider:**`);
    lines.push(...spec.risks.map((r: string) => `- ${r}`));
    lines.push(``);
  }

  lines.push(`---`);
  lines.push(``);
  lines.push(`**Instructions for Cursor/Claude Code:**`);
  lines.push(`1. Review the user story and acceptance criteria above`);
  lines.push(`2. Implement the feature/fix following the AC`);
  lines.push(`3. Add appropriate tests`);
  lines.push(`4. Create a PR with clear description linking to this feedback`);
  lines.push(``);
  lines.push(`*This spec was generated by PM Analyzer from customer feedback.*`);

  return lines.join("\n");
}
