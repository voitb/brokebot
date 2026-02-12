import type { FC } from "react";
import { SettingsDialog } from "@/features/settings/components/settings-dialog";
import { KeyboardShortcutsDialog } from "@/features/chat/components/modals/keyboard-shortcuts-dialog";

export interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MODAL_REGISTRY: Record<string, FC<ModalProps>> = {
  settings: SettingsDialog,
  shortcuts: KeyboardShortcutsDialog,
};
