import { useSyncExternalStore } from "react";

const controllers = new Map<string, AbortController>();
const listeners = new Set<() => void>();

function notify(): void {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function startGeneration(conversationId: string, controller: AbortController): void {
  controllers.get(conversationId)?.abort();
  controllers.set(conversationId, controller);
  notify();
}

export function endGeneration(conversationId: string, controller: AbortController): void {
  if (controllers.get(conversationId) !== controller) return;
  controllers.delete(conversationId);
  notify();
}

export function abortGeneration(conversationId: string): boolean {
  const controller = controllers.get(conversationId);
  if (!controller) return false;

  // the local engine serialises generations, so the oldest running one is the one it is decoding
  const holdsSharedEngine = controllers.keys().next().value === conversationId;
  controller.abort();
  return holdsSharedEngine;
}

export function useHasOtherGeneration(conversationId: string | undefined): boolean {
  return useSyncExternalStore(subscribe, () => {
    for (const id of controllers.keys()) {
      if (id !== conversationId) return true;
    }
    return false;
  });
}

// one local engine serialises generations, so a second request would silently queue behind it
export function useIsWaitingForSharedEngine(
  conversationId: string | undefined,
  isLocalModel: boolean
): boolean {
  const hasOtherGeneration = useHasOtherGeneration(conversationId);
  return isLocalModel && hasOtherGeneration;
}

export function useIsGenerating(conversationId: string | undefined): boolean {
  return useSyncExternalStore(subscribe, () =>
    conversationId !== undefined && controllers.has(conversationId)
  );
}
