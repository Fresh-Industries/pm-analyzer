"use client";

import { useState } from "react";
import {
  Copy,
  Download,
  FileCode,
  MessageSquare,
  Check,
  ChevronDown,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CopyButton } from "@/components/CopyButton";
import { cn } from "@/lib/utils";

// Export format definitions
export type ExportFormat =
  | "cursor"
  | "linear"
  | "jira"
  | "slack"
  | "notion"
  | "markdown"
  | "json";

export interface DecisionExportData {
  id: string;
  title: string;
  summary: string;
  scope: string;
  nonGoals: string;
  acceptanceCriteria: string;
  risks: string;
  confidenceScore: number;
  linkedFeedbackIds: string[];
  projectName?: string;
}

export interface ExportFormatConfig {
  id: ExportFormat;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

export const EXPORT_FORMATS: ExportFormatConfig[] = [
  {
    id: "cursor",
    label: "Cursor / Claude Code",
    description: "AI pair programming handoff",
    icon: <FileCode className="w-4 h-4" />,
    color: "text-blue-600 bg-blue-50",
  },
  {
    id: "linear",
    label: "Linear",
    description: "Issue tracker format",
    icon: <FileCode className="w-4 h-4" />,
    color: "text-purple-600 bg-purple-50",
  },
  {
    id: "jira",
    label: "Jira",
    description: "Jira issue format",
    icon: <FileCode className="w-4 h-4" />,
    color: "text-blue-700 bg-blue-100",
  },
  {
    id: "slack",
    label: "Slack",
    description: "Stakeholder summary",
    icon: <MessageSquare className="w-4 h-4" />,
    color: "text-green-600 bg-green-50",
  },
  {
    id: "notion",
    label: "Notion",
    description: "Notion database format",
    icon: <FileCode className="w-4 h-4" />,
    color: "text-gray-600 bg-gray-100",
  },
  {
    id: "markdown",
    label: "Markdown",
    description: "Documentation format",
    icon: <FileCode className="w-4 h-4" />,
    color: "text-gray-700 bg-gray-50",
  },
  {
    id: "json",
    label: "JSON",
    description: "Programmatic access",
    icon: <FileCode className="w-4 h-4" />,
    color: "text-yellow-600 bg-yellow-50",
  },
];

// Formatters for each export format
function formatAsCursor(data: DecisionExportData): string {
  return `## Feature: ${data.title}

**Summary:** ${data.summary}

**Confidence Score:** ${Math.round(data.confidenceScore * 100)}%

---

### Scope
${data.scope}

### Acceptance Criteria
${data.acceptanceCriteria
  .split("\n")
  .filter((line) => line.trim())
  .map((ac) => `- [ ] ${ac.trim()}`)
  .join("\n")}

### Risks to Consider
${data.risks}

### Non-Goals (Out of Scope)
${data.nonGoals}

### Linked Feedback
${data.linkedFeedbackIds.length > 0 ? `This decision addresses ${data.linkedFeedbackIds.length} customer feedback items.` : "No direct feedback links."}
`;
}

function formatAsLinear(data: DecisionExportData): string {
  const priority =
    data.confidenceScore >= 0.8
      ? "1"
      : data.confidenceScore >= 0.6
        ? "2"
        : "3";
  return `**${data.title}**

${data.summary}

*Priority:* ${priority}
*Confidence:* ${Math.round(data.confidenceScore * 100)}%

*Scope:*
${data.scope}

*Acceptance Criteria:*
${data.acceptanceCriteria
  .split("\n")
  .filter((line) => line.trim())
  .map((ac) => `- [ ] ${ac.trim()}`)
  .join("\n")}

*Risks:*
${data.risks}`;
}

function formatAsJira(data: DecisionExportData): string {
  return `h2. ${data.title}

${data.summary}

*Confidence:* ${Math.round(data.confidenceScore * 100)}%

h3. Scope
${data.scope}

h3. Acceptance Criteria
${data.acceptanceCriteria}

h3. Risks
${data.risks}

h3. Out of Scope
${data.nonGoals}`;
}

function formatAsSlack(data: DecisionExportData): string {
  const emoji =
    data.confidenceScore >= 0.8
      ? "✅"
      : data.confidenceScore >= 0.6
        ? "⚠️"
        : "🤔";
  return `${emoji} *New Feature Decision: ${data.title}*

_${data.summary}_

*Confidence:* ${Math.round(data.confidenceScore * 100)}%

*What we're building:*
${data.scope.slice(0, 200)}${data.scope.length > 200 ? "..." : ""}

*Acceptance Criteria:*
${data.acceptanceCriteria
  .split("\n")
  .filter((line) => line.trim())
  .slice(0, 3)
  .map((ac) => `• ${ac.trim()}`)
  .join("\n")}

*Key Risks:*
${data.risks.slice(0, 100)}${data.risks.length > 100 ? "..." : ""}`;
}

function formatAsNotion(data: DecisionExportData): string {
  return `**${data.title}**
Status: Ready for Handoff
Confidence: ${Math.round(data.confidenceScore * 100)}%

*Summary*
${data.summary}

*Scope*
${data.scope}

*Acceptance Criteria*
${data.acceptanceCriteria}

*Risks*
${data.risks}

*Out of Scope*
${data.nonGoals}

---
*Linked Feedback Items:* ${data.linkedFeedbackIds.length}`;
}

function formatAsMarkdown(data: DecisionExportData): string {
  return `# ${data.title}

**Status:** Ready for Implementation  
**Confidence:** ${Math.round(data.confidenceScore * 100)}%

## Summary
${data.summary}

## Scope
${data.scope}

## Acceptance Criteria
${data.acceptanceCriteria
  .split("\n")
  .filter((line) => line.trim())
  .map((ac) => `- [ ] ${ac.trim()}`)
  .join("\n")}

## Risks
${data.risks}

## Out of Scope
${data.nonGoals}

## Linked Feedback
${data.linkedFeedbackIds.length > 0 ? `Addresses ${data.linkedFeedbackIds.length} customer feedback items.` : "No direct feedback links."}

---

*Generated by PM Analyzer*
${data.projectName ? `Project: ${data.projectName}` : ""}`;
}

function formatAsJson(data: DecisionExportData): string {
  return JSON.stringify(
    {
      decision: {
        id: data.id,
        title: data.title,
        summary: data.summary,
        scope: data.scope,
        nonGoals: data.nonGoals,
        acceptanceCriteria: data.acceptanceCriteria,
        risks: data.risks,
        confidenceScore: data.confidenceScore,
        linkedFeedbackIds: data.linkedFeedbackIds,
        status: "ready_for_handoff",
      },
    },
    null,
    2
  );
}

export function formatDecision(
  data: DecisionExportData,
  format: ExportFormat
): string {
  switch (format) {
    case "cursor":
      return formatAsCursor(data);
    case "linear":
      return formatAsLinear(data);
    case "jira":
      return formatAsJira(data);
    case "slack":
      return formatAsSlack(data);
    case "notion":
      return formatAsNotion(data);
    case "markdown":
      return formatAsMarkdown(data);
    case "json":
      return formatAsJson(data);
    default:
      return formatAsMarkdown(data);
  }
}

// Component props
interface DecisionExportDialogProps {
  decision: DecisionExportData;
  trigger?: React.ReactNode;
  onExport?: (format: ExportFormat, content: string) => void;
}

export function DecisionExportDialog({
  decision,
  trigger,
  onExport,
}: DecisionExportDialogProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("cursor");
  const [preview, setPreview] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);

