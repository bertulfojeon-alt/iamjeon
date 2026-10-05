/**
 * Central GSAP setup. Importing from here (instead of "gsap" directly)
 * guarantees ScrollTrigger is registered exactly once and gives us a single
 * place to configure global animation defaults.
 */

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Registration is a no-op on the server; guard so it only runs in the browser.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);

  // lagSmoothing(0) hands frame timing entirely to our Lenis-driven ticker, so
  // scrub stays locked to scroll position even after a stutter.
  gsap.ticker.lagSmoothing(0);
}

export { gsap, ScrollTrigger };
