import { describe, expect, it } from "vitest";
import { getLandingData } from "@/features/landing/data";
import { categories, footerColumns, journeySteps, loginOptions } from "@/features/landing/content";

describe("landing page content", () => {
  it("shows no sample data until the backend provides it", async () => {
    expect(await getLandingData()).toEqual({ resourceCounts: {}, tutors: [], stats: [] });
  });

  it("offers the student and faculty logins from the design", () => {
    expect(loginOptions.map((option) => option.label)).toEqual(["Student login", "Faculty login"]);
    expect(loginOptions[0].href).toBe("/login");
  });

  it("matches the four categories and four journey steps in the frame", () => {
    expect(categories.map((category) => category.title)).toEqual(["School", "University", "JEE / NEET", "Skill Learning"]);
    expect(journeySteps).toHaveLength(4);
  });

  it("links every footer entry", () => {
    for (const column of footerColumns) for (const [, href] of column.links) expect(href).toMatch(/^(\/|https?:)/);
  });
});
