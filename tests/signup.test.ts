import { describe, expect, it } from "vitest";
import {
  completedYears,
  formatDisplayDate,
  maskDisplayDate,
  parseCalendarDate,
  parseDisplayDate,
} from "@/lib/dates";
import {
  isLearningComplete,
  profileSummary,
  type LearningDraft,
} from "@/features/signup/catalogue";
import { countryOfMobile, normalizeMobile, type Country } from "@/lib/regions";
import {
  GUARDIAN_RELATIONSHIPS,
  accountSchema,
  guardianSchema,
  relationshipLabel,
} from "@/features/signup/schema";

const countries: Country[] = [
  {
    code: "IN",
    name: "India",
    dialCode: "+91",
    defaultTimezone: "Asia/Kolkata",
    guardianConsentAge: 18,
  },
  {
    code: "AE",
    name: "United Arab Emirates",
    dialCode: "+971",
    defaultTimezone: "Asia/Dubai",
    guardianConsentAge: 18,
  },
];

describe("dates", () => {
  it("masks typed digits as dd / mm / yyyy and reads them back", () => {
    expect(maskDisplayDate("12")).toBe("12");
    expect(maskDisplayDate("1204")).toBe("12 / 04");
    expect(maskDisplayDate("12-04-2010x")).toBe("12 / 04 / 2010");
    expect(parseDisplayDate("12 / 04 / 2010")).toBe("2010-04-12");
    expect(parseDisplayDate("12 / 04")).toBe("");
    expect(parseDisplayDate("31 / 02 / 2010")).toBe("");
    expect(formatDisplayDate("2010-04-12")).toBe("12 / 04 / 2010");
    expect(formatDisplayDate("nope")).toBe("");
  });

  it("only accepts real calendar days", () => {
    expect(parseCalendarDate("2024-02-29")).not.toBeNull();
    expect(parseCalendarDate("2025-02-29")).toBeNull();
  });

  it("counts whole years, turning a year older on the birthday", () => {
    const on = new Date(2026, 10, 3, 12);
    expect(completedYears("2008-11-04", on)).toBe(17);
    expect(completedYears("2008-11-03", on)).toBe(18);
    expect(completedYears("2008-11-02", on)).toBe(18);
    expect(completedYears("nope", on)).toBeNull();
  });
});

describe("mobile numbers and countries", () => {
  it("normalises spaces, dashes and a leading 00", () => {
    expect(normalizeMobile("+91 98450 12345")).toBe("+919845012345");
    expect(normalizeMobile("+971-50-123-4567")).toBe("+971501234567");
    expect(normalizeMobile("00971501234567")).toBe("+971501234567");
  });

  it("finds the served country from the dialling code, longest code first", () => {
    expect(countryOfMobile("+919845012345", countries)?.code).toBe("IN");
    expect(countryOfMobile("+971501234567", countries)?.code).toBe("AE");
    expect(countryOfMobile("+14155550123", countries)).toBeUndefined();
    expect(countryOfMobile("9845012345", countries)).toBeUndefined();
  });
});

describe("account schema", () => {
  const valid = {
    fullName: "  Ananya Sharma ",
    dateOfBirth: "2010-04-12",
    email: " Ananya.Sharma@Gmail.com ",
    mobileNumber: "+91 98450 12345",
    password: "secret-pass1",
  };

  it("accepts a complete account and normalises the name and email", () => {
    const parsed = accountSchema.parse(valid);
    expect(parsed.fullName).toBe("Ananya Sharma");
    expect(parsed.email).toBe("ananya.sharma@gmail.com");
  });

  it("explains what is wrong with each field", () => {
    const result = accountSchema.safeParse({
      fullName: "",
      dateOfBirth: "",
      email: "x",
      mobileNumber: "",
      password: "short",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const fields = result.error.issues.map((issue) => issue.path[0]);
      expect(fields).toEqual(
        expect.arrayContaining([
          "fullName",
          "dateOfBirth",
          "email",
          "mobileNumber",
          "password",
        ]),
      );
    }
  });

  it("applies the platform password rule", () => {
    expect(
      accountSchema.safeParse({ ...valid, password: "nonumbershere" }).success,
    ).toBe(false);
    expect(
      accountSchema.safeParse({ ...valid, password: "a1".repeat(37) }).success,
    ).toBe(false);
  });

  it("rejects a future date of birth", () => {
    const next = new Date();
    next.setFullYear(next.getFullYear() + 1);
    const iso = `${next.getFullYear()}-01-01`;
    expect(
      accountSchema.safeParse({ ...valid, dateOfBirth: iso }).success,
    ).toBe(false);
  });
});

describe("guardian contact", () => {
  const valid = {
    fullName: " Suresh Sharma ",
    relationship: "father",
    mobileNumber: "+91 98860 44120",
    email: "Suresh.Sharma@Outlook.com",
    notifyReports: true,
  };

  it("trims the name and lowercases the email", () => {
    const parsed = guardianSchema.parse(valid);
    expect(parsed.fullName).toBe("Suresh Sharma");
    expect(parsed.email).toBe("suresh.sharma@outlook.com");
  });

  it("asks for each missing field and rejects an unknown relationship", () => {
    const result = guardianSchema.safeParse({
      ...valid,
      fullName: "",
      relationship: "",
      email: "nope",
    });
    expect(result.success).toBe(false);
    const fields = result.success
      ? []
      : result.error.issues.map((issue) => issue.path[0]);
    expect(fields).toEqual(
      expect.arrayContaining(["fullName", "relationship", "email"]),
    );
  });

  it("names every relationship the backend accepts", () => {
    expect(GUARDIAN_RELATIONSHIPS.map((item) => item.value)).toEqual([
      "father",
      "mother",
      "legal_guardian",
      "grandparent",
      "sibling",
      "other",
    ]);
    expect(relationshipLabel("legal_guardian")).toBe("Legal guardian");
  });
});

describe("learning profile", () => {
  const leaf = { requiresBoard: true, requiresLevel: true };
  const pick = { id: "x", name: "X" };

  it("needs the board and class the leaf asks for, a subject and a language", () => {
    const base = {
      leaf,
      board: pick,
      level: pick,
      subjects: [pick],
      teachingLanguageId: "l",
    };
    expect(isLearningComplete(base)).toBe(true);
    expect(isLearningComplete({ ...base, board: null })).toBe(false);
    expect(isLearningComplete({ ...base, level: null })).toBe(false);
    expect(isLearningComplete({ ...base, subjects: [] })).toBe(false);
    expect(isLearningComplete({ ...base, teachingLanguageId: null })).toBe(
      false,
    );
    expect(isLearningComplete({ ...base, leaf: null })).toBe(false);
  });

  it("does not ask for a board or class the leaf does not use", () => {
    expect(
      isLearningComplete({
        leaf: { requiresBoard: false, requiresLevel: false },
        board: null,
        level: null,
        subjects: [pick],
        teachingLanguageId: "l",
      }),
    ).toBe(true);
  });

  it("summarises as class and board, or the category when there are neither", () => {
    const draft: LearningDraft = {
      trail: [{ id: "c", code: "k12", name: "K-12", isLeaf: true }],
      board: { id: "b", name: "CBSE" },
      level: { id: "l", name: "Class 10" },
      subjects: [],
      teachingLanguageId: "t",
      curriculumIds: [],
    };
    expect(profileSummary(draft)).toBe("Class 10 · CBSE");
    expect(profileSummary({ ...draft, board: null, level: null })).toBe("K-12");
  });
});
