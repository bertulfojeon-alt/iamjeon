import { useEffect, useLayoutEffect } from "react";

/**
 * useLayoutEffect warns during SSR because it can't run on the server. GSAP
 * setup must run synchronously after layout, so we use the layout effect in the
 * browser and fall back to useEffect on the server to silence the warning.
 */
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
