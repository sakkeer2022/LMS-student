"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthHead } from "@/components/auth/auth-controls";
import { Button } from "@/components/shadcn/button";
import { completedYears } from "@/lib/dates";
import { fetchCountries, type Country } from "@/lib/regions";
import {
  AccountStep,
  type AccountDraft,
  type AccountSubmission,
} from "./components/account-step";
import { ConsentDialog } from "./components/consent-dialog";
import { GuardianStep, type GuardianDetails } from "./components/guardian-step";
import { LearningStep } from "./components/learning-step";
import { ReviewStep } from "./components/review-step";
import { Stepper, type Step } from "./components/stepper";
import { VerifyEmailDialog } from "./components/verify-email-dialog";
import { registerStudent, type ConsentReceipt } from "./api";
import { ApiError } from "@/lib/api/contracts";
import type { LearningDraft } from "./catalogue";

const EMPTY: AccountDraft = {
  fullName: "",
  dateOfBirth: "",
  email: "",
  mobileNumber: "",
  password: "",
};

/**
 * The student registration, one page and four steps. This part covers step 1 (account), the email
 * verification popup and, for a student below the country's consent age, the guardian signature popup. The
 * email token and the consent token live only in memory here (never in a URL or storage), so a refresh starts
 * again. The later steps are added as their screens are confirmed.
 */
export function SignupFlow() {
  const [countries, setCountries] = useState<Country[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [step, setStep] = useState<Step>(1);
  const [draft, setDraft] = useState<AccountDraft>(EMPTY);
  const [submission, setSubmission] = useState<AccountSubmission | null>(null);
  const [emailToken, setEmailToken] = useState<string | null>(null);
  const [consent, setConsent] = useState<ConsentReceipt | null>(null);
  const [profile, setProfile] = useState<LearningDraft | null>(null);
  const [guardian, setGuardian] = useState<GuardianDetails | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const router = useRouter();
  const [dialog, setDialog] = useState<"verify" | "consent" | null>(null);

  function load(): void {
    setLoadError(false);
    fetchCountries()
      .then(setCountries)
      .catch(() => setLoadError(true));
  }
  useEffect(load, []);

  const age = submission ? completedYears(submission.dateOfBirth) : null;
  const needsConsent = Boolean(
    submission && age !== null && age < submission.country.guardianConsentAge,
  );
  const optional: Step[] = submission && !needsConsent ? [3] : [];

  function proceed(next: {
    token: string | null;
    receipt: ConsentReceipt | null;
    needsConsent: boolean;
  }): void {
    if (!next.token) setDialog("verify");
    else if (next.needsConsent && !next.receipt) setDialog("consent");
    else {
      setDialog(null);
      setStep(2);
    }
  }

  function submitAccount(values: AccountSubmission, raw: AccountDraft): void {
    const years = completedYears(values.dateOfBirth);
    const minor = years !== null && years < values.country.guardianConsentAge;
    // A changed date of birth or name needs a new signature: the consent is bound to both
    const sameStudent =
      submission?.fullName === values.fullName &&
      submission?.dateOfBirth === values.dateOfBirth;
    const receipt = sameStudent ? consent : null;
    const token = submission?.email === values.email ? emailToken : null;
    if (guardian?.email === values.email) setGuardian(null);
    if (!sameStudent) setConsent(null);
    if (submission?.email !== values.email) setEmailToken(null);
    setDraft(raw);
    setSubmission(values);
    proceed({ token, receipt, needsConsent: minor });
  }

  async function createAccount(acceptedPolicyIds: string[]): Promise<void> {
    const leaf = profile?.trail.at(-1);
    if (!submission || !emailToken || !profile || !leaf) return;
    setCreateError(null);
    try {
      await registerStudent({
        emailVerificationToken: emailToken,
        fullName: submission.fullName,
        dateOfBirth: submission.dateOfBirth,
        mobileNumber: submission.e164,
        password: submission.password,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        learningProfile: {
          categoryId: leaf.id,
          boardId: profile.board?.id ?? null,
          levelId: profile.level?.id ?? null,
          teachingLanguageId: profile.teachingLanguageId,
          curriculumIds: profile.curriculumIds,
        },
        ...(guardian && {
          guardian: {
            fullName: guardian.fullName,
            relationship: guardian.relationship,
            mobileNumber: guardian.e164,
            email: guardian.email,
            receivesReportsAndReceipts: guardian.notifyReports,
          },
        }),
        ...(needsConsent && consent && { consentToken: consent.consentToken }),
        acceptedPolicyIds,
      });
      router.push("/login");
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setCreateError(
          "This email already has an account. Sign in instead, or go back and use another email.",
        );
      } else if (error instanceof ApiError && error.status === 422) {
        // An expired email check cannot be retried: ask for the code again
        if (/verif/i.test(error.message)) setEmailToken(null);
        setCreateError(error.message);
      } else {
        setCreateError("We could not create the account. Please try again.");
      }
    }
  }

  if (loadError) {
    return (
      <div className="m-auto flex w-full max-w-[681px] flex-col gap-6">
        <AuthHead title="Create your student account" size="form" />
        <p className="text-sm text-error-foreground" role="alert">
          We could not load the registration form. Check your connection and try
          again.
        </p>
        <div>
          <Button onClick={load}>Try again</Button>
        </div>
      </div>
    );
  }
  if (!countries) {
    return (
      <div className="m-auto flex w-full max-w-[681px] flex-col gap-6" aria-busy="true">
        <p className="text-sm text-text-secondary">Loading…</p>
      </div>
    );
  }

  return (
    <div className="m-auto flex w-full max-w-[681px] flex-col gap-6">
      <Stepper current={step} optional={optional} />
      {step === 1 ? (
        <AccountStep
          draft={draft}
          countries={countries}
          emailVerified={Boolean(emailToken)}
          pending={dialog !== null}
          onSubmit={submitAccount}
        />
      ) : step === 2 ? (
        <LearningStep
          value={profile}
          onBack={() => setStep(1)}
          onSubmit={(draft) => {
            setProfile(draft);
            setStep(3);
          }}
        />
      ) : step === 3 && submission ? (
        <GuardianStep
          value={guardian}
          countries={countries}
          studentEmail={submission.email}
          required={needsConsent}
          onBack={() => setStep(2)}
          onSubmit={(details) => {
            setGuardian(details);
            setStep(4);
          }}
        />
      ) : submission ? (
        <ReviewStep
          country={submission.country.code}
          studentName={submission.fullName}
          profile={profile}
          guardian={guardian}
          minor={needsConsent}
          error={createError}
          onBack={() => setStep(3)}
          onCreate={createAccount}
        />
      ) : null}

      {submission && (
        <>
          <VerifyEmailDialog
            open={dialog === "verify"}
            email={submission.email}
            onClose={() => setDialog(null)}
            onVerified={(token) => {
              setEmailToken(token);
              proceed({ token, receipt: consent, needsConsent });
            }}
          />
          <ConsentDialog
            open={dialog === "consent"}
            country={submission.country.code}
            studentFullName={submission.fullName}
            studentDateOfBirth={submission.dateOfBirth}
            onClose={() => setDialog(null)}
            onSigned={(receipt) => {
              setConsent(receipt);
              proceed({ token: emailToken, receipt, needsConsent });
            }}
          />
        </>
      )}
    </div>
  );
}
