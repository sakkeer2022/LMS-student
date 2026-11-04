"use client";
import { useState, type FormEvent } from "react";
import { ShieldCheck } from "lucide-react";
import { AuthField, AuthHead } from "@/components/auth/auth-controls";
import { Button } from "@/components/shadcn/button";
import { Checkbox } from "@/components/shadcn/checkbox";
import { Label } from "@/components/shadcn/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/select";
import { countryOfMobile, normalizeMobile, type Country } from "@/lib/regions";
import {
  GUARDIAN_RELATIONSHIPS,
  guardianSchema,
  type GuardianValues,
} from "../schema";

export interface GuardianDetails extends GuardianValues {
  /** The mobile number as E.164, the form the backend stores */
  e164: string;
}

/**
 * Onboarding step 3. The guardian is a contact record, not an account. It is required for a student below
 * the country's consent age and optional above it: an adult may leave it empty, but a half-filled form is
 * still checked as a whole.
 */
export function GuardianStep({
  value,
  countries,
  studentEmail,
  required,
  onBack,
  onSubmit,
}: {
  value: GuardianDetails | null;
  countries: Country[];
  studentEmail: string;
  required: boolean;
  onBack: () => void;
  onSubmit: (guardian: GuardianDetails | null) => void;
}) {
  const [relationship, setRelationship] = useState<string>(
    value?.relationship ?? "",
  );
  const [notify, setNotify] = useState(value?.notifyReports ?? true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function submit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const raw = {
      fullName: String(data.get("fullName") ?? ""),
      relationship,
      mobileNumber: String(data.get("mobileNumber") ?? ""),
      email: String(data.get("email") ?? ""),
      notifyReports: notify,
    };
    const untouched =
      !raw.fullName.trim() &&
      !raw.relationship &&
      !raw.mobileNumber.trim() &&
      !raw.email.trim();
    if (untouched && !required) {
      setErrors({});
      onSubmit(null);
      return;
    }
    const parsed = guardianSchema.safeParse(raw);
    const next: Record<string, string> = {};
    if (!parsed.success) {
      for (const issue of parsed.error.issues)
        next[String(issue.path[0])] ??= issue.message;
    }
    const e164 = normalizeMobile(raw.mobileNumber);
    if (!next.mobileNumber && !countryOfMobile(e164, countries)) {
      next.mobileNumber = countries.length
        ? `Use a mobile number from ${countries.map((item) => item.name).join(" or ")}, with the country code.`
        : "Enter the mobile number with its country code.";
    }
    if (!next.email && parsed.success && parsed.data.email === studentEmail) {
      next.email = "Use a different email address from the student's.";
    }
    setErrors(next);
    if (Object.keys(next).length > 0 || !parsed.success) return;
    onSubmit({ ...parsed.data, e164 });
  }

  return (
    <form
      onSubmit={submit}
      noValidate
      className="flex w-full flex-col gap-6"
      aria-label="Parent or guardian contact"
    >
      <AuthHead
        title="Parent or guardian contact"
        lead={
          required
            ? "Step 3 of 4 · required for this student."
            : "Step 3 of 4 · optional. You can skip it, or add a contact now."
        }
        size="form"
      />

      <div
        role="note"
        className="flex items-start gap-3 rounded-md border border-info-border bg-info-subtle p-4"
      >
        <ShieldCheck
          aria-hidden
          className="mt-0.5 size-5 flex-none text-foreground"
        />
        <div className="flex flex-col gap-2 text-sm">
          <p className="font-semibold text-info-foreground">
            These are contact fields — not a parent account.
          </p>
          <p className="text-text-secondary">
            Amentorz does not create a login for parents or guardians. They
            receive session reminders, progress reports and payment receipts by
            SMS and email only.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AuthField
            name="fullName"
            label="Guardian full name"
            autoComplete="off"
            defaultValue={value?.fullName}
            maxLength={150}
            error={errors.fullName}
            required={required}
          />
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="relationship"
              className="gap-1 text-sm font-semibold"
            >
              Relationship to student
              {required && (
                <span aria-hidden className="text-error-foreground">
                  *
                </span>
              )}
            </Label>
            <Select value={relationship} onValueChange={setRelationship}>
              <SelectTrigger
                id="relationship"
                className="w-full"
                aria-invalid={Boolean(errors.relationship)}
              >
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {GUARDIAN_RELATIONSHIPS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.relationship && (
              <p className="text-sm text-error-foreground">
                {errors.relationship}
              </p>
            )}
          </div>
        </div>
        <AuthField
          name="mobileNumber"
          label="Guardian mobile number"
          type="tel"
          autoComplete="off"
          placeholder={countries[0] ? `${countries[0].dialCode} …` : "+"}
          defaultValue={value?.mobileNumber}
          hint="Session reminders and safety alerts are sent to this number."
          error={errors.mobileNumber}
          required={required}
        />
        <AuthField
          name="email"
          label="Guardian email address"
          type="email"
          autoComplete="off"
          defaultValue={value?.email}
          error={errors.email}
          required={required}
        />
        <div className="flex items-center gap-2">
          <Checkbox
            id="notifyReports"
            checked={notify}
            onCheckedChange={(checked) => setNotify(checked === true)}
            className="size-5 border-[1.5px] border-border-strong"
          />
          <Label htmlFor="notifyReports" className="text-sm font-normal">
            Also send progress reports and payment receipts to the guardian
          </Label>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <Button type="button" variant="ghost" onClick={onBack}>
          Back
        </Button>
        <Button type="submit">
          {required ? "Continue to consent" : "Continue"}
        </Button>
      </div>
    </form>
  );
}
