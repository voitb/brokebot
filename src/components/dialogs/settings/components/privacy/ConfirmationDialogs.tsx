import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../../ui/alert-dialog";

interface ClearAllDataDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ClearAllDataDialog: React.FC<ClearAllDataDialogProps> = ({
  open,
  onConfirm,
  onCancel,
}) => {
  return (
    <AlertDialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Clear All Data</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete ALL conversations and reset all
            settings? This action cannot be undone and will permanently remove
            all your data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Clear All Data
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

interface ResetSettingsDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ResetSettingsDialog: React.FC<ResetSettingsDialogProps> = ({
  open,
  onConfirm,
  onCancel,
}) => {
  return (
    <AlertDialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reset Settings</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to reset all settings to defaults? This will
            not affect your conversations, only your app settings.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Reset Settings
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
