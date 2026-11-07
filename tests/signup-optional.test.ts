import { describe, expect, it } from "vitest";
import {
  EMPTY_EDUCATION,
  educationAnswer,
  referralAnswer,
} from "../src/features/signup/api";

describe("optional onboarding answers", () => {
  it("sends no education when nothing is filled in", () => {
    expect(educationAnswer(undefined)).toBeUndefined();
    expect(educationAnswer(EMPTY_EDUCATION)).toBeUndefined();
    expect(
      educationAnswer({ level: "", institutionName: "  ", detail: "" }),
    ).toBeUndefined();
  });

  it("sends only the education fields that were filled, trimmed", () => {
    expect(
      educationAnswer({
        level: "school",
        institutionName: " Govt HSS Kochi ",
        detail: "",
      }),
    ).toEqual({ level: "school", institutionName: "Govt HSS Kochi" });
    expect(
      educationAnswer({ level: "", institutionName: "", detail: "B.Tech CSE" }),
    ).toEqual({ detail: "B.Tech CSE" });
  });

  it("sends no referral until a source is picked", () => {
    expect(referralAnswer(null)).toBeUndefined();
    expect(referralAnswer({ sourceCode: "instagram" })).toEqual({
      sourceCode: "instagram",
    });
  });

  it("keeps the student's own words only for Other, and drops them when blank", () => {
    expect(
      referralAnswer({ sourceCode: "other", other: " a poster " }),
    ).toEqual({ sourceCode: "other", other: "a poster" });
    expect(referralAnswer({ sourceCode: "other", other: "   " })).toEqual({
      sourceCode: "other",
    });
    expect(referralAnswer({ sourceCode: "instagram", other: "stale" })).toEqual(
      { sourceCode: "instagram" },
    );
  });
});
