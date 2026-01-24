import { useState } from "react";

const ONBOARDING_COMPLETED_KEY = "onboardingCompleted-v1";

export interface UseOnboardingReturn {
  showOnboarding: boolean;
  completeOnboarding: () => void;
}

export function useOnboarding(): UseOnboardingReturn {
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem(ONBOARDING_COMPLETED_KEY);
  });

  const completeOnboarding = () => {
    localStorage.setItem(ONBOARDING_COMPLETED_KEY, "true");
    setShowOnboarding(false);
  };

  return {
    showOnboarding,
    completeOnboarding,
  };
} 