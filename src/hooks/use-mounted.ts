import { useRef, useEffect } from "react";

/**
 * Returns a ref that tracks whether the component is still mounted.
 * Use this to guard setState calls in async operations to prevent
 * "Can't perform a React state update on an unmounted component" warnings.
 *
 * @example
 * const mountedRef = useMounted();
 *
 * const handleAsync = async () => {
 *   const result = await fetchData();
 *   if (mountedRef.current) {
 *     setState(result);
 *   }
 * };
 */
export function useMounted(): React.RefObject<boolean> {
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return mountedRef;
}
