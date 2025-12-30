import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { getCategoryIcon } from "./online-model-utils";

describe("onlineModelUtils", () => {
  describe("getCategoryIcon", () => {
    it("returns Brain icon for reasoning category", () => {
      const { container } = render(<>{getCategoryIcon("reasoning")}</>);
      expect(container.querySelector("svg")).toBeInTheDocument();
      expect(container.querySelector("svg")).toHaveClass("w-3", "h-3");
    });

    it("returns Eye icon for multimodal category", () => {
      const { container } = render(<>{getCategoryIcon("multimodal")}</>);
      expect(container.querySelector("svg")).toBeInTheDocument();
      expect(container.querySelector("svg")).toHaveClass("w-3", "h-3");
    });

    it("returns Zap icon for efficient category", () => {
      const { container } = render(<>{getCategoryIcon("efficient")}</>);
      expect(container.querySelector("svg")).toBeInTheDocument();
      expect(container.querySelector("svg")).toHaveClass("w-3", "h-3");
    });

    it("returns Cloud icon for general category", () => {
      const { container } = render(<>{getCategoryIcon("general")}</>);
      expect(container.querySelector("svg")).toBeInTheDocument();
      expect(container.querySelector("svg")).toHaveClass("w-3", "h-3");
    });

    it("returns Code icon for instruction category", () => {
      const { container } = render(<>{getCategoryIcon("instruction")}</>);
      expect(container.querySelector("svg")).toBeInTheDocument();
      expect(container.querySelector("svg")).toHaveClass("w-3", "h-3");
    });

    it("returns fallback Cloud icon for unknown category", () => {
      const { container } = render(<>{getCategoryIcon("unknown")}</>);
      expect(container.querySelector("svg")).toBeInTheDocument();
      expect(container.querySelector("svg")).toHaveClass("w-3", "h-3");
    });
  });
});
