/**
 * The Night Shift journey: footage scenes in running order.
 * Frame counts come from footage.json, which the conversion script rewrites.
 */

import footage from "./footage.json";
import type { SceneConfig, SequenceConfig } from "@/lib/sequence/types";

type ShotId = "c1" | "c2" | "c3" | "c4";

function shot(id: ShotId): SequenceConfig {
  const counts = footage[id];
  return {
    desktop: { basePath: `/media/night/${id}/desktop`, pattern: "f_{####}.webp", frameCount: counts.desktop },
    mobile: { basePath: `/media/night/${id}/mobile`, pattern: "f_{####}.webp", frameCount: counts.mobile },
    poster: `/media/night/${id}/poster-desktop.webp`,
    mobilePoster: `/media/night/${id}/poster-mobile.webp`,
    still: `/media/night/${id}/still.webp`,
  };
}

export const seaScene: SceneConfig = {
  id: "sea",
  sequence: shot("c1"),
  scrollLengthVh: 2.4,
  ariaLabel: "Night over the Mactan channel: boat lights on dark water, the city glowing on the far shore.",
  overlays: [
    { id: "title", at: 0, until: 0.38, align: "center" },
    { id: "line", at: 0.55, until: 0.9, align: "bottom" },
  ],
};

export const approachScene: SceneConfig = {
  id: "approach",
  sequence: shot("c2"),
  scrollLengthVh: 1.8,
  chained: true,
  ariaLabel: "Gliding over sleeping rooftops toward the one window still lit.",
  overlays: [{ id: "proof", at: 0.25, until: 0.82, align: "center" }],
};

export const windowScene: SceneConfig = {
  id: "window",
  sequence: shot("c3"),
  scrollLengthVh: 1.6,
  chained: true,
  ariaLabel: "Through the rain-streaked window into a dark workspace with a wall of monitors.",
  overlays: [{ id: "inside", at: 0.78, align: "top" }],
};

export const dawnScene: SceneConfig = {
  id: "dawn",
  sequence: shot("c4"),
  scrollLengthVh: 1.6,
  ariaLabel: "Pulling back out of the window at dawn, over the rooftops and the sea at sunrise.",
  overlays: [{ id: "contact", at: 0.55, align: "center" }],
};
