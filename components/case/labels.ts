import type { Project } from "@/content/schema";

export const STATUS_LABEL: Record<Project["status"], string> = {
  live: "Live",
  "pre-release": "Pre-release",
  built: "Built, demo on request",
  "in-development": "In development",
  "r-and-d": "R&D",
  local: "Runs locally",
};
