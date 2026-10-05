"use client";

import { useContext } from "react";
import { CinematicContext } from "@/features/cinematic-engine/cinematic-context";

/** Access the shared engine state: Lenis, viewing mode, motion and sound toggles. */
export function useCinematic() {
  return useContext(CinematicContext);
}
