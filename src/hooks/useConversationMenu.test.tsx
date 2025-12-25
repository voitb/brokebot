import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useConversationMenu } from "./useConversationMenu";
import { createMockConversation } from "../test/mocks/factories";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

describe("useConversationMenu", () => {
  const mockTogglePin = vi.fn().mockResolvedValue(undefined);
  const conversations = [createMockConversation({ id: "abc12345678" })];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter>{children}</MemoryRouter>
  );

  it("initializes with null openMenuId", () => {
    const { result } = renderHook(
      () => useConversationMenu(conversations, mockTogglePin),
      { wrapper }
    );
    expect(result.current.openMenuId).toBeNull();
  });

  it("setOpenMenuId updates menu state", () => {
    const { result } = renderHook(
      () => useConversationMenu(conversations, mockTogglePin),
      { wrapper }
    );

    act(() => {
      result.current.setOpenMenuId(123);
    });

    expect(result.current.openMenuId).toBe(123);
  });

  it("navigates on conversation click", () => {
    const { result } = renderHook(
      () => useConversationMenu(conversations, mockTogglePin),
      { wrapper }
    );

    const uiId = parseInt(conversations[0].id.slice(-8), 16);
    act(() => {
      result.current.handleConversationClick(uiId, null);
    });

    expect(mockNavigate).toHaveBeenCalledWith(`/chat/${conversations[0].id}`);
  });

  it("skips navigation when editing", () => {
    const { result } = renderHook(
      () => useConversationMenu(conversations, mockTogglePin),
      { wrapper }
    );

    const uiId = parseInt(conversations[0].id.slice(-8), 16);
    act(() => {
      result.current.handleConversationClick(uiId, uiId);
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("toggles pin on favourite", async () => {
    const { result } = renderHook(
      () => useConversationMenu(conversations, mockTogglePin),
      { wrapper }
    );

    const uiId = parseInt(conversations[0].id.slice(-8), 16);
    await act(async () => {
      await result.current.handleFavouriteConversation(uiId);
    });

    expect(mockTogglePin).toHaveBeenCalledWith(conversations[0].id);
  });

  it("getOriginalConversation returns correct conversation", () => {
    const { result } = renderHook(
      () => useConversationMenu(conversations, mockTogglePin),
      { wrapper }
    );

    const uiId = parseInt(conversations[0].id.slice(-8), 16);
    const found = result.current.getOriginalConversation(uiId);

    expect(found?.id).toBe(conversations[0].id);
  });

  it("getOriginalConversation returns undefined for unknown id", () => {
    const { result } = renderHook(
      () => useConversationMenu(conversations, mockTogglePin),
      { wrapper }
    );

    const found = result.current.getOriginalConversation(999999);
    expect(found).toBeUndefined();
  });
});
