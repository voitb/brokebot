import { vi } from "vitest";

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
