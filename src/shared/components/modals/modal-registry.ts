import type { FC } from "react";
import { SettingsDialog } from "@/features/settings/components/settings-dialog";
import { ExportChatModal } from "@/features/chat/components/modals/export-chat-modal";
import { KeyboardShortcutsModal } from "@/features/chat/components/modals/keyboard-shortcuts-modal";

export interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  [key: string]: unknown;
}

export const MODAL_REGISTRY: Record<string, FC<ModalProps>> = {
  settings: SettingsDialog,
  export: ExportChatModal,
  shortcuts: KeyboardShortcutsModal,
};

export type ModalType = keyof typeof MODAL_REGISTRY;
