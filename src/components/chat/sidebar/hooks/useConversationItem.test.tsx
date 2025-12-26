import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useConversationItem } from "./useConversationItem";
import { ConversationsProvider } from "../../../../providers/ConversationsProvider";
import { clearTestDatabase, seedConversation } from "../../../../test/db-helpers";
import type { Conversation } from "../../../../lib/db";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

describe("useConversationItem", () => {
  let testConversation: Conversation;

  beforeEach(async () => {
    await clearTestDatabase();
    vi.clearAllMocks();
    testConversation = await seedConversation({ title: "Test Chat" });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ConversationsProvider>
      <MemoryRouter>{children}</MemoryRouter>
    </ConversationsProvider>
  );

  it("initializes with correct default state", () => {
    const { result } = renderHook(
      () => useConversationItem(testConversation),
      { wrapper }
    );

    expect(result.current.isEditing).toBe(false);
    expect(result.current.isMenuOpen).toBe(false);
    expect(result.current.deleteDialogOpen).toBe(false);
    expect(result.current.isCreateFolderDialogOpen).toBe(false);
  });

  it("isActive returns false when not on conversation path", () => {
    const { result } = renderHook(
      () => useConversationItem(testConversation),
      { wrapper }
    );

    expect(result.current.isActive).toBe(false);
  });

  it("navigates on click when not editing", () => {
    const { result } = renderHook(
      () => useConversationItem(testConversation),
      { wrapper }
    );

    act(() => {
      result.current.handleConversationClick();
    });

    expect(mockNavigate).toHaveBeenCalledWith(`/chat/${testConversation.id}`);
  });

  it("enables editing mode on rename", () => {
    const { result } = renderHook(
      () => useConversationItem(testConversation),
      { wrapper }
    );

    const mockEvent = { stopPropagation: vi.fn(), preventDefault: vi.fn() };
    act(() => {
      result.current.handleRename(mockEvent as unknown as React.MouseEvent);
    });

    expect(result.current.isEditing).toBe(true);
    expect(result.current.isMenuOpen).toBe(false);
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
    expect(mockEvent.preventDefault).toHaveBeenCalled();
  });

  it("cancels rename mode", () => {
    const { result } = renderHook(
      () => useConversationItem(testConversation),
      { wrapper }
    );

    const mockEvent = { stopPropagation: vi.fn(), preventDefault: vi.fn() };
    act(() => {
      result.current.handleRename(mockEvent as unknown as React.MouseEvent);
    });
    expect(result.current.isEditing).toBe(true);

    act(() => {
      result.current.handleCancelRename();
    });
    expect(result.current.isEditing).toBe(false);
  });

  it("opens delete dialog", () => {
    const { result } = renderHook(
      () => useConversationItem(testConversation),
      { wrapper }
    );

    const mockEvent = { stopPropagation: vi.fn() };
    act(() => {
      result.current.handleDelete(mockEvent as unknown as React.MouseEvent);
    });

    expect(result.current.deleteDialogOpen).toBe(true);
    expect(result.current.isMenuOpen).toBe(false);
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
  });

  it("closes delete dialog via setDeleteDialogOpen", () => {
    const { result } = renderHook(
      () => useConversationItem(testConversation),
      { wrapper }
    );

    const mockEvent = { stopPropagation: vi.fn() };
    act(() => {
      result.current.handleDelete(mockEvent as unknown as React.MouseEvent);
    });
    expect(result.current.deleteDialogOpen).toBe(true);

    act(() => {
      result.current.setDeleteDialogOpen(false);
    });
    expect(result.current.deleteDialogOpen).toBe(false);
  });

  it("toggles menu open state", () => {
    const { result } = renderHook(
      () => useConversationItem(testConversation),
      { wrapper }
    );

    act(() => {
      result.current.setIsMenuOpen(true);
    });
    expect(result.current.isMenuOpen).toBe(true);

    act(() => {
      result.current.setIsMenuOpen(false);
    });
    expect(result.current.isMenuOpen).toBe(false);
  });

  it("returns item styles as a non-empty string", () => {
    const { result } = renderHook(
      () => useConversationItem(testConversation),
      { wrapper }
    );

    const styles = result.current.getItemStyles();
    expect(typeof styles).toBe("string");
    expect(styles.length).toBeGreaterThan(0);
  });

  it("returns different styles when menu is open", () => {
    const { result } = renderHook(
      () => useConversationItem(testConversation),
      { wrapper }
    );

    const defaultStyles = result.current.getItemStyles();

    act(() => {
      result.current.setIsMenuOpen(true);
    });

    const menuOpenStyles = result.current.getItemStyles();
    expect(menuOpenStyles).not.toBe(defaultStyles);
  });

  it("returns different styles when editing", () => {
    const { result } = renderHook(
      () => useConversationItem(testConversation),
      { wrapper }
    );

    const defaultStyles = result.current.getItemStyles();

    const mockEvent = { stopPropagation: vi.fn(), preventDefault: vi.fn() };
    act(() => {
      result.current.handleRename(mockEvent as unknown as React.MouseEvent);
    });

    const editingStyles = result.current.getItemStyles();
    expect(editingStyles).not.toBe(defaultStyles);
  });

  it("handlePinToggle calls togglePinConversation and closes menu", async () => {
    const { result } = renderHook(
      () => useConversationItem(testConversation),
      { wrapper }
    );

    act(() => {
      result.current.setIsMenuOpen(true);
    });

    const mockEvent = { stopPropagation: vi.fn() };
    await act(async () => {
      await result.current.handlePinToggle(
        mockEvent as unknown as React.MouseEvent
      );
    });

    await waitFor(() => {
      expect(result.current.isMenuOpen).toBe(false);
    });
  });
});
