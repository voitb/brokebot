import { useState, useEffect } from "react";

interface UseSlowGenerationWarningProps {
  isGenerating: boolean;
  warningDelayMs?: number;
}

interface UseSlowGenerationWarningReturn {
  showSlowWarning: boolean;
}

/**
 * Custom hook for showing warning when AI generation takes too long
 */
export const useSlowGenerationWarning = ({
  isGenerating,
  warningDelayMs = 15000,
}: UseSlowGenerationWarningProps): UseSlowGenerationWarningReturn => {
  const [showSlowWarning, setShowSlowWarning] = useState(false);

  useEffect(() => {
    if (isGenerating) {
      const timer = setTimeout(() => {
        setShowSlowWarning(true);
      }, warningDelayMs);

      return () => {
        clearTimeout(timer);
        setShowSlowWarning(false);
      };
    } else {
      setShowSlowWarning(false);
    }
  }, [isGenerating, warningDelayMs]);

  return {
    showSlowWarning,
  };
}; 