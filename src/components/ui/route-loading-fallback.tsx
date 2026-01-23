import { LoadingDots } from "./loading-dots";

export function RouteLoadingFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <LoadingDots size="lg" color="muted" />
    </div>
  );
}
