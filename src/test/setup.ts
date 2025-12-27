import "@testing-library/jest-dom";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import "fake-indexeddb/auto";
import { mockToast, mockNavigate, resetMocks } from "./mocks/modules";

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

// Global react-router-dom mock - accessible via mockNavigate from test/mocks/modules
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

afterEach(() => {
  cleanup();
  resetMocks();
});

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
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
