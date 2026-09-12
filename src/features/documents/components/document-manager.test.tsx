import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "@/testing/utils";
import { DocumentManager } from "./document-manager";
import { clearTestDatabase, seedDocument } from "@/testing/db-helpers";
import { createMockFile } from "@/testing/mocks/modules";

describe("DocumentManager", () => {
  beforeEach(async () => {
    await clearTestDatabase();
    vi.clearAllMocks();
  });

  it("shows empty state when no documents are stored", async () => {
    render(<DocumentManager />);

    expect(await screen.findByText("No documents uploaded yet")).toBeInTheDocument();
  });

  it("lists an existing document by filename", async () => {
    await seedDocument({ filename: "existing.txt" });

    render(<DocumentManager />);

    expect(await screen.findByText("existing.txt")).toBeInTheDocument();
    expect(screen.queryByText("No documents uploaded yet")).not.toBeInTheDocument();
  });

  it("lists an uploaded document by filename", async () => {
    const user = userEvent.setup();

    render(<DocumentManager />);

    await screen.findByText("No documents uploaded yet");

    const fileInput = screen.getByLabelText<HTMLInputElement>(
      "Upload text or markdown files"
    );

    await user.upload(fileInput, createMockFile("notes.txt", "hello world"));

    await waitFor(() => {
      expect(screen.getByText("notes.txt")).toBeInTheDocument();
    });
    expect(screen.queryByText("No documents uploaded yet")).not.toBeInTheDocument();
  });
});
