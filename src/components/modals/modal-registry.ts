import type { FC } from "react";
import { SettingsDialog } from "@/components/dialogs/settings";
import { ShareChatModal } from "@/components/chat/modals/ShareChatModal";
import { KeyboardShortcutsModal } from "@/components/chat/modals/KeyboardShortcutsModal";

// It would be better to have a generic modal props interface
export interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Modals can have other props, so we allow for that
  [key: string]: any;
}

export const MODAL_REGISTRY: Record<string, FC<ModalProps>> = {
  settings: SettingsDialog,
  share: ShareChatModal,
  shortcuts: KeyboardShortcutsModal,
};

export type ModalType = keyof typeof MODAL_REGISTRY; 