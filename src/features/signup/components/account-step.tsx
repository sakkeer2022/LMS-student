"use client";
import { useState, type FormEvent } from "react";
import { Button, ButtonLink, Form, Heading, Text } from "@/components/ui";
import { LoginDateField, LoginField } from "@/components/ui/login-controls";
import { toIsoDate } from "@/lib/dates";
import { countryOfMobile, normalizeMobile, type Country } from "@/lib/regions";
import { accountSchema, type AccountValues } from "../schema";

export interface AccountDraft {
  fullName: string;
  dateOfBirth: string;
  email: string;
  mobileNumber: string;
  password: string;
}

export interface AccountSubmission extends AccountValues {
  /** The mobile number as E.164, the form the backend stores */
  e164: string;
  country: Country;
}

/**
 * Onboarding step 1. The mobile number decides the country (from its dialling code, using the countries the
 * backend serves), which in turn decides the policies and the age that needs a guardian. Nothing about a
 * country is written here.
 */
export function AccountStep({
  draft,
  countries,
  emailVerified,
  pending,
  onSubmit,
}: {
  draft: AccountDraft;
  countries: Country[];
  emailVerified: boolean;
  pending: boolean;
  onSubmit: (submission: AccountSubmission, draft: AccountDraft) => void;
}) {
  const [dateOfBirth, setDateOfBirth] = useState(draft.dateOfBirth);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const ages = [
    ...new Set(countries.map((country) => country.guardianConsentAge)),
  ];
  const guardianNote =
    ages.length === 1
      ? `If the student is under ${ages[0]}, a parent or guardian's contact details are collected in step 3.`
      : "If the student is below the age that needs a guardian, a parent or guardian's contact details are collected in step 3.";

  function submit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const raw: AccountDraft = {
      fullName: String(data.get("fullName") ?? ""),
      dateOfBirth,
      email: String(data.get("email") ?? ""),
      mobileNumber: String(data.get("mobileNumber") ?? ""),
      password: String(data.get("password") ?? ""),
    };
    const parsed = accountSchema.safeParse(raw);
    const next: Record<string, string> = {};
    if (!parsed.success) {
      for (const issue of parsed.error.issues)
        next[String(issue.path[0])] ??= issue.message;
    }
    const e164 = normalizeMobile(raw.mobileNumber);
    const country = countryOfMobile(e164, countries);
    if (!next.mobileNumber && !country) {
      next.mobileNumber = countries.length
        ? `Use a mobile number from ${countries.map((item) => item.name).join(" or ")}, with the country code.`
        : "Enter the mobile number with its country code.";
    }
    setErrors(next);
    if (Object.keys(next).length > 0 || !parsed.success || !country) return;
    onSubmit({ ...parsed.data, e164, country }, raw);
  }

  return (
    <Form
      onSubmit={submit}
      noValidate
      className="signup-form"
      pending={pending}
      aria-label="Create your student account"
    >
      <div className="login-head">
        <Heading level={1} className="signup-title">
          Create your student account
        </Heading>
        <Text className="login-subtitle">
          Step 1 of 4 · takes about three minutes. You can browse the free
          library without an account.
        </Text>
      </div>

      <div className="signup-fields">
        <div className="signup-row">
          <LoginField
            name="fullName"
            label="Student full name"
            autoComplete="name"
            defaultValue={draft.fullName}
            maxLength={150}
            error={errors.fullName}
            required
          />
          <LoginDateField
            name="dateOfBirth"
            label="Date of birth"
            value={dateOfBirth}
            onChange={setDateOfBirth}
            max={toIsoDate(new Date())}
            error={errors.dateOfBirth}
            required
          />
        </div>
        <LoginField
          name="email"
          label="Email address"
          type="email"
          autoComplete="email"
          defaultValue={draft.email}
          readOnly={emailVerified}
          verified={emailVerified}
          hint={
            emailVerified
              ? "Email verified."
              : "We send a 6-digit verification code to this address."
          }
          error={errors.email}
          required
        />
        <div className="signup-row">
          <LoginField
            name="mobileNumber"
            label="Mobile number"
            type="tel"
            autoComplete="tel"
            placeholder={countries[0] ? `${countries[0].dialCode} …` : "+"}
            defaultValue={draft.mobileNumber}
            error={errors.mobileNumber}
            required
          />
          <LoginField
            name="password"
            label="Create password"
            type="password"
            autoComplete="new-password"
            defaultValue={draft.password}
            hint="Minimum 8 characters, with one number."
            error={errors.password}
            reveal
            required
          />
        </div>
      </div>

      <Text className="signup-note">{guardianNote}</Text>

      <div className="signup-actions signup-actions--end">
        <ButtonLink href="/" variant="ghost">
          Cancel
        </ButtonLink>
        <Button type="submit" disabled={pending}>
          Continue to verification
        </Button>
      </div>
    </Form>
  );
}
