import { useState, useRef, useEffect, useCallback, type DependencyList } from "react";

export function useSmartAutoScroll<T extends HTMLElement = HTMLDivElement>(
  dependencies: DependencyList = []
) {
  const scrollAreaRef = useRef<T>(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const scrollToBottom = useCallback((instant = false) => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: instant ? "instant" : "smooth",
      });
    }
  }, []);

  // Effect to scroll to bottom when new messages arrive, if not interrupted by user
  useEffect(() => {
    if (!isUserScrolling) {
      scrollToBottom();
    }
  }, [isUserScrolling, scrollToBottom, ...dependencies]);

  // Effect to detect user scroll and interruptions
  useEffect(() => {
    const element = scrollAreaRef.current;
    if (!element) return;

    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      clearTimeout(scrollTimeout);

      const { scrollTop, scrollHeight, clientHeight } = element;
      const isNowAtBottom = scrollHeight - scrollTop - clientHeight < 5; // Small tolerance

      if (!isAtBottom && isNowAtBottom) {
        // User scrolled back to the bottom
        setIsUserScrolling(false);
      }
      
      setIsAtBottom(isNowAtBottom);
      
      scrollTimeout = setTimeout(() => {
        // This part is tricky. We don't want to immediately set isUserScrolling to true on any scroll.
        // We only care if the user scrolls UP.
      }, 100);
    };

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY < 0) {
        // User is scrolling up
        setIsUserScrolling(true);
      }
    };
    
    element.addEventListener("scroll", handleScroll, { passive: true });
    element.addEventListener("wheel", handleWheel, { passive: true });
    
    // Initial check
    handleScroll();

    return () => {
      clearTimeout(scrollTimeout);
      element.removeEventListener("scroll", handleScroll);
      element.removeEventListener("wheel", handleWheel);
    };
  }, [isAtBottom]);

  const handleScrollToBottomClick = () => {
    setIsUserScrolling(false);
    scrollToBottom();
  };
  
  return {
    scrollAreaRef,
    isAtBottom,
    isUserScrolling,
    handleScrollToBottomClick,
  };
} 