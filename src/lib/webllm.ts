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

type ModelMetadata = Omit<ModelInfo, "id" | "vramRequired">;

const MODEL_METADATA: Record<string, ModelMetadata> = {
  // Ultra Light models (0.5-1GB RAM)
  "SmolLM2-135M-Instruct-q0f16-MLC": {
    name: "SmolLM2-135M-Instruct",
    size: "135M",
    description: "Ultra-tiny model for basic tasks",
    ramRequirement: "512MB-1GB RAM",
    downloadSize: "~200MB",
    performance: "Basic",
    category: "light",
    modelType: "LLM",
  },
  "SmolLM2-360M-Instruct-q4f16_1-MLC": {
    name: "SmolLM2-360M-Instruct",
    size: "360M",
    description: "Compact model for simple conversations",
    ramRequirement: "512MB-1GB RAM",
    downloadSize: "~300MB",
    performance: "Basic",
    category: "light",
    modelType: "LLM",
  },
  "Qwen2.5-0.5B-Instruct-q4f16_1-MLC": {
    name: "Qwen2.5-0.5B-Instruct",
    size: "0.5B",
    description: "Alibaba's ultra-lightweight model",
    ramRequirement: "1GB RAM",
    downloadSize: "~400MB",
    performance: "Fast",
    category: "light",
    modelType: "LLM",
  },
  "Qwen3-0.6B-q4f16_1-MLC": {
    name: "Qwen3-0.6B",
    size: "0.6B",
    description: "Latest Qwen ultra-light model",
    ramRequirement: "1-2GB RAM",
    downloadSize: "~500MB",
    performance: "Fast",
    category: "light",
    modelType: "LLM",
  },
  "TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC": {
    name: "TinyLlama-1.1B-Chat",
    size: "1.1B",
    description: "Tiny Llama model for basic chat",
    ramRequirement: "1-2GB RAM",
    downloadSize: "~600MB",
    performance: "Fast",
    category: "light",
    modelType: "LLM",
  },

  // Light models (1-3GB RAM)
  "Qwen2.5-1.5B-Instruct-q4f16_1-MLC": {
    name: "Qwen2.5-1.5B-Instruct",
    size: "1.5B",
    description: "Alibaba's efficient model for general tasks",
    ramRequirement: "2-3GB RAM",
    downloadSize: "~1GB",
    performance: "Good",
    category: "light",
    modelType: "LLM",
  },
  "Qwen3-1.7B-q4f16_1-MLC": {
    name: "Qwen3-1.7B",
    size: "1.7B",
    description: "Latest Qwen light model",
    ramRequirement: "2-3GB RAM",
    downloadSize: "~1.2GB",
    performance: "Good",
    category: "light",
    modelType: "LLM",
  },
  "SmolLM2-1.7B-Instruct-q4f16_1-MLC": {
    name: "SmolLM2-1.7B-Instruct",
    size: "1.7B",
    description: "HuggingFace's compact model",
    ramRequirement: "2-3GB RAM",
    downloadSize: "~1.2GB",
    performance: "Good",
    category: "light",
    modelType: "LLM",
  },
  "stablelm-2-zephyr-1_6b-q4f16_1-MLC": {
    name: "StableLM-2-Zephyr-1.6B",
    size: "1.6B",
    description: "Stability AI's efficient chat model",
    ramRequirement: "2-3GB RAM",
    downloadSize: "~1.1GB",
    performance: "Good",
    category: "light",
    modelType: "LLM",
  },
  "gemma-2-2b-it-q4f16_1-MLC": {
    name: "Gemma-2-2B-it",
    size: "2B",
    description: "Google's latest lightweight model",
    ramRequirement: "2-3GB RAM",
    downloadSize: "~1.5GB",
    performance: "Good",
    category: "light",
    modelType: "LLM",
  },
  "gemma-2b-it-q4f16_1-MLC": {
    name: "Gemma-2B-it (Original)",
    size: "2B",
    description: "Google's original lightweight model",
    ramRequirement: "2-3GB RAM",
    downloadSize: "~1.5GB",
    performance: "Good",
    category: "light",
    modelType: "LLM",
  },

  // Medium models (3-6GB RAM)
  "Llama-3.2-3B-Instruct-q4f16_1-MLC": {
    name: "Llama-3.2-3B-Instruct",
    size: "3B",
    description: "Meta's latest compact Llama model",
    ramRequirement: "3-4GB RAM",
    downloadSize: "~2GB",
    performance: "High Quality",
    category: "medium",
    modelType: "LLM",
  },
  "Hermes-3-Llama-3.2-3B-q4f16_1-MLC": {
    name: "Hermes-3-Llama-3.2-3B",
    size: "3B",
    description: "Enhanced Llama-3.2 with improved instruction following",
    ramRequirement: "3-4GB RAM",
    downloadSize: "~2GB",
    performance: "High Quality",
    category: "medium",
    modelType: "LLM",
  },
  "Qwen2.5-3B-Instruct-q4f16_1-MLC": {
    name: "Qwen2.5-3B-Instruct",
    size: "3B",
    description: "Alibaba's balanced model",
    ramRequirement: "3-4GB RAM",
    downloadSize: "~2GB",
    performance: "High Quality",
    category: "medium",
    modelType: "LLM",
  },
  "Phi-3-mini-4k-instruct-q4f16_1-MLC": {
    name: "Phi-3-mini-4k-instruct",
    size: "3.8B",
    description: "Microsoft's efficient model for reasoning",
    ramRequirement: "4-5GB RAM",
    downloadSize: "~2.5GB",
    performance: "High Quality",
    category: "medium",
    modelType: "LLM",
  },
  "Phi-3.5-mini-instruct-q4f16_1-MLC": {
    name: "Phi-3.5-mini-instruct",
    size: "3.8B",
    description: "Microsoft's latest Phi model with improved capabilities",
    ramRequirement: "4-5GB RAM",
    downloadSize: "~2.5GB",
    performance: "High Quality",
    category: "medium",
    modelType: "LLM",
  },
  "Qwen3-4B-q4f16_1-MLC": {
    name: "Qwen3-4B",
    size: "4B",
    description: "Latest Qwen medium model",
    ramRequirement: "4-5GB RAM",
    downloadSize: "~2.5GB",
    performance: "High Quality",
    category: "medium",
    modelType: "LLM",
  },
  "RedPajama-INCITE-Chat-3B-v1-q4f16_1-MLC": {
    name: "RedPajama-INCITE-Chat-3B",
    size: "3B",
    description: "Together's open-source chat model",
    ramRequirement: "4-5GB RAM",
    downloadSize: "~2.5GB",
    performance: "High Quality",
    category: "medium",
    modelType: "LLM",
  },

  // Vision Language Models (VLM)
  "Phi-3.5-vision-instruct-q4f16_1-MLC": {
    name: "Phi-3.5-Vision-Instruct",
    size: "4.2B",
    description: "Microsoft's vision-language model - can analyze images",
    ramRequirement: "4-6GB RAM",
    downloadSize: "~3GB",
    performance: "Multimodal",
    category: "medium",
    modelType: "VLM",
    supportsImages: true,
  },

  // Large models (6-10GB RAM)
  "Mistral-7B-Instruct-v0.3-q4f16_1-MLC": {
    name: "Mistral-7B-Instruct-v0.3",
    size: "7B",
    description: "Mistral AI's high-quality model",
    ramRequirement: "6-8GB RAM",
    downloadSize: "~4GB",
    performance: "Excellent",
    category: "large",
    modelType: "LLM",
  },
  "Qwen2.5-7B-Instruct-q4f16_1-MLC": {
    name: "Qwen2.5-7B-Instruct",
    size: "7B",
    description: "Alibaba's advanced model with strong reasoning",
    ramRequirement: "6-8GB RAM",
    downloadSize: "~4GB",
    performance: "Excellent",
    category: "large",
    modelType: "LLM",
  },
  "Llama-3-8B-Instruct-q4f16_1-MLC": {
    name: "Llama-3-8B-Instruct",
    size: "8B",
    description: "Meta's flagship model",
    ramRequirement: "6-8GB RAM",
    downloadSize: "~4.5GB",
    performance: "Excellent",
    category: "large",
    modelType: "LLM",
  },
  "Qwen3-8B-q4f16_1-MLC": {
    name: "Qwen3-8B",
    size: "8B",
    description: "Latest Qwen large model",
    ramRequirement: "6-8GB RAM",
    downloadSize: "~4.5GB",
    performance: "Excellent",
    category: "large",
    modelType: "LLM",
  },
  "gemma-2-9b-it-q4f16_1-MLC": {
    name: "Gemma-2-9B-it",
    size: "9B",
    description: "Google's large model",
    ramRequirement: "7-9GB RAM",
    downloadSize: "~5GB",
    performance: "Excellent",
    category: "large",
    modelType: "LLM",
  },

  // Heavy models (8-16GB RAM)
  "Llama-3.1-8B-Instruct-q4f32_1-MLC": {
    name: "Llama-3.1-8B-Instruct",
    size: "8B",
    description: "Meta's latest flagship model with 128k context",
    ramRequirement: "8-12GB RAM",
    downloadSize: "~5GB",
    performance: "Premium",
    category: "heavy",
    modelType: "LLM",
  },
  "Hermes-2-Pro-Llama-3-8B-q4f16_1-MLC": {
    name: "Hermes-2-Pro-Llama-3-8B",
    size: "8B",
    description: "Enhanced Llama-3 with function calling support",
    ramRequirement: "8-12GB RAM",
    downloadSize: "~5GB",
    performance: "Premium",
    category: "heavy",
    modelType: "LLM",
    supportsFunctions: true,
  },
  "Hermes-3-Llama-3.1-8B-q4f16_1-MLC": {
    name: "Hermes-3-Llama-3.1-8B",
    size: "8B",
    description: "Latest Hermes with advanced capabilities",
    ramRequirement: "8-12GB RAM",
    downloadSize: "~5GB",
    performance: "Premium",
    category: "heavy",
    modelType: "LLM",
    supportsFunctions: true,
  },
  "DeepSeek-R1-Distill-Qwen-7B-q4f16_1-MLC": {
    name: "DeepSeek-R1-Distill-Qwen-7B",
    size: "7B",
    description: "DeepSeek's reasoning-focused model",
    ramRequirement: "6-8GB RAM",
    downloadSize: "~4GB",
    performance: "Reasoning",
    category: "large",
    modelType: "LLM",
  },
  "DeepSeek-R1-Distill-Llama-8B-q4f16_1-MLC": {
    name: "DeepSeek-R1-Distill-Llama-8B",
    size: "8B",
    description: "DeepSeek's advanced reasoning model",
    ramRequirement: "8-12GB RAM",
    downloadSize: "~5GB",
    performance: "Reasoning",
    category: "heavy",
    modelType: "LLM",
  },

  // Specialized models
  "Qwen2.5-Coder-7B-Instruct-q4f16_1-MLC": {
    name: "Qwen2.5-Coder-7B-Instruct",
    size: "7B",
    description: "Specialized for coding tasks",
    ramRequirement: "6-8GB RAM",
    downloadSize: "~4GB",
    performance: "Coding",
    category: "large",
    modelType: "LLM",
    specialization: "coding",
  },
  "Qwen2.5-Math-7B-Instruct-q4f16_1-MLC": {
    name: "Qwen2.5-Math-7B-Instruct",
    size: "7B",
    description: "Specialized for mathematical reasoning",
    ramRequirement: "6-8GB RAM",
    downloadSize: "~4GB",
    performance: "Math",
    category: "large",
    modelType: "LLM",
    specialization: "math",
  },
  "WizardMath-7B-V1.1-q4f16_1-MLC": {
    name: "WizardMath-7B-V1.1",
    size: "7B",
    description: "Mathematical problem solving specialist",
    ramRequirement: "6-8GB RAM",
    downloadSize: "~4GB",
    performance: "Math",
    category: "large",
    modelType: "LLM",
    specialization: "math",
  },

  // Embedding models
  "snowflake-arctic-embed-m-q0f32-MLC-b4": {
    name: "Snowflake Arctic Embed M",
    size: "110M",
    description: "Text embedding model for semantic search",
    ramRequirement: "1GB RAM",
    downloadSize: "~400MB",
    performance: "Embeddings",
    category: "light",
    modelType: "embedding",
  },
  "snowflake-arctic-embed-s-q0f32-MLC-b4": {
    name: "Snowflake Arctic Embed S",
    size: "33M",
    description: "Small text embedding model",
    ramRequirement: "512MB RAM",
    downloadSize: "~200MB",
    performance: "Embeddings",
    category: "light",
    modelType: "embedding",
  },

  // Extreme models (16GB+ RAM)
  "Llama-3.1-70B-Instruct-q3f16_1-MLC": {
    name: "Llama-3.1-70B-Instruct",
    size: "70B",
    description: "Meta's largest model - requires significant resources",
    ramRequirement: "32GB+ RAM",
    downloadSize: "~40GB",
    performance: "Ultimate",
    category: "extreme",
    modelType: "LLM",
    warning: "Requires high-end hardware",
  },
};

export function createModelCatalog(): ModelInfo[] {
  const webllmModels = prebuiltAppConfig.model_list;

  return webllmModels
    .filter((m) => MODEL_METADATA[m.model_id])
    .map((m) => ({
      id: m.model_id,
      vramRequired: m.vram_required_MB,
      ...MODEL_METADATA[m.model_id],
    }));
}
