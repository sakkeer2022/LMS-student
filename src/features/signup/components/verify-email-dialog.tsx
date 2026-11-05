"use client";
import { useEffect, useRef, useState } from "react";
import { AppDialog } from "@/components/forms/AppDialog";
import { OtpInput } from "@/components/forms/OtpInput";
import { Button } from "@/components/shadcn/button";
import { ApiError } from "@/lib/api/contracts";
import { requestEmailCode, verifyEmailCode, type Challenge } from "../api";

const maskEmail = (email: string): string => {
  const [name = "", domain = ""] = email.split("@");
  return `${name.slice(0, 1)}***@${domain}`;
};

/**
 * Step 1 "Continue to verification": emails a 6-digit code to the address and verifies it. The code is
 * requested once when the dialog opens; "Resend" waits for the cooldown the backend returns. On success the
 * single-use email token is handed to the flow, which then carries on (the consent popup for a minor).
 */
export function VerifyEmailDialog({
  open,
  email,
  onClose,
  onVerified,
}: {
  open: boolean;
  email: string;
  onClose: () => void;
  onVerified: (emailVerificationToken: string) => void;
}) {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [sending, setSending] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const requested = useRef<string | null>(null);

  async function send(): Promise<void> {
    setSending(true);
    setError("");
    try {
      const sent = await requestEmailCode(email);
      setChallenge(sent);
      setCode("");
      setNow(Date.now());
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Unable to send the code. Try again.",
      );
    } finally {
      setSending(false);
    }
  }

  // One code per opening for this address (React strict mode runs effects twice in development)
  useEffect(() => {
    if (!open) {
      requested.current = null;
      return;
    }
    if (requested.current === email) return;
    requested.current = email;
    setChallenge(null);
    void send();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, email]);

  useEffect(() => {
    if (!open) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [open]);

  const wait = challenge
    ? Math.max(
        0,
        Math.ceil((new Date(challenge.resendAfter).getTime() - now) / 1000),
      )
    : 0;
  const minutes = challenge
    ? Math.max(
        1,
        Math.round((new Date(challenge.expiresAt).getTime() - now) / 60_000),
      )
    : null;

  async function verify(): Promise<void> {
    if (!challenge || code.length !== 6 || pending) return;
    setPending(true);
    setError("");
    try {
      const result = await verifyEmailCode(challenge.challengeId, code);
      onVerified(result.emailVerificationToken);
    } catch (err) {
      setCode("");
      setError(
        err instanceof ApiError
          ? err.message
          : "Unable to verify the code. Try again.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      title="Verify your email"
      subtitle={
        challenge
          ? `We sent a 6-digit code to ${maskEmail(email)}${minutes ? `. It expires in ${minutes} minutes.` : "."}`
          : `Sending a 6-digit code to ${maskEmail(email)}…`
      }
      footer={
        <>
          <Button
            variant="ghost"
            className="text-accent-foreground"
            onClick={onClose}
            disabled={pending}
          >
            Change email
          </Button>
          <Button
            onClick={() => void verify()}
            disabled={!challenge || code.length !== 6 || pending}
          >
            {pending ? "Please wait…" : "Verify"}
          </Button>
        </>
      }
    >
      <OtpInput
        value={code}
        onChange={setCode}
        disabled={pending}
        invalid={Boolean(error)}
        autoFocus
      />
      {error && (
        <p className="text-sm text-error-foreground" role="alert">
          {error}
        </p>
      )}
      <p className="text-sm text-text-secondary">
        Did not get it?{" "}
        <Button
          variant="ghost"
          className="h-auto p-0 font-semibold text-accent-foreground hover:bg-transparent hover:underline disabled:text-disabled-foreground"
          onClick={() => void send()}
          disabled={pending || sending || wait > 0}
        >
          {sending
            ? "Sending…"
            : wait > 0
              ? `Resend code in ${wait}s`
              : "Resend code"}
        </Button>
      </p>
    </AppDialog>
  );
}
