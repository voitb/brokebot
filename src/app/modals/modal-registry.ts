import type { FC } from "react";
import { SettingsDialog } from "@/features/settings/components/settings-dialog";
import { KeyboardShortcutsDialog } from "@/features/chat/components/modals/keyboard-shortcuts-dialog";

export interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  [key: string]: unknown;
}

export const MODAL_REGISTRY: Record<string, FC<ModalProps>> = {
  settings: SettingsDialog,
  shortcuts: KeyboardShortcutsDialog,
};

export type ModalType = keyof typeof MODAL_REGISTRY;

const VALID_MODAL_TYPES = Object.keys(MODAL_REGISTRY) as ModalType[];

export function isValidModalType(value: string | null): value is ModalType {
  return value !== null && VALID_MODAL_TYPES.includes(value as ModalType);
}
