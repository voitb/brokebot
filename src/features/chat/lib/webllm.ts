import { prebuiltAppConfig } from "@mlc-ai/web-llm";

export interface ModelInfo {
  id: string;
  name: string;
  size: string;
  description: string;
  ramRequirement: string;
  downloadSize: string;
  performance: string;
  category: "light" | "medium" | "large" | "heavy" | "extreme";
  modelType: "LLM" | "VLM" | "embedding";
  supportsImages?: boolean;
  supportsFunctions?: boolean;
  specialization?: string;
  warning?: string;
  vramRequired?: number;
}

function deriveCategory(vramMB?: number): ModelInfo["category"] {
  if (!vramMB || vramMB < 2000) return "light";
  if (vramMB < 4000) return "medium";
  if (vramMB < 8000) return "large";
  if (vramMB < 16000) return "heavy";
  return "extreme";
}

function derivePerformance(category: ModelInfo["category"]): string {
  switch (category) {
    case "light":
      return "Fast";
    case "medium":
      return "Good";
    case "large":
      return "Excellent";
    case "heavy":
      return "Premium";
    case "extreme":
      return "Ultimate";
  }
}

function parseModelName(modelId: string): { name: string; size: string } {
  const sizeMatch = modelId.match(/(\d+\.?\d*)[_-]?([BMK])/i);
  const size = sizeMatch ? `${sizeMatch[1]}${sizeMatch[2].toUpperCase()}` : "Unknown";

  const name = modelId
    .replace(/-q\d+f\d+.*$/i, "")
    .replace(/-MLC$/, "")
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return { name, size };
}

function deriveModelType(modelId: string, modelType?: unknown): ModelInfo["modelType"] {
  const typeStr = String(modelType ?? "");
  if (typeStr === "embedding") return "embedding";
  if (typeStr === "vlm" || modelId.toLowerCase().includes("vision")) return "VLM";
  return "LLM";
}

function deriveSpecialization(modelId: string): string | undefined {
  const lowerCaseId = modelId.toLowerCase();
  if (lowerCaseId.includes("coder") || lowerCaseId.includes("code")) return "coding";
  if (lowerCaseId.includes("math")) return "math";
  return undefined;
}

function deriveSupportsFunctions(modelId: string): boolean {
  const lowerCaseId = modelId.toLowerCase();
  return lowerCaseId.includes("hermes");
}

function deriveSupportsImages(modelId: string, modelType?: unknown): boolean {
  return String(modelType ?? "") === "vlm" || modelId.toLowerCase().includes("vision");
}

function formatRamRequirement(vramMB?: number): string {
  if (!vramMB) return "Unknown";
  const gb = Math.ceil(vramMB / 1024);
  return `~${gb}GB RAM`;
}

const CUSTOM_DESCRIPTIONS: Record<string, string> = {
  "Llama-3.2-3B-Instruct-q4f16_1-MLC": "Meta's latest compact Llama model",
  "Llama-3.2-1B-Instruct-q4f16_1-MLC": "Meta's ultra-lightweight Llama model",
  "Llama-3.1-8B-Instruct-q4f32_1-MLC": "Meta's flagship model with 128k context",
  "Qwen2.5-7B-Instruct-q4f16_1-MLC": "Alibaba's advanced model with strong reasoning",
  "Qwen2.5-Coder-7B-Instruct-q4f16_1-MLC": "Specialized for coding tasks",
  "Qwen2.5-Math-7B-Instruct-q4f16_1-MLC": "Specialized for mathematical reasoning",
  "Mistral-7B-Instruct-v0.3-q4f16_1-MLC": "Mistral AI's high-quality model",
  "Phi-3.5-mini-instruct-q4f16_1-MLC": "Microsoft's efficient model with improved capabilities",
  "Phi-3.5-vision-instruct-q4f16_1-MLC": "Microsoft's vision-language model - can analyze images",
  "gemma-2-9b-it-q4f16_1-MLC": "Google's large model",
  "gemma-2-2b-it-q4f16_1-MLC": "Google's latest lightweight model",
  "DeepSeek-R1-Distill-Qwen-7B-q4f16_1-MLC": "DeepSeek's reasoning-focused model",
  "DeepSeek-R1-Distill-Llama-8B-q4f16_1-MLC": "DeepSeek's advanced reasoning model",
  "Hermes-3-Llama-3.1-8B-q4f16_1-MLC": "Latest Hermes with advanced capabilities and function calling",
  "SmolLM2-1.7B-Instruct-q4f16_1-MLC": "HuggingFace's compact model",
  "TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC": "Tiny Llama model for basic chat",
};

export function createModelCatalog(): ModelInfo[] {
  return prebuiltAppConfig.model_list.map((m) => {
    const { name, size } = parseModelName(m.model_id);
    const category = deriveCategory(m.vram_required_MB);
    const modelType = deriveModelType(m.model_id, m.model_type);
    const specialization = deriveSpecialization(m.model_id);
    const supportsImages = deriveSupportsImages(m.model_id, m.model_type);
    const supportsFunctions = deriveSupportsFunctions(m.model_id);

    return {
      id: m.model_id,
      name,
      size,
      description: CUSTOM_DESCRIPTIONS[m.model_id] ?? `${name} model`,
      ramRequirement: formatRamRequirement(m.vram_required_MB),
      downloadSize: "See web-llm",
      performance: derivePerformance(category),
      category,
      modelType,
      vramRequired: m.vram_required_MB,
      ...(supportsImages && { supportsImages }),
      ...(supportsFunctions && { supportsFunctions }),
      ...(specialization && { specialization }),
      ...(category === "extreme" && { warning: "Requires high-end hardware" }),
    };
  });
}
