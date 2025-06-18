import { useState, useEffect, useCallback } from "react";

const ONBOARDING_COMPLETED_KEY = "onboardingCompleted-v1";

export const useOnboarding = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const hasCompleted = localStorage.getItem(ONBOARDING_COMPLETED_KEY);
    if (!hasCompleted) {
      setShowOnboarding(true);
    }
  }, []);

  const completeOnboarding = useCallback(() => {
    localStorage.setItem(ONBOARDING_COMPLETED_KEY, "true");
    setShowOnboarding(false);
  }, []);

  return {
    showOnboarding,
    completeOnboarding,
  };
}; 