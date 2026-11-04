import { z } from "zod";
import { completedYears, parseCalendarDate } from "@/lib/dates";

const MAX_PASSWORD_BYTES = 72;

export const accountSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Enter the student's full name")
    .max(150, "Use at most 150 characters"),
  dateOfBirth: z
    .string()
    .min(1, "Enter the date of birth")
    .refine(
      (value) => parseCalendarDate(value) !== null,
      "Enter a valid date of birth",
    )
    .refine((value) => {
      const years = completedYears(value);
      return years !== null && years >= 0 && years <= 120;
    }, "Enter a valid date of birth"),
  email: z
    .string()
    .trim()
    .min(1, "Enter an email address")
    .pipe(z.email("Enter a valid email address"))
    .transform((value) => value.toLowerCase()),
  mobileNumber: z.string().trim().min(1, "Enter a mobile number"),
  password: z
    .string()
    .min(8, "Use at least 8 characters")
    .regex(/[0-9]/, "Include at least one number")
    .refine(
      (value) => new TextEncoder().encode(value).length <= MAX_PASSWORD_BYTES,
      "Use at most 72 bytes",
    ),
});

export type AccountValues = z.infer<typeof accountSchema>;

export const GUARDIAN_RELATIONSHIPS = [
  { value: "father", label: "Father" },
  { value: "mother", label: "Mother" },
  { value: "legal_guardian", label: "Legal guardian" },
  { value: "grandparent", label: "Grandparent" },
  { value: "sibling", label: "Sibling" },
  { value: "other", label: "Other" },
] as const;

export type GuardianRelationship =
  (typeof GUARDIAN_RELATIONSHIPS)[number]["value"];

export function relationshipLabel(value: GuardianRelationship): string {
  return GUARDIAN_RELATIONSHIPS.find((item) => item.value === value)?.label ?? value;
}

export const guardianSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Enter the guardian's full name")
    .max(150, "Use at most 150 characters"),
  relationship: z.enum(
    GUARDIAN_RELATIONSHIPS.map((item) => item.value) as [
      GuardianRelationship,
      ...GuardianRelationship[],
    ],
    { error: "Choose the relationship to the student" },
  ),
  mobileNumber: z.string().trim().min(1, "Enter the guardian's mobile number"),
  email: z
    .string()
    .trim()
    .min(1, "Enter the guardian's email address")
    .pipe(z.email("Enter a valid email address"))
    .transform((value) => value.toLowerCase()),
  notifyReports: z.boolean(),
});

export type GuardianValues = z.infer<typeof guardianSchema>;
