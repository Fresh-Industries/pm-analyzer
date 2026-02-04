"use client";

import { useState } from "react";
import { Search, ExternalLink, Play, AlertTriangle, Github, Bug, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import type { Feedback } from "@/lib/api";

interface FeedbackListProps {
  feedbacks: Feedback[];
}

export function FeedbackList({ feedbacks }: FeedbackListProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "sentry" | "pr">("all");
  const router = useRouter();
  const [buildingId, setBuildingId] = useState<string | null>(null);

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

  const handleBuild = async (id: string) => {
    setBuildingId(id);
    try {
      const res = await fetch(`/api/feedback/${id}/build`, { method: "POST" });
      if (!res.ok) throw new Error("Failed");
      router.refresh();
    } catch (e) {
      console.error(e);
      alert("Failed to start build");
    } finally {
      setBuildingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending_analysis":
        return <Badge variant="secondary">Analyzing...</Badge>;
      case "analyzed":
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600">Analyzed</Badge>
        );
      case "building":
        return (
          <Badge className="bg-purple-500 hover:bg-purple-600">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" /> Building
          </Badge>
        );
      case "ready_for_review":
        return <Badge className="bg-orange-500 hover:bg-orange-600">Ready for Review</Badge>;
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
                      <Badge
                        variant="outline"
                        className="uppercase text-[10px]"
                      >
                        {item.type === "bug" ? (
                          <Bug className="w-3 h-3 mr-1" />
                        ) : (
                          <Play className="w-3 h-3 mr-1" />
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
                    {item.status === "analyzed" && (
                      <Button
                        size="sm"
                        onClick={() => handleBuild(item.id)}
                        disabled={buildingId === item.id}
                      >
                        {buildingId === item.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-1" /> Build
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

                {item.spec && (
                  <div className="bg-muted/50 p-2 rounded text-xs font-mono mt-2">
                    <strong>Spec:</strong> {(item.spec as any).title}
                  </div>
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
