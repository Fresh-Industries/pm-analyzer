export const ANALYSIS_MODELS = [
  { id: "openai:gpt-4o", label: "OpenAI GPT-4o" },
  { id: "openai:gpt-4o-mini", label: "OpenAI GPT-4o mini" },
  { id: "google:gemini-2.5-pro", label: "Google Gemini 2.5 Pro" },
  { id: "google:gemini-2.5-flash", label: "Google Gemini 2.5 Flash" },
] as const;

export type AnalysisModelId = (typeof ANALYSIS_MODELS)[number]["id"];

export const DEFAULT_ANALYSIS_MODEL_ID: AnalysisModelId = "openai:gpt-4o";

export function isAnalysisModelId(
  id: string | null | undefined
): id is AnalysisModelId {
  if (!id) return false;
  return ANALYSIS_MODELS.some((m) => m.id === id);
}
