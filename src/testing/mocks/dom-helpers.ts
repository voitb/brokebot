import { vi } from "vitest";

export function createMockTextarea(scrollHeight = 100) {
  const style = { height: "", overflowY: "" };
  return {
    style,
    get scrollHeight() {
      return scrollHeight;
    },
  } as unknown as HTMLTextAreaElement;
}

export function createMockViewport(overrides: Partial<HTMLElement> = {}) {
  return {
    scrollTop: 0,
    scrollHeight: 1000,
    clientHeight: 500,
    scrollTo: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    querySelector: vi.fn(),
    ...overrides,
  } as unknown as HTMLElement;
}

export function createMockMutationObserver() {
  return {
    observe: vi.fn(),
    disconnect: vi.fn(),
    takeRecords: vi.fn(),
  };
}

export function createMockMatchMedia(matches = false) {
  const listeners: Array<() => void> = [];
  const mockFn = vi.fn((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: (_: string, listener: () => void) => listeners.push(listener),
    removeEventListener: (_: string, listener: () => void) => {
      const idx = listeners.indexOf(listener);
      if (idx > -1) listeners.splice(idx, 1);
    },
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
  return Object.assign(mockFn, { listeners });
}
