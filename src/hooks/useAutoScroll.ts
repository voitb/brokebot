import { useCallback, useEffect, useRef } from "react";

export const useAutoScroll = (
  scrollAreaRef: React.RefObject<HTMLDivElement | null>,
  shouldAutoScroll: boolean,
  dependencies: unknown[]
) => {
  const isInitialLoadRef = useRef(true);
  const previousDepsRef = useRef<unknown[]>([]);

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
    // Sprawdź czy zmieniły się dependencies (nowe wiadomości lub zmiany w treści)
    const depsChanged = dependencies.some((dep, index) => 
      dep !== previousDepsRef.current[index]
    ) || dependencies.length !== previousDepsRef.current.length;
    
    if (depsChanged) {
      previousDepsRef.current = [...dependencies];
      
      // Jeśli auto-scroll jest włączony lub to pierwsze ładowanie
      if (shouldAutoScroll || isInitialLoadRef.current) {
        // Pierwszym razem scrolluj bez animacji, potem z animacją
        const smooth = !isInitialLoadRef.current;
        setTimeout(() => scrollToBottom(smooth), 0);
        
        if (isInitialLoadRef.current) {
          isInitialLoadRef.current = false;
        }
      }
    }
  }, [dependencies, shouldAutoScroll, scrollToBottom]);

  // Reset przy zmianie konwersacji
  const resetInitialLoad = useCallback(() => {
    isInitialLoadRef.current = true;
  }, []);

  return { scrollToBottom, resetInitialLoad };
};