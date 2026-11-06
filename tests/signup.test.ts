import { describe, expect, it } from "vitest";
import {
  completedYears,
  formatDisplayDate,
  maskDisplayDate,
  parseCalendarDate,
  parseDisplayDate,
} from "@/lib/dates";
import {
  addGroup,
  allCurriculumIds,
  groupPath,
  groupTitle,
  isGroupComplete,
  type LearningGroup,
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

describe("learning list", () => {
  const leaf = { requiresBoard: true, requiresLevel: true };
  const pick = { id: "x", name: "X" };

  it("needs the board and class the leaf asks for, and a subject", () => {
    const base = { leaf, board: pick, level: pick, subjects: [pick] };
    expect(isGroupComplete(base)).toBe(true);
    expect(isGroupComplete({ ...base, board: null })).toBe(false);
    expect(isGroupComplete({ ...base, level: null })).toBe(false);
    expect(isGroupComplete({ ...base, subjects: [] })).toBe(false);
    expect(isGroupComplete({ ...base, leaf: null })).toBe(false);
  });

  it("does not ask for a board or class the leaf does not use", () => {
    expect(
      isGroupComplete({
        leaf: { requiresBoard: false, requiresLevel: false },
        board: null,
        level: null,
        subjects: [pick],
      }),
    ).toBe(true);
  });

  const category = (id: string, name: string, isLeaf: boolean) => ({
    id,
    code: id,
    name,
    isLeaf,
  });
  const group = (over: Partial<LearningGroup> = {}): LearningGroup => ({
    trail: [
      category("academic", "Academic", false),
      category("school", "School", false),
      category("k12", "K-12", true),
    ],
    board: { id: "cbse", name: "CBSE" },
    level: { id: "c9", name: "Class 9" },
    subjects: [{ id: "phy", name: "Physics" }],
    curriculumIds: ["cur-phy"],
    ...over,
  });
  const guitar = group({
    trail: [
      category("non-academic", "Non-academic", false),
      category("music", "Music", false),
      category("guitar", "Guitar", true),
    ],
    board: null,
    level: null,
    subjects: [{ id: "acoustic", name: "Acoustic guitar" }],
    curriculumIds: ["cur-guitar"],
  });

  it("titles a group by class and board, or just the leaf, with where it sits above", () => {
    expect(groupTitle(group())).toBe("K-12 · Class 9 · CBSE");
    expect(groupPath(group())).toBe("Academic › School");
    expect(groupTitle(guitar)).toBe("Guitar");
    expect(groupPath(guitar)).toBe("Non-academic › Music");
  });

  it("keeps academic and non-academic groups side by side", () => {
    const jee = group({
      trail: [
        category("academic", "Academic", false),
        category("jee", "JEE / NEET", true),
      ],
      board: null,
      level: { id: "jee-main", name: "JEE Main" },
      subjects: [{ id: "phy", name: "Physics" }],
      curriculumIds: ["cur-jee-phy"],
    });
    const list = [group(), jee, guitar].reduce(
      (all, g) => addGroup(all, g),
      [] as LearningGroup[],
    );
    expect(list).toHaveLength(3);
    expect(allCurriculumIds({ groups: list })).toEqual([
      "cur-phy",
      "cur-jee-phy",
      "cur-guitar",
    ]);
  });

  it("joins a repeat of the same leaf, board and class instead of listing it twice", () => {
    const more = group({
      subjects: [
        { id: "phy", name: "Physics" },
        { id: "chem", name: "Chemistry" },
      ],
      curriculumIds: ["cur-phy", "cur-chem"],
    });
    const list = addGroup([group()], more);
    expect(list).toHaveLength(1);
    expect(list[0]?.subjects.map((s) => s.name)).toEqual([
      "Physics",
      "Chemistry",
    ]);
    expect(list[0]?.curriculumIds).toEqual(["cur-phy", "cur-chem"]);
  });
});
