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
    categoryId: string;
    boardId: string | null;
    levelId: string | null;
    teachingLanguageId: string;
    curriculumIds: string[];
  };
  guardian?: {
    fullName: string;
    relationship: string;
    mobileNumber: string;
    email: string;
    receivesReportsAndReceipts: boolean;
  };
  consentToken?: string;
  acceptedPolicyIds: string[];
}

export const registerStudent = (body: RegisterRequest) =>
  api<{ userId: string }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  }).then((response) => response.data);
