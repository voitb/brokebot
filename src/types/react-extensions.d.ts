// Workaround for @types/react@19.2.x TypeScript bug
// useEffectEvent is exported inside the namespace with 'export' keyword,
// which doesn't make it available as a named import.
// This declaration augments the module to add the named export.
// See: https://react.dev/reference/react/useEffectEvent

import "react";

declare module "react" {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  function useEffectEvent<T extends Function>(callback: T): T;
}
