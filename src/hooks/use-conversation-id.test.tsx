import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useConversationId } from "./use-conversation-id";

function wrapper(initialPath: string) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <MemoryRouter initialEntries={[initialPath]}>{children}</MemoryRouter>
    );
  };
}

describe("useConversationId", () => {
  it.each([
    ["/chat/abc123", "abc123"],
    ["/chat/550e8400-e29b-41d4-a716-446655440000", "550e8400-e29b-41d4-a716-446655440000"],
    ["/chat", undefined],
    ["/chat/", undefined],
    ["/settings", undefined],
  ])("returns correct ID for path %s", (path, expected) => {
    const { result } = renderHook(() => useConversationId(), {
      wrapper: wrapper(path),
    });

    expect(result.current).toBe(expected);
  });
});
