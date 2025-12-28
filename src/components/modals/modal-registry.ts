import type { FC } from "react";
import { SettingsDialog } from "@/components/dialogs/settings/settings-dialog";
import { ExportChatModal } from "@/components/chat/modals/export-chat-modal";
import { KeyboardShortcutsModal } from "@/components/chat/modals/keyboard-shortcuts-modal";

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
