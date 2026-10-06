import type { Project } from "@/content/schema";

export const STATUS_LABEL: Record<Project["status"], string> = {
  live: "Live",
  "pre-release": "Pre-release",
  built: "Built, demo on request",
  "in-development": "In development",
  "r-and-d": "R&D",
  local: "Runs locally",
};

/** The badge on an All work card. */
export const STATUS_SHORT: Record<Project["status"], string> = {
  live: "Live",
  "pre-release": "Pre-release",
  built: "Built",
  "in-development": "In development",
  "r-and-d": "R&D",
  local: "Runs locally",
};
