import { describe, expect, it } from "vitest";
import { loginSchema } from "@/features/auth/schemas/auth";
import { safeRedirect } from "@/lib/auth/access";

describe("student login", () => {
  it("normalises the email and defaults keep-me-signed-in to off", () => {
    const parsed = loginSchema.parse({ email: "Aarav.Shah@Gmail.com", password: "x" });
    expect(parsed).toEqual({ email: "aarav.shah@gmail.com", password: "x", rememberMe: false });
  });

  it("requires a password and a valid email", () => {
    expect(loginSchema.safeParse({ email: "nope", password: "" }).success).toBe(false);
  });

  it("only redirects to paths inside the app", () => {
    expect(safeRedirect("/library")).toBe("/library");
    expect(safeRedirect("//evil.example")).toBe("/");
    expect(safeRedirect("https://evil.example")).toBe("/");
    expect(safeRedirect("/a\\b")).toBe("/");
    expect(safeRedirect(null)).toBe("/");
  });
});
