import { api } from "@/lib/api/client";

export interface Challenge {
  challengeId: string;
  expiresAt: string;
  resendAfter: string;
}

export interface PolicyView {
  id: string;
  type:
    "terms_of_use" | "privacy_policy" | "child_safety_policy" | "student_terms";
  country: string;
  version: string;
  title: string;
  effectiveAt: string;
  sha256: string;
}

export interface ConsentReceipt {
  consentToken: string;
  policyId: string;
  signedAt: string;
  expiresAt: string;
  signedPdfSha256: string;
}

export const requestEmailCode = (email: string) =>
  api<Challenge>("/auth/registration/email-otp/requests", {
    method: "POST",
    body: JSON.stringify({ email }),
  }).then((response) => response.data);

export const verifyEmailCode = (challengeId: string, otp: string) =>
  api<{ emailVerificationToken: string; expiresAt: string }>(
    "/auth/registration/email-otp/verify",
    {
      method: "POST",
      body: JSON.stringify({ challengeId, otp }),
    },
  ).then((response) => response.data);

export interface ReferralSource {
  code: string;
  name: string;
}

export const fetchReferralSources = () =>
  api<ReferralSource[]>("/auth/registration/referral-sources").then(
    (response) => response.data,
  );

/** The optional "how did you find us" answer: a source code, plus the student's words for Other. */
export interface ReferralAnswer {
  sourceCode: string;
  other?: string;
}

export type EducationLevel =
  "school" | "undergraduate" | "postgraduate" | "working" | "other";

export const EDUCATION_LEVELS: { value: EducationLevel; label: string }[] = [
  { value: "school", label: "School" },
  { value: "undergraduate", label: "Undergraduate" },
  { value: "postgraduate", label: "Postgraduate" },
  { value: "working", label: "Working professional" },
  { value: "other", label: "Other" },
];

/** What the education card holds while it is filled in; blanks are left out of the request. */
export interface EducationDraft {
  level: EducationLevel | "";
  institutionName: string;
  detail: string;
}

export const EMPTY_EDUCATION: EducationDraft = {
  level: "",
  institutionName: "",
  detail: "",
};

/** The request body's education, or undefined when nothing was filled in. */
export function educationAnswer(draft: EducationDraft | undefined) {
  if (!draft) return undefined;
  const institutionName = draft.institutionName.trim();
  const detail = draft.detail.trim();
  const answer = {
    ...(draft.level && { level: draft.level }),
    ...(institutionName && { institutionName }),
    ...(detail && { detail }),
  };
  return Object.keys(answer).length ? answer : undefined;
}

/** The request body's referral, or undefined when none was picked; Other's text is trimmed and dropped if blank. */
export function referralAnswer(answer: ReferralAnswer | null) {
  if (!answer) return undefined;
  const other = answer.sourceCode === "other" ? answer.other?.trim() : "";
  return { sourceCode: answer.sourceCode, ...(other && { other }) };
}

export const fetchPolicies = (country: string) =>
  api<PolicyView[]>(
    `/policies/current?country=${encodeURIComponent(country)}`,
  ).then((response) => response.data);

export const policyFileUrl = (policyId: string): string =>
  `/api/v1/policies/${policyId}/file`;

export function signConsent(input: {
  policyId: string;
  studentFullName: string;
  studentDateOfBirth: string;
  signature: Blob;
}): Promise<ConsentReceipt> {
  const form = new FormData();
  form.set("policyId", input.policyId);
  form.set("studentFullName", input.studentFullName);
  form.set("studentDateOfBirth", input.studentDateOfBirth);
  form.set("signatureMode", "draw");
  form.set("signature", input.signature, "signature.png");
  return api<ConsentReceipt>("/consent/guardian-signatures", {
    method: "POST",
    body: form,
  }).then((response) => response.data);
}

export interface RegisterRequest {
  emailVerificationToken: string;
  fullName: string;
  dateOfBirth: string;
  mobileNumber: string;
  password: string;
  timezone: string;
  learningProfile: {
    /** Everything the student wants to learn, from any branch of the tree */
    curriculumIds: string[];
  };
  guardian?: {
    fullName: string;
    relationship: string;
    mobileNumber: string;
    email: string;
    receivesReportsAndReceipts: boolean;
  };
  referral?: { sourceCode: string; other?: string };
  education?: {
    level?: EducationLevel;
    institutionName?: string;
    detail?: string;
  };
  consentToken?: string;
  acceptedPolicyIds: string[];
}

export const registerStudent = (body: RegisterRequest) =>
  api<{ userId: string }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  }).then((response) => response.data);
