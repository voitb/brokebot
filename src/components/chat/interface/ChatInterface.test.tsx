import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ChatInterface } from "./ChatInterface";
import { ConversationsProvider } from "../../../providers/ConversationsProvider";
import { ThemeProvider } from "../../../providers/ThemeProvider";
import { SidebarProvider } from "../../../components/ui/sidebar";
import { clearTestDatabase, seedConversationWithMessages } from "../../../test/db-helpers";
import { createMockModelContext, createMockWebLLMContext } from "../../../test/mocks/factories";

const mockModelContext = createMockModelContext();
const mockWebLLMContext = createMockWebLLMContext();

vi.mock("../../../providers/ModelProvider", () => ({
  useModel: () => mockModelContext,
  ModelProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("../../../providers/WebLLMProvider", () => ({
  useWebLLM: () => mockWebLLMContext,
  WebLLMProvider: ({ children }: { children: React.ReactNode }) => children,
  AVAILABLE_MODELS: [
    {
      id: "test-model",
      name: "Test Model",
      size: "1B",
      description: "Test model",
      ramRequirement: "2GB",
      downloadSize: "~500MB",
      performance: "Fast",
      category: "light",
      modelType: "LLM",
      specialization: "general",
    },
  ],
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
    dismiss: vi.fn(),
    loading: vi.fn(),
  },
}));

vi.mock("../../../lib/speech-recognition", () => ({
  SpeechRecognitionService: {
    getInstance: vi.fn().mockResolvedValue(() => Promise.resolve({ text: "" })),
    dispose: vi.fn().mockResolvedValue(undefined),
  },
}));

function renderChatInterface(conversationId?: string) {
  const initialPath = conversationId ? `/conversation/${conversationId}` : "/conversation/new";

  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <ThemeProvider defaultTheme="system" storageKey="test-theme">
        <SidebarProvider>
          <ConversationsProvider>
            <Routes>
              <Route path="/conversation/new" element={<ChatInterface />} />
              <Route path="/conversation/:id" element={<ChatInterface />} />
            </Routes>
          </ConversationsProvider>
        </SidebarProvider>
      </ThemeProvider>
    </MemoryRouter>
  );
}

describe("ChatInterface", () => {
  beforeEach(async () => {
    await clearTestDatabase();
    vi.clearAllMocks();
    Object.assign(mockModelContext, createMockModelContext());
    Object.assign(mockWebLLMContext, createMockWebLLMContext());
  });

  describe("rendering", () => {
    it("renders chat input area", async () => {
      renderChatInterface();

      await waitFor(() => {
        expect(screen.getByRole("textbox")).toBeInTheDocument();
      });
    });
  });

  describe("model status", () => {
    it("shows model status indicator", async () => {
      mockModelContext.modelStatus = "Ready";

      renderChatInterface();

      await waitFor(() => {
        expect(screen.getByText(/ready/i)).toBeInTheDocument();
      });
    });

    it("shows loading state when model is loading", async () => {
      mockModelContext.isModelLoading = true;
      mockModelContext.modelStatus = "Loading model...";

      renderChatInterface();

      await waitFor(() => {
        expect(screen.getByText(/loading model/i)).toBeInTheDocument();
      });
    });

  });
});
