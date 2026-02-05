"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BrainCircuit, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AnalyzeButton({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/analyze`, {
        method: "POST",
      });

      if (res.ok) {
        router.refresh();
        router.push(`/projects/${projectId}/analysis`);
      }
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleAnalyze}
      disabled={loading}
      className="bg-purple-600 hover:bg-purple-700"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Analyzing...
        </>
      ) : (
        <>
          <BrainCircuit className="w-4 h-4 mr-2" />
          Analyze
        </>
      )}
    </Button>
  );
}
