import { useEffect } from "react";

export function useInputKeyboardShortcuts(onMicToggle: () => void): void {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey && event.key === "m") {
        event.preventDefault();
        onMicToggle();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onMicToggle]);
}
