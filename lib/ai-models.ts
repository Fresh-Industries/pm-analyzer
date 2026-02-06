export const ANALYSIS_MODELS = [
  { id: "google:gemini-3-pro-preview", label: "Google Gemini 3 Pro (Preview)" },
  { id: "google:gemini-3-flash-preview", label: "Google Gemini 3 Flash (Preview)" },
  { id: "openai:gpt-4o", label: "OpenAI GPT-4o" },
  { id: "openai:gpt-4o-mini", label: "OpenAI GPT-4o mini" },
] as const;

export type AnalysisModelId = (typeof ANALYSIS_MODELS)[number]["id"];

export const DEFAULT_ANALYSIS_MODEL_ID: AnalysisModelId =
  "google:gemini-3-pro-preview";

export function isAnalysisModelId(
  id: string | null | undefined
): id is AnalysisModelId {
  if (!id) return false;
  return ANALYSIS_MODELS.some((m) => m.id === id);
}

export function getAvailableModels(enableGemini: boolean) {
  if (enableGemini) return ANALYSIS_MODELS;
  return ANALYSIS_MODELS.filter((m) => !m.id.startsWith("google:"));
}

export function isGeminiEnabled() {
  return (
    process.env.ENABLE_GEMINI === "true" ||
    process.env.NEXT_PUBLIC_ENABLE_GEMINI === "true"
  );
}
