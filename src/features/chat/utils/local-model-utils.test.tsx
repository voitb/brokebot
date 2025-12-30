import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import {
  getCategoryIcon,
  getCategoryLabel,
  getCategoryTooltip,
  getModelTypeIcon,
  getSpecializationIcon,
  getPerformanceBadgeVariant,
} from "./local-model-utils";

describe("localModelUtils", () => {
  describe("getCategoryIcon", () => {
    it("returns Zap icon for light category", () => {
      const { container } = render(<>{getCategoryIcon("light")}</>);
      expect(container.querySelector("svg")).toBeInTheDocument();
      expect(container.querySelector("svg")).toHaveClass("w-3", "h-3");
    });

    it("returns Cpu icon for medium category", () => {
      const { container } = render(<>{getCategoryIcon("medium")}</>);
      expect(container.querySelector("svg")).toBeInTheDocument();
    });

    it("returns HardDrive icon for large category", () => {
      const { container } = render(<>{getCategoryIcon("large")}</>);
      expect(container.querySelector("svg")).toBeInTheDocument();
    });

    it("returns AlertTriangle icon for heavy category", () => {
      const { container } = render(<>{getCategoryIcon("heavy")}</>);
      expect(container.querySelector("svg")).toBeInTheDocument();
    });

    it("returns Shield icon for extreme category", () => {
      const { container } = render(<>{getCategoryIcon("extreme")}</>);
      expect(container.querySelector("svg")).toBeInTheDocument();
    });

    it("returns fallback Cpu icon for unknown category", () => {
      const { container } = render(<>{getCategoryIcon("unknown")}</>);
      expect(container.querySelector("svg")).toBeInTheDocument();
    });
  });

  describe("getCategoryLabel", () => {
    it("returns correct label for light category", () => {
      expect(getCategoryLabel("light")).toBe("Light Models (0.5-4GB RAM)");
    });

    it("returns correct label for medium category", () => {
      expect(getCategoryLabel("medium")).toBe("Medium Models (3-6GB RAM)");
    });

    it("returns correct label for large category", () => {
      expect(getCategoryLabel("large")).toBe("Large Models (6-10GB RAM)");
    });

    it("returns correct label for heavy category", () => {
      expect(getCategoryLabel("heavy")).toBe("Heavy Models (8-16GB RAM) - Resource Intensive");
    });

    it("returns correct label for extreme category", () => {
      expect(getCategoryLabel("extreme")).toBe("Extreme Models (16GB+ RAM) - High-End Hardware Only");
    });

    it("returns capitalized category for unknown category", () => {
      expect(getCategoryLabel("unknown")).toBe("Unknown");
    });
  });

  describe("getCategoryTooltip", () => {
    it("returns tooltip for light category", () => {
      expect(getCategoryTooltip("light")).toBe(
        "Fast, efficient models suitable for most devices including mobile"
      );
    });

    it("returns tooltip for medium category", () => {
      expect(getCategoryTooltip("medium")).toBe(
        "Balanced performance and resource usage - good for laptops"
      );
    });

    it("returns tooltip for large category", () => {
      expect(getCategoryTooltip("large")).toBe(
        "High quality models requiring dedicated graphics or 8GB+ RAM"
      );
    });

    it("returns tooltip for heavy category", () => {
      expect(getCategoryTooltip("heavy")).toBe(
        "Excellent quality but very resource intensive - may slow down your device significantly"
      );
    });

    it("returns tooltip for extreme category", () => {
      expect(getCategoryTooltip("extreme")).toBe(
        "Ultimate performance models requiring high-end hardware with 16GB+ RAM"
      );
    });

    it("returns empty string for unknown category", () => {
      expect(getCategoryTooltip("unknown")).toBe("");
    });
  });

  describe("getModelTypeIcon", () => {
    it("returns Eye icon for VLM type", () => {
      const { container } = render(<>{getModelTypeIcon("VLM")}</>);
      expect(container.querySelector("svg")).toBeInTheDocument();
    });

    it("returns Database icon for embedding type", () => {
      const { container } = render(<>{getModelTypeIcon("embedding")}</>);
      expect(container.querySelector("svg")).toBeInTheDocument();
    });

    it("returns null for LLM type", () => {
      expect(getModelTypeIcon("LLM")).toBeNull();
    });

    it("returns null for unknown type", () => {
      expect(getModelTypeIcon("unknown")).toBeNull();
    });
  });

  describe("getSpecializationIcon", () => {
    it("returns Code icon for coding specialization", () => {
      const { container } = render(<>{getSpecializationIcon("coding")}</>);
      expect(container.querySelector("svg")).toBeInTheDocument();
    });

    it("returns Calculator icon for math specialization", () => {
      const { container } = render(<>{getSpecializationIcon("math")}</>);
      expect(container.querySelector("svg")).toBeInTheDocument();
    });

    it("returns null for undefined specialization", () => {
      expect(getSpecializationIcon(undefined)).toBeNull();
    });

    it("returns null for unknown specialization", () => {
      expect(getSpecializationIcon("unknown")).toBeNull();
    });
  });

  describe("getPerformanceBadgeVariant", () => {
    it("returns 'outline' for Basic performance", () => {
      expect(getPerformanceBadgeVariant("Basic")).toBe("outline");
    });

    it("returns 'default' for Fast performance", () => {
      expect(getPerformanceBadgeVariant("Fast")).toBe("default");
    });

    it("returns 'default' for Good performance", () => {
      expect(getPerformanceBadgeVariant("Good")).toBe("default");
    });

    it("returns 'secondary' for Balanced performance", () => {
      expect(getPerformanceBadgeVariant("Balanced")).toBe("secondary");
    });

    it("returns 'secondary' for High Quality performance", () => {
      expect(getPerformanceBadgeVariant("High Quality")).toBe("secondary");
    });

    it("returns 'destructive' for Excellent performance", () => {
      expect(getPerformanceBadgeVariant("Excellent")).toBe("destructive");
    });

    it("returns 'destructive' for Premium performance", () => {
      expect(getPerformanceBadgeVariant("Premium")).toBe("destructive");
    });

    it("returns 'destructive' for Ultimate performance", () => {
      expect(getPerformanceBadgeVariant("Ultimate")).toBe("destructive");
    });

    it("returns 'secondary' for specialized performance types", () => {
      expect(getPerformanceBadgeVariant("Reasoning")).toBe("secondary");
      expect(getPerformanceBadgeVariant("Multimodal")).toBe("secondary");
      expect(getPerformanceBadgeVariant("Coding")).toBe("secondary");
      expect(getPerformanceBadgeVariant("Math")).toBe("secondary");
      expect(getPerformanceBadgeVariant("Embeddings")).toBe("secondary");
    });

    it("returns 'default' for unknown performance", () => {
      expect(getPerformanceBadgeVariant("unknown")).toBe("default");
    });
  });
});
