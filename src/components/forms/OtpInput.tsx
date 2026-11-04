"use client";
import { useRef, type ClipboardEvent, type KeyboardEvent } from "react";

/**
 * Six boxes for a one-time code. Typing moves on, Backspace moves back, and a pasted code fills every
 * box. `value` is the digits entered so far (at most `length`).
 */
export function OtpInput({
  value,
  onChange,
  length = 6,
  disabled,
  invalid,
  autoFocus,
  label = "Verification code",
}: {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  invalid?: boolean;
  autoFocus?: boolean;
  label?: string;
}) {
  const boxes = useRef<(HTMLInputElement | null)[]>([]);
  const focus = (index: number): void =>
    boxes.current[Math.max(0, Math.min(length - 1, index))]?.focus();

  function setDigit(index: number, digit: string): void {
    const chars = value.padEnd(length, " ").split("");
    chars[index] = digit;
    onChange(chars.join("").replace(/\s+$/, "").replace(/ /g, ""));
  }

  function onKeyDown(
    index: number,
    event: KeyboardEvent<HTMLInputElement>,
  ): void {
    if (event.key === "Backspace" && !value[index]) {
      event.preventDefault();
      if (index > 0) {
        onChange(value.slice(0, index - 1) + value.slice(index));
        focus(index - 1);
      }
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      focus(index - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      focus(index + 1);
    }
  }

  function onPaste(event: ClipboardEvent<HTMLInputElement>): void {
    const digits = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length);
    if (!digits) return;
    event.preventDefault();
    onChange(digits);
    focus(digits.length >= length ? length - 1 : digits.length);
  }

  return (
    <div role="group" aria-label={label} className="flex gap-[9px]">
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(element) => {
            boxes.current[index] = element;
          }}
          className="h-[50px] w-11 rounded-md border border-border-strong bg-card text-center text-lg font-semibold outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-[invalid=true]:border-error-foreground"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          pattern="[0-9]*"
          maxLength={1}
          value={value[index] ?? ""}
          disabled={disabled}
          aria-label={`Digit ${index + 1} of ${length}`}
          aria-invalid={invalid || undefined}
          data-autofocus={autoFocus && index === 0 ? "" : undefined}
          onFocus={(event) => event.target.select()}
          onKeyDown={(event) => onKeyDown(index, event)}
          onPaste={onPaste}
          onChange={(event) => {
            const digit = event.target.value.replace(/\D/g, "").slice(-1);
            if (!digit) return;
            setDigit(index, digit);
            focus(index + 1);
          }}
        />
      ))}
    </div>
  );
}
