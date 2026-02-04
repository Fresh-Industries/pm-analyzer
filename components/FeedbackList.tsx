"use client";

import { useState } from "react";
import { Search, ExternalLink, Play, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
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
  const router = useRouter();
  const [buildingId, setBuildingId] = useState<string | null>(null);

  const filtered = feedbacks.filter(f => 
    f.content.toLowerCase().includes(search.toLowerCase()) || 
    f.source?.toLowerCase().includes(search.toLowerCase())
  );

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
      case 'pending_analysis':
        return <Badge variant="secondary">Analyzing...</Badge>;
      case 'analyzed':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Analyzed</Badge>;
      case 'building':
        return <Badge className="bg-purple-500 hover:bg-purple-600"><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Building</Badge>;
      case 'shipped':
        return <Badge className="bg-green-500 hover:bg-green-600">Shipped</Badge>;
      case 'failed':
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

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No feedback found.
          </div>
        ) : (
          filtered.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(item.status)}
                    {item.type && (
                        <Badge variant="outline" className="uppercase text-[10px]">
                            {item.type}
                        </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {item.source} • {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {item.status === 'analyzed' && (
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

                  {item.status === 'shipped' && item.prUrl && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={item.prUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-1" /> View PR
                      </a>
                    </Button>
                  )}
                </div>
                
                <p className="text-sm leading-relaxed">{item.content}</p>

                {item.spec && (
                    <div className="bg-muted/50 p-2 rounded text-xs font-mono mt-2">
                        <strong>Spec:</strong> {(item.spec as any).title}
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
