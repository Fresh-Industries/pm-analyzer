
"use client";

import { useState } from "react";
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { uploadFeedback } from "@/lib/api";
import { cn } from "@/lib/utils";
import { JobStatus } from "@/components/JobStatus";

interface FeedbackUploaderProps {
  projectId: string;
  onUploadSuccess?: (jobId: string) => void;
}

export function FeedbackUploader({ projectId, onUploadSuccess }: FeedbackUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (file.type === "text/csv" || file.type === "application/json" || file.name.endsWith('.csv') || file.name.endsWith('.json')) {
      setFile(file);
      setError(null);
      setActiveJobId(null); // Reset job on new file
    } else {
      setError("Please upload a CSV or JSON file.");
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const { jobId } = await uploadFeedback(projectId, file);
      setActiveJobId(jobId);
      if (onUploadSuccess) onUploadSuccess(jobId);
    } catch (err) {
      setError("Failed to upload file. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          {!activeJobId ? (
            <>
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
                  dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
                  "hover:border-primary/50"
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept=".csv,.json"
                  onChange={handleChange}
                />
                
                <div className="flex flex-col items-center gap-2">
                  <div className="p-3 bg-muted rounded-full">
                    <Upload className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div className="text-sm font-medium">
                    Click to upload or drag and drop
                  </div>
                  <div className="text-xs text-muted-foreground">
                    CSV or JSON (max 10MB)
                  </div>
                </div>
              </div>

              {error && (
                <div className="mt-4 flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              {file && !error && (
                <div className="mt-4 border rounded-md p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-primary" />
                    <div className="text-sm">
                      <p className="font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <Button size="sm" onClick={handleUpload} disabled={uploading}>
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      "Upload"
                    )}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                 <h3 className="font-medium">Processing File</h3>
                 <Button variant="ghost" size="sm" onClick={() => { setFile(null); setActiveJobId(null); }}>Upload Another</Button>
              </div>
              <JobStatus jobId={activeJobId} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
