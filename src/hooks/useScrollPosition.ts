import { useCallback, useState, useEffect, useRef } from "react";

export const useScrollPosition = (threshold = 5) => {
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback((event: Event) => {
    const viewport = event.target as HTMLElement;
    if (!viewport) return;

    const { scrollTop, scrollHeight, clientHeight } = viewport;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    
    // Jesteśmy na dole gdy odległość jest bardzo mała (threshold pikseli)
    const isAtBottom = distanceFromBottom <= threshold;
    
    setIsNearBottom(isAtBottom);
    
    // Auto-scroll włącza się tylko gdy jesteśmy dokładnie na dole
    // Jakiekolwiek przesunięcie do góry wyłącza auto-scroll
    setShouldAutoScroll(isAtBottom);
  }, [threshold]);

  useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]"
    ) as HTMLElement;

    if (viewport) {
      viewport.addEventListener("scroll", handleScroll);
      return () => viewport.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  return {
    scrollAreaRef,
    isNearBottom,
    shouldAutoScroll,
    setShouldAutoScroll,
  };
};