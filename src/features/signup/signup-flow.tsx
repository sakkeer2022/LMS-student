"use client";
import { useEffect, useState } from "react";
import { Button, ButtonLink, Heading, Text } from "@/components/ui";
import { completedYears } from "@/lib/dates";
import { fetchCountries, type Country } from "@/lib/regions";
import {
  AccountStep,
  type AccountDraft,
  type AccountSubmission,
} from "./components/account-step";
import { ConsentDialog } from "./components/consent-dialog";
import { Stepper, type Step } from "./components/stepper";
import { VerifyEmailDialog } from "./components/verify-email-dialog";
import type { ConsentReceipt } from "./api";

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
    if (!sameStudent) setConsent(null);
    if (submission?.email !== values.email) setEmailToken(null);
    setDraft(raw);
    setSubmission(values);
    proceed({ token, receipt, needsConsent: minor });
  }

  if (loadError) {
    return (
      <div className="signup-form">
        <Heading level={1} className="signup-title">
          Create your student account
        </Heading>
        <Text className="signup-error" role="alert">
          We could not load the registration form. Check your connection and try
          again.
        </Text>
        <div>
          <Button onClick={load}>Try again</Button>
        </div>
      </div>
    );
  }
  if (!countries) {
    return (
      <div className="signup-form" aria-busy="true">
        <Text className="login-subtitle">Loading…</Text>
      </div>
    );
  }

  return (
    <div className="signup-form">
      <Stepper current={step} optional={optional} />
      {step === 1 ? (
        <AccountStep
          draft={draft}
          countries={countries}
          emailVerified={Boolean(emailToken)}
          pending={dialog !== null}
          onSubmit={submitAccount}
        />
      ) : (
        <div className="signup-form">
          <div className="login-head">
            <Heading level={1} className="signup-title">
              Your learning profile
            </Heading>
            <Text className="login-subtitle">
              Step 2 of 4 · this step is being set up.
            </Text>
          </div>
          <Text className="signup-note">
            Your account details are kept while you wait.
          </Text>
          <div className="signup-actions">
            <Button variant="ghost" onClick={() => setStep(1)}>
              Back
            </Button>
            <ButtonLink href="/" variant="ghost">
              Cancel
            </ButtonLink>
          </div>
        </div>
      )}

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
