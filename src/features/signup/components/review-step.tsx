"use client";
import { useEffect, useState, type ReactNode } from "react";
import { BookOpen, UserCircle, Users } from "lucide-react";
import { AuthError, AuthHead } from "@/components/auth/auth-controls";
import { Button } from "@/components/shadcn/button";
import { Checkbox } from "@/components/shadcn/checkbox";
import { Label } from "@/components/shadcn/label";
import { fetchPolicies, policyFileUrl, type PolicyView } from "../api";
import { groupPath, groupTitle, type LearningDraft } from "../catalogue";
import { relationshipLabel } from "../schema";
import type { GuardianDetails } from "./guardian-step";

type PolicyType = "terms_of_use" | "privacy_policy" | "child_safety_policy";

function RecapRow({
  icon,
  label,
  value,
  detail,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <span className="flex items-center gap-2 text-sm text-text-secondary">
        {icon}
        {label}
      </span>
      <span className="text-right">
        <span className="block text-base font-semibold">{value}</span>
        {detail && (
          <span className="block text-xs text-text-secondary">{detail}</span>
        )}
      </span>
    </div>
  );
}

function PolicyLink({ policy }: { policy: PolicyView }) {
  return (
    <a
      href={policyFileUrl(policy.id)}
      target="_blank"
      rel="noreferrer"
      className="font-semibold text-accent-foreground underline underline-offset-2"
    >
      {policy.title}
    </a>
  );
}

/**
 * Onboarding step 4. The recap shows only what was collected, and the policies come from the API for the
 * student's country: their titles link to the stored documents and nothing about their content is written
 * here. The child safety policy is asked of a student below the country's consent age only.
 */
export function ReviewStep({
  country,
  studentName,
  profile,
  guardian,
  minor,
  error,
  onBack,
  onCreate,
}: {
  country: string;
  studentName: string;
  profile: LearningDraft | null;
  guardian: GuardianDetails | null;
  minor: boolean;
  error?: string | null;
  onBack: () => void;
  onCreate: (acceptedPolicyIds: string[]) => Promise<void>;
}) {
  const [policies, setPolicies] = useState<PolicyView[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [accepted, setAccepted] = useState<Record<string, boolean>>({});
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    let current = true;
    setFailed(false);
    setPolicies(null);
    fetchPolicies(country)
      .then((list) => current && setPolicies(list))
      .catch(() => current && setFailed(true));
    return () => {
      current = false;
    };
  }, [country, attempt]);

  const wanted: PolicyType[] = minor
    ? ["terms_of_use", "privacy_policy", "child_safety_policy"]
    : ["terms_of_use", "privacy_policy"];
  const byType = (type: PolicyType) =>
    policies?.find((policy) => policy.type === type);
  const required = wanted.map(byType);
  const ready = required.every(Boolean);
  const allAccepted =
    ready && required.every((policy) => accepted[policy!.id] === true);
  const toggle = (id: string) => (checked: boolean | "indeterminate") =>
    setAccepted((state) => ({ ...state, [id]: checked === true }));
  const terms = byType("terms_of_use");
  const privacy = byType("privacy_policy");
  const safety = byType("child_safety_policy");

  return (
    <div className="flex w-full flex-col gap-6">
      <AuthHead
        title="Review and consent"
        lead={`Step 4 of 4 · check the details below, then accept ${
          wanted.length === 3 ? "all three policies" : "both policies"
        }.`}
        size="form"
      />

      <div className="flex flex-col rounded-md bg-sunken px-4 py-2">
        <RecapRow
          icon={<UserCircle aria-hidden className="size-5" />}
          label="Student"
          value={studentName}
        />
        {profile?.groups.map((group, index) => (
          <RecapRow
            key={index}
            icon={<BookOpen aria-hidden className="size-5" />}
            label={groupPath(group) || "What you want to learn"}
            value={groupTitle(group)}
            detail={group.subjects.map((subject) => subject.name).join(", ")}
          />
        ))}
        {guardian && (
          <RecapRow
            icon={<Users aria-hidden className="size-5" />}
            label="Parent / guardian contact"
            value={`${guardian.fullName} (${relationshipLabel(guardian.relationship)})`}
          />
        )}
      </div>

      {failed && (
        <div className="flex flex-col items-start gap-3">
          <AuthError>
            We could not load the policies for your country. Try again in a
            moment.
          </AuthError>
          <Button variant="outline" onClick={() => setAttempt((n) => n + 1)}>
            Try again
          </Button>
        </div>
      )}
      {!failed && !policies && (
        <p className="text-sm text-text-secondary" aria-busy="true">
          Loading the policies…
        </p>
      )}

      {terms && privacy && (
        <div className="flex flex-col gap-5">
          <ConsentRow
            id="accept-terms"
            checked={accepted[terms.id] === true}
            onChange={toggle(terms.id)}
          >
            I accept the <PolicyLink policy={terms} />.
          </ConsentRow>
          <ConsentRow
            id="accept-privacy"
            checked={accepted[privacy.id] === true}
            onChange={toggle(privacy.id)}
          >
            I have read the <PolicyLink policy={privacy} /> and consent to the
            processing of the student&apos;s personal data.
          </ConsentRow>
          {minor && safety && (
            <ConsentRow
              id="accept-safety"
              checked={accepted[safety.id] === true}
              onChange={toggle(safety.id)}
            >
              A parent or guardian has approved this registration, and I have
              read the <PolicyLink policy={safety} />.
            </ConsentRow>
          )}
        </div>
      )}
      {policies && !ready && (
        <AuthError>
          The policies for your country are not available yet. Please try again
          later.
        </AuthError>
      )}
      {error && <AuthError>{error}</AuthError>}

      <div className="flex items-center justify-between gap-3">
        <Button type="button" variant="ghost" onClick={onBack}>
          Back
        </Button>
        <Button
          type="button"
          disabled={!allAccepted || creating}
          onClick={() => {
            setCreating(true);
            onCreate(required.map((policy) => policy!.id)).finally(() =>
              setCreating(false),
            );
          }}
        >
          {creating ? "Creating…" : "Create account"}
        </Button>
      </div>
    </div>
  );
}

function ConsentRow({
  id,
  checked,
  onChange,
  children,
}: {
  id: string;
  checked: boolean;
  onChange: (checked: boolean | "indeterminate") => void;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        className="mt-0.5 size-5 border-[1.5px] border-border-strong"
      />
      <Label htmlFor={id} className="block text-sm leading-5 font-semibold">
        {children}
      </Label>
    </div>
  );
}
