import {
  Cpu,
  HardDrive,
  Zap,
  AlertTriangle,
  Eye,
  Database,
  Code,
  Calculator,
  Shield,
} from "lucide-react";

export type LocalModelCategory = "light" | "medium" | "large" | "heavy" | "extreme";
export type ModelType = "LLM" | "VLM" | "embedding";
export type Specialization = "coding" | "math";
export type PerformanceLevel =
  | "Basic"
  | "Fast"
  | "Good"
  | "Balanced"
  | "High Quality"
  | "Excellent"
  | "Premium"
  | "Ultimate"
  | "Reasoning"
  | "Multimodal"
  | "Coding"
  | "Math"
  | "Embeddings";

const CATEGORY_ICONS: Record<LocalModelCategory, React.ReactNode> = {
  light: <Zap className="w-3 h-3" />,
  medium: <Cpu className="w-3 h-3" />,
  large: <HardDrive className="w-3 h-3" />,
  heavy: <AlertTriangle className="w-3 h-3" />,
  extreme: <Shield className="w-3 h-3" />,
};

const CATEGORY_LABELS: Record<LocalModelCategory, string> = {
  light: "Light Models (0.5-4GB RAM)",
  medium: "Medium Models (3-6GB RAM)",
  large: "Large Models (6-10GB RAM)",
  heavy: "Heavy Models (8-16GB RAM) - Resource Intensive",
  extreme: "Extreme Models (16GB+ RAM) - High-End Hardware Only",
};

const CATEGORY_TOOLTIPS: Record<LocalModelCategory, string> = {
  light: "Fast, efficient models suitable for most devices including mobile",
  medium: "Balanced performance and resource usage - good for laptops",
  large: "High quality models requiring dedicated graphics or 8GB+ RAM",
  heavy: "Excellent quality but very resource intensive - may slow down your device significantly",
  extreme: "Ultimate performance models requiring high-end hardware with 16GB+ RAM",
};

const MODEL_TYPE_ICONS: Record<string, React.ReactNode | null> = {
  VLM: <Eye className="w-3 h-3" />,
  embedding: <Database className="w-3 h-3" />,
  LLM: null,
};

const SPECIALIZATION_ICONS: Record<string, React.ReactNode> = {
  coding: <Code className="w-3 h-3" />,
  math: <Calculator className="w-3 h-3" />,
};

const PERFORMANCE_BADGE_VARIANTS: Record<string, "outline" | "default" | "secondary" | "destructive"> = {
  Basic: "outline",
  Fast: "default",
  Good: "default",
  Balanced: "secondary",
  "High Quality": "secondary",
  Excellent: "destructive",
  Premium: "destructive",
  Ultimate: "destructive",
  Reasoning: "secondary",
  Multimodal: "secondary",
  Coding: "secondary",
  Math: "secondary",
  Embeddings: "secondary",
};

export function getCategoryIcon(category: string): React.ReactNode {
  return CATEGORY_ICONS[category as LocalModelCategory] ?? <Cpu className="w-3 h-3" />;
}

export function getCategoryLabel(category: string): string {
  return (
    CATEGORY_LABELS[category as LocalModelCategory] ??
    category.charAt(0).toUpperCase() + category.slice(1)
  );
}

export function getCategoryTooltip(category: string): string {
  return CATEGORY_TOOLTIPS[category as LocalModelCategory] ?? "";
}

export function getModelTypeIcon(modelType: string): React.ReactNode | null {
  return MODEL_TYPE_ICONS[modelType] ?? null;
}

export function getSpecializationIcon(specialization?: string): React.ReactNode | null {
  if (!specialization) return null;
  return SPECIALIZATION_ICONS[specialization] ?? null;
}

export function getPerformanceBadgeVariant(
  performance: string
): "outline" | "default" | "secondary" | "destructive" {
  return PERFORMANCE_BADGE_VARIANTS[performance] ?? "default";
}
