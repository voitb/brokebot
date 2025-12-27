import "@testing-library/jest-dom";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import "fake-indexeddb/auto";
import { mockToast, mockNavigate, mockSearchParams, resetMocks } from "./mocks/modules";

// Mock @xenova/transformers to avoid sharp native module issues
vi.mock("@xenova/transformers", () => ({
  pipeline: vi.fn(),
  env: {
    allowLocalModels: false,
    allowRemoteModels: true,
    useBrowserCache: true,
  },
}));

// Global sonner toast mock - accessible via mockToast from test/mocks/modules
vi.mock("sonner", () => ({
  toast: mockToast,
}));

// Global react-router-dom mock - accessible via mockNavigate/mockSearchParams from test/mocks/modules
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [mockSearchParams],
  };
});

afterEach(() => {
  cleanup();
  resetMocks();
});

import { createMockMatchMedia } from "./mocks/dom-helpers";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: createMockMatchMedia(),
});

class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

Object.defineProperty(window, "ResizeObserver", {
  writable: true,
  value: ResizeObserverMock,
});

// Mock scrollTo for components that use auto-scroll
Element.prototype.scrollTo = vi.fn();
