import React from "react";
import { Cpu, HardDrive, Zap, AlertTriangle, Eye, Database, Code, Calculator, Shield } from "lucide-react";

export const getCategoryIcon = (category: string) => {
    switch (category) {
      case "light":
        return <Zap className="w-3 h-3" />;
      case "medium":
        return <Cpu className="w-3 h-3" />;
      case "large":
        return <HardDrive className="w-3 h-3" />;
      case "heavy":
        return <AlertTriangle className="w-3 h-3" />;
      case "extreme":
        return <Shield className="w-3 h-3" />;
      default:
        return <Cpu className="w-3 h-3" />;
    }
};

export const getCategoryLabel = (category: string) => {
    switch (category) {
      case "light":
        return "Light Models (0.5-4GB RAM)";
      case "medium":
        return "Medium Models (3-6GB RAM)";
      case "large":
        return "Large Models (6-10GB RAM)";
      case "heavy":
        return "Heavy Models (8-16GB RAM) - Resource Intensive";
      case "extreme":
        return "Extreme Models (16GB+ RAM) - High-End Hardware Only";
      default:
        return category.charAt(0).toUpperCase() + category.slice(1);
    }
};

export const getModelTypeIcon = (modelType: string) => {
    switch (modelType) {
      case "VLM":
        return <Eye className="w-3 h-3" />;
      case "embedding":
        return <Database className="w-3 h-3" />;
      default:
        return null;
    }
};

export const getSpecializationIcon = (specialization?: string) => {
    switch (specialization) {
      case "coding":
        return <Code className="w-3 h-3" />;
      case "math":
        return <Calculator className="w-3 h-3" />;
      default:
        return null;
    }
};

export const getPerformanceBadgeVariant = (performance: string): "outline" | "default" | "secondary" | "destructive" => {
    switch (performance) {
      case "Basic":
        return "outline";
      case "Fast":
      case "Good":
        return "default";
      case "Balanced":
      case "High Quality":
        return "secondary";
      case "Excellent":
      case "Premium":
        return "destructive";
      case "Ultimate":
        return "destructive";
      case "Reasoning":
      case "Multimodal":
      case "Coding":
      case "Math":
      case "Embeddings":
        return "secondary";
      default:
        return "default";
    }
};

export const getCategoryTooltip = (category: string) => {
    switch (category) {
      case "light":
        return "Fast, efficient models suitable for most devices including mobile";
      case "medium":
        return "Balanced performance and resource usage - good for laptops";
      case "large":
        return "High quality models requiring dedicated graphics or 8GB+ RAM";
      case "heavy":
        return "Excellent quality but very resource intensive - may slow down your device significantly";
      case "extreme":
        return "Ultimate performance models requiring high-end hardware with 16GB+ RAM";
      default:
        return "";
    }
}; 