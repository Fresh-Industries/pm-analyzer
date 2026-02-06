"use client";

import { useEffect, useState } from "react";
import { Link as LinkIcon, Trash2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type FeedbackItem = {
  id: string;
  text: string;
  source?: string | null;
  type?: string | null;
  customerTier?: string | null;
  revenue?: number | null;
  status?: string | null;
  analysisModel?: string | null;
  pageUrl?: string | null;
  browserInfo?: string | null;
  errorFrequency?: number | null;
  shippedAt?: string | Date | null;
  githubIssueUrl?: string | null;
  githubPrUrl?: string | null;
  sentryIssueUrl?: string | null;
  spec?: any;
  createdAt?: string | Date | null;
};

function formatDate(value: Date | string | null | undefined) {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleString();
}

function formatMoney(value: number | null | undefined) {
  if (value === null || value === undefined) return "—";
  if (Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function FeedbackListClient({ feedbacks }: { feedbacks: FeedbackItem[] }) {
  const [items, setItems] = useState(feedbacks);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setItems(feedbacks);
  }, [feedbacks]);

  const handleDelete = async (item: FeedbackItem) => {
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
    } catch (error: any) {
      alert(error.message || "Failed to delete feedback");
    } finally {
      setDeletingId((current) => (current === item.id ? null : current));
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No feedback ingested</h3>
        <p className="text-gray-500 mb-6 max-w-sm mx-auto">
          Use the upload page to send data to the analyzer.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">All Feedback ({items.length})</h3>
      <div className="grid gap-4">
        {items.map((f) => (
          <Card key={f.id} className="p-5">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">
                    {formatDate(f.createdAt)}
                  </p>
                  <p className="text-base font-semibold text-gray-900">
                    {f.text}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {f.type && (
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                      {f.type.toUpperCase()}
                    </span>
                  )}
                  {f.status && (
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                      {f.status.replace(/_/g, " ").toUpperCase()}
                    </span>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(f)}
                    disabled={deletingId === f.id}
                  >
                    <Trash2 className="w-4 h-4" />
                    {deletingId === f.id ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </div>

              <div className="grid gap-3 text-sm text-gray-700 md:grid-cols-2">
                <div><span className="font-medium">Source:</span> {f.source || "—"}</div>
                <div><span className="font-medium">Customer Tier:</span> {f.customerTier || "—"}</div>
                <div><span className="font-medium">Revenue:</span> {formatMoney(f.revenue)}</div>
                <div><span className="font-medium">Analysis Model:</span> {f.analysisModel || "—"}</div>
                <div><span className="font-medium">Page URL:</span> {f.pageUrl || "—"}</div>
                <div><span className="font-medium">Browser Info:</span> {f.browserInfo || "—"}</div>
                <div><span className="font-medium">Error Frequency:</span> {f.errorFrequency ?? "—"}</div>
                <div><span className="font-medium">Shipped At:</span> {formatDate(f.shippedAt)}</div>
              </div>

              {(f.githubIssueUrl || f.githubPrUrl || f.sentryIssueUrl) && (
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="font-medium text-gray-700">Links:</span>
                  {f.githubIssueUrl && (
                    <a
                      href={f.githubIssueUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
                    >
                      <LinkIcon className="h-4 w-4" /> GitHub Issue
                    </a>
                  )}
                  {f.githubPrUrl && (
                    <a
                      href={f.githubPrUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
                    >
                      <LinkIcon className="h-4 w-4" /> GitHub PR
                    </a>
                  )}
                  {f.sentryIssueUrl && (
                    <a
                      href={f.sentryIssueUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
                    >
                      <LinkIcon className="h-4 w-4" /> Sentry Issue
                    </a>
                  )}
                </div>
              )}

              {f.spec && (
                <details className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm">
                  <summary className="cursor-pointer font-medium text-gray-700">
                    View Generated Spec
                  </summary>
                  <pre className="mt-2 whitespace-pre-wrap text-xs text-gray-700">
                    {JSON.stringify(f.spec, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