  // Generate preview when format or decision changes
  const updatePreview = (format: ExportFormat) => {
    const content = formatDecision(decision, format);
    setPreview(content);
    return content;
  };

  const handleFormatChange = (format: ExportFormat) => {
    setSelectedFormat(format);
    updatePreview(format);
  };

  const handleExport = (format: ExportFormat) => {
    const content = updatePreview(format);
    if (onExport) {
      onExport(format, content);
    }
  };

  const selectedConfig = EXPORT_FORMATS.find((f) => f.id === selectedFormat);

  return (
    <div className="relative">
      {trigger ? (
        <div onClick={() => setIsOpen(true)}>{trigger}</div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setIsOpen(true);
            updatePreview(selectedFormat);
          }}
        >
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      )}

      {/* Simple modal overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-[700px] max-h-[80vh] overflow-hidden flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Export Decision</CardTitle>
                  <CardDescription>
                    Choose a format and copy or download the export
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-hidden flex flex-col gap-4">
              {/* Format selector */}
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium">Format:</label>
                <Select value={selectedFormat} onValueChange={handleFormatChange}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPORT_FORMATS.map((format) => (
                      <SelectItem key={format.id} value={format.id}>
                        <div className="flex items-center gap-2">
                          <span className={format.color}>{format.icon}</span>
                          <span>{format.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="ml-auto flex items-center gap-2">
                  <span
                    className={cn(
                      "px-2 py-1 rounded text-xs font-medium",
                      selectedConfig?.color
                    )}
                  >
                    {selectedConfig?.description}
                  </span>
                </div>
              </div>

              {/* Preview area */}
              <div className="flex-1 overflow-hidden border rounded-lg bg-gray-50 dark:bg-gray-900">
                <pre className="p-4 text-sm overflow-auto h-[300px] whitespace-pre-wrap font-mono">
                  {preview}
                </pre>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-gray-500">
                  {decision.linkedFeedbackIds.length > 0 && (
                    <span>
                      Links to {decision.linkedFeedbackIds.length} feedback items
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <CopyButton
                    value={preview}
                    label="Copy"
                    copiedLabel="Copied!"
                    className="px-3 py-1.5 text-sm border rounded hover:bg-gray-50"
                  />
                  <Button
                    size="sm"
                    onClick={() => handleExport(selectedFormat)}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// Export formatter utilities for API use
export {
  formatAsCursor,
  formatAsLinear,
  formatAsJira,
  formatAsSlack,
  formatAsNotion,
  formatAsMarkdown,
  formatAsJson,
};
