"use client";
import { AlertTriangle, FileText } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AppDialog } from "@/components/forms/AppDialog";
import { SignaturePad, type SignaturePadHandle } from "@/components/forms/SignaturePad";
import { Button } from "@/components/shadcn/button";
import { Skeleton } from "@/components/shadcn/skeleton";
import { ApiError } from "@/lib/api/contracts";
import {
  fetchPolicies,
  policyFileUrl,
  signConsent,
  type ConsentReceipt,
  type PolicyView,
} from "../api";

const formatDate = (iso: string): string =>
  new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));

/**
 * The parent/guardian signs the Student Terms before the account exists (opened right after the email is
 * verified, for a student below the country's consent age). The title, version and date come from the
 * current Student Terms of the student's country; the preview is that document itself. "Sign and Continue"
 * sends the drawn signature and returns the single-use consent token.
 */
export function ConsentDialog({
  open,
  country,
  studentFullName,
  studentDateOfBirth,
  onClose,
  onSigned,
}: {
  open: boolean;
  country: string;
  studentFullName: string;
  studentDateOfBirth: string;
  onClose: () => void;
  onSigned: (receipt: ConsentReceipt) => void;
}) {
  const [policy, setPolicy] = useState<PolicyView | null>(null);
  const [loadError, setLoadError] = useState("");
  const [hasInk, setHasInk] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const pad = useRef<SignaturePadHandle>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setPolicy(null);
    setLoadError("");
    fetchPolicies(country)
      .then((policies) => {
        if (cancelled) return;
        const terms = policies.find((item) => item.type === "student_terms");
        if (terms) setPolicy(terms);
        else setLoadError("The Student Terms are not available right now.");
      })
      .catch((err: unknown) => {
        if (!cancelled)
          setLoadError(
            err instanceof ApiError && err.status === 503
              ? "The Student Terms for your country are not available yet. Please try again later."
              : "Unable to load the Student Terms. Try again.",
          );
      });
    return () => {
      cancelled = true;
    };
  }, [open, country]);

  async function sign(): Promise<void> {
    if (!policy || pending) return;
    const signature = await pad.current?.toPng();
    if (!signature) return;
    setPending(true);
    setError("");
    try {
      onSigned(
        await signConsent({
          policyId: policy.id,
          studentFullName,
          studentDateOfBirth,
          signature,
        }),
      );
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Unable to sign. Try again.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      title="Review and sign the Student Terms"
      subtitle={
        policy
          ? `${policy.title} v${policy.version} · Effective ${formatDate(policy.effectiveAt)}`
          : undefined
      }
      footer={
        <Button
          onClick={() => void sign()}
          disabled={!policy || !hasInk || pending}
        >
          {pending ? "Signing…" : "Sign and Continue"}
        </Button>
      }
    >
      <div
        className="flex gap-3 rounded-md border border-warning-border bg-warning-subtle px-5 py-4 text-sm"
        role="note"
      >
        <AlertTriangle size={20} aria-hidden className="shrink-0 text-warning-foreground" />
        <div>
          <p className="mb-1 font-semibold text-warning-foreground">
            Parent/guardian consent required
          </p>
          <p>
            This student is below the required age. Parent/guardian contact
            details and consent must be provided to proceed.
          </p>
        </div>
      </div>

      {loadError ? (
        <p className="text-sm text-error-foreground" role="alert">
          {loadError}
        </p>
      ) : (
        <section className="flex flex-col gap-4 rounded-md bg-sunken p-4" aria-label="Document preview">
          <div className="flex items-center gap-3 text-sm font-semibold">
            <FileText size={20} aria-hidden />
            {policy ? <span>{policy.title}</span> : <Skeleton className="h-5 w-48" />}
          </div>
          {!policy && <Skeleton className="h-60 w-full rounded-panel" aria-busy="true" />}
          {policy && (
            <iframe
              className="h-60 w-full rounded-panel border border-border bg-card"
              src={`${policyFileUrl(policy.id)}#toolbar=0&navpanes=0`}
              title={`${policy.title} (PDF)`}
            />
          )}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Document preview</span>
            {policy && (
              <a
                className="font-semibold tracking-[0.02em] text-primary"
                href={policyFileUrl(policy.id)}
                target="_blank"
                rel="noopener noreferrer"
              >
                View full document
              </a>
            )}
          </div>
        </section>
      )}

      <section aria-labelledby="signature-heading">
        <div className="mb-3 flex items-center justify-between">
          <h3 id="signature-heading" className="text-sm font-semibold">
            Signature
          </h3>
          <Button
            variant="ghost"
            className="h-auto p-0 font-semibold text-accent-foreground hover:bg-transparent hover:underline disabled:text-disabled-foreground"
            onClick={() => pad.current?.clear()}
            disabled={!hasInk || pending}
          >
            Clear
          </Button>
        </div>
        <SignaturePad
          ref={pad}
          onInkChange={setHasInk}
          label="Draw the parent or guardian's signature here"
        />
      </section>
      {error && (
        <p className="text-sm text-error-foreground" role="alert">
          {error}
        </p>
      )}
    </AppDialog>
  );
}
