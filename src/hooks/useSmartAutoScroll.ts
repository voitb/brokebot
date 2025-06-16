import { useState, useRef, useEffect, useCallback, type DependencyList } from "react";

const BUTTON_VISIBILITY_OFFSET = 100; // Show button if scrolled > 100px from bottom
const AUTOSCROLL_LOCK_OFFSET = 10;   // Lock autoscroll if user scrolls up just a bit

export function useSmartAutoScroll<T extends HTMLElement = HTMLDivElement>(
  dependencies: DependencyList = []
) {
  const scrollAreaRef = useRef<T>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
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

    let lastScrollTop = viewport.scrollTop;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = viewport;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      
      const isAtBottomForAutoScroll = distanceFromBottom < AUTOSCROLL_LOCK_OFFSET;
      
      if (scrollTop < lastScrollTop && !isAtBottomForAutoScroll) {
        userHasScrolledUp.current = true;
      }
      
      if (isAtBottomForAutoScroll) {
        userHasScrolledUp.current = false;
      }
      
      setShowScrollButton(distanceFromBottom > BUTTON_VISIBILITY_OFFSET);
      
      lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    };

    viewport.addEventListener("scroll", handleScroll, { passive: true });

    const observer = new MutationObserver(() => {
      handleScroll();
    });

    observer.observe(viewport, {
      childList: true,
      subtree: true,
    });

    handleScroll();

    return () => {
      viewport.removeEventListener("scroll", handleScroll);
      observer.disconnect();
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
    showScrollButton,
    handleScrollToBottomClick,
  };
} 