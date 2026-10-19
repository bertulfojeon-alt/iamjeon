import { describe, expect, it } from "vitest";
import { projects } from "./index";
import { SKILLS, skillMatches } from "./skills";

describe("skills", () => {
  it.each(SKILLS.map((s) => [s.label, s] as const))("%s matches at least two projects' stacks", (_label, s) => {
    expect(projects.filter((p) => skillMatches(s, p.stack)).length).toBeGreaterThanOrEqual(2);
  });
});
