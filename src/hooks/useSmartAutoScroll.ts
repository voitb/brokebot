import { useState, useRef, useEffect, useCallback, type DependencyList } from "react";

export function useSmartAutoScroll<T extends HTMLElement = HTMLDivElement>(
  dependencies: DependencyList = []
) {
  const scrollAreaRef = useRef<T>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const userHasScrolledUp = useRef(false);
  const isInitialRender = useRef(true);
  
  const getViewport = useCallback(() => {
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea) return null;
    return scrollArea.querySelector(
      "[data-radix-scroll-area-viewport]"
    ) as HTMLElement ?? scrollArea;
  }, []);

  const scrollToBottom = useCallback((behavior: "smooth" | "auto" = "smooth") => {
    const viewport = getViewport();
    if (viewport) {
      viewport.scrollTo({
        top: viewport.scrollHeight,
        behavior,
      });
    }
  }, [getViewport]);

  useEffect(() => {
    const viewport = getViewport();
    if (!viewport) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = viewport;
      const atBottom = scrollHeight - scrollTop - clientHeight < 10;
      setIsAtBottom(atBottom);

      if (atBottom) {
        userHasScrolledUp.current = false;
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY < 0) {
        const { scrollTop } = viewport;
        if (scrollTop > 0) {
          userHasScrolledUp.current = true;
        }
      }
    };

    viewport.addEventListener("scroll", handleScroll, { passive: true });
    viewport.addEventListener("wheel", handleWheel, { passive: true });

    handleScroll();

    return () => {
      viewport.removeEventListener("scroll", handleScroll);
      viewport.removeEventListener("wheel", handleWheel);
    };
  }, [getViewport]);

  useEffect(() => {
    if (isInitialRender.current) {
      setTimeout(() => scrollToBottom("auto"), 100);
      isInitialRender.current = false;
    } else {
      if (!userHasScrolledUp.current) {
        scrollToBottom("smooth");
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies]);

  const handleScrollToBottomClick = () => {
    userHasScrolledUp.current = false;
    scrollToBottom("smooth");
  };

  return {
    scrollAreaRef,
    isAtBottom,
    handleScrollToBottomClick,
  };
} 