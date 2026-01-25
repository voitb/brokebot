import { useState, useRef, useEffect, useLayoutEffect, type RefObject } from "react";

const BUTTON_VISIBILITY_OFFSET = 100;
const AUTOSCROLL_LOCK_OFFSET = 10;

export interface UseSmartAutoScrollOptions {
  messageCount: number;
  isGenerating: boolean;
  conversationId: string | null | undefined;
}

export interface UseSmartAutoScrollReturn<T extends HTMLElement> {
  scrollAreaRef: RefObject<T | null>;
  showScrollButton: boolean;
  handleScrollToBottomClick: () => void;
}

export function useSmartAutoScroll<T extends HTMLElement = HTMLDivElement>(
  options: UseSmartAutoScrollOptions
): UseSmartAutoScrollReturn<T> {
  const { messageCount, isGenerating, conversationId } = options;
  const scrollAreaRef = useRef<T>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const userHasScrolledUp = useRef(false);
  const isInitialRender = useRef(true);
  const scrollToBottomRef = useRef<(behavior?: "smooth" | "auto") => void>(
    () => {}
  );

  const getViewport = () => {
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea) return null;
    return scrollArea.querySelector(
      "[data-radix-scroll-area-viewport]"
    ) as HTMLElement ?? scrollArea;
  };

  scrollToBottomRef.current = (behavior: "smooth" | "auto" = "smooth") => {
    const viewport = getViewport();
    if (viewport) {
      viewport.scrollTo({ top: viewport.scrollHeight, behavior });
    }
  };

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
  }, []);

  useLayoutEffect(() => {
    if (isInitialRender.current) {
      scrollToBottomRef.current("auto");
      isInitialRender.current = false;
    }
  }, [conversationId]);

  useEffect(() => {
    if (!isInitialRender.current && !userHasScrolledUp.current) {
      scrollToBottomRef.current("smooth");
    }
  }, [messageCount, isGenerating]);

  const handleScrollToBottomClick = () => {
    userHasScrolledUp.current = false;
    scrollToBottomRef.current("smooth");
  };

  return {
    scrollAreaRef,
    showScrollButton,
    handleScrollToBottomClick,
  };
} 