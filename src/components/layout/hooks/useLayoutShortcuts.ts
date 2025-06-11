import { useKeyboardShortcuts as useAppKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useSidebar } from "../../ui/sidebar";

export const useLayoutShortcuts = () => {
  const { open, setOpen } = useSidebar();

  useAppKeyboardShortcuts({
    onToggleSidebar: () => setOpen(!open),
    onNewChat: () => {
      // This is a bit of a hack, a more robust routing solution should be used
      window.location.href = "/chat";
    },
    onSearch: () => {
      const searchInput = document.querySelector(
        'input[placeholder="Search conversations..."]'
      ) as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
    },
    onRenameChat: () => {
      // This is also a hack, a better event system should be in place
      document.dispatchEvent(new CustomEvent("conversation:rename"));
    },
  });
}; 