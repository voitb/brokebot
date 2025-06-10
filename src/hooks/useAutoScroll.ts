import { useCallback, useEffect, useRef } from "react";

export const useAutoScroll = (
  scrollAreaRef: React.RefObject<HTMLDivElement | null>,
  shouldAutoScroll: boolean,
  dependencies: any[]
) => {
  const isInitialLoadRef = useRef(true);

  const scrollToBottom = useCallback((smooth = true) => {
    if (scrollAreaRef?.current) {
      const viewport = scrollAreaRef?.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      ) as HTMLElement;
      if (viewport) {
        if (smooth) {
          viewport.scrollTo({
            top: viewport.scrollHeight,
            behavior: "smooth",
          });
        } else {
          viewport.scrollTop = viewport.scrollHeight;
        }
      }
    }
  }, [scrollAreaRef]);

  useEffect(() => {
    if (shouldAutoScroll) {
      // Pierwszym razem scrolluj bez animacji
      const smooth = !isInitialLoadRef.current;
      setTimeout(() => scrollToBottom(smooth), 0);
      
      if (isInitialLoadRef.current) {
        isInitialLoadRef.current = false;
      }
    }
  }, [...dependencies, shouldAutoScroll]);

  // Reset przy zmianie konwersacji
  const resetInitialLoad = useCallback(() => {
    isInitialLoadRef.current = true;
  }, []);

  return { scrollToBottom, resetInitialLoad };
};