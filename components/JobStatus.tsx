
"use client";

import { useEffect, useState } from "react";
import { CheckCircle, AlertCircle, Loader2, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { getJobStatus, type Job } from "@/lib/api";
import { cn } from "@/lib/utils";

interface JobStatusProps {
  jobId: string;
  onComplete?: () => void;
}

export function JobStatus({ jobId, onComplete }: JobStatusProps) {
  const [job, setJob] = useState<Job | null>(null);
  
  useEffect(() => {
    let interval: NodeJS.Timeout;

    const fetchStatus = async () => {
      try {
        const data = await getJobStatus(jobId);
        setJob(data);

        if (data.status === 'completed' || data.status === 'failed') {
          clearInterval(interval);
          if (data.status === 'completed' && onComplete) {
            onComplete();
          }
        }
      } catch (error) {
        console.error("Failed to poll job status", error);
      }
    };

    fetchStatus();
    interval = setInterval(fetchStatus, 2000); // Poll every 2s

    return () => clearInterval(interval);
  }, [jobId, onComplete]);

  if (!job) return null;

  return (
    <div className="w-full space-y-2 border rounded-lg p-4 bg-muted/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {job.status === 'processing' && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
          {job.status === 'completed' && <CheckCircle className="w-4 h-4 text-green-500" />}
          {job.status === 'failed' && <AlertCircle className="w-4 h-4 text-red-500" />}
          {job.status === 'pending' && <Clock className="w-4 h-4 text-yellow-500" />}
          <span className="text-sm font-medium capitalize">{job.status}</span>
        </div>
        <span className="text-xs text-muted-foreground">{Math.round(job.progress)}%</span>
      </div>
      <Progress value={job.progress} className={cn("h-1.5", 
        job.status === 'failed' ? "bg-red-100 [&>div]:bg-red-500" : 
        job.status === 'completed' ? "bg-green-100 [&>div]:bg-green-500" : ""
      )} />
      {job.error && (
        <p className="text-xs text-red-500 mt-1">{job.error}</p>
      )}
    </div>
  );
}
