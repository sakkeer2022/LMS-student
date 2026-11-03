import { Check } from "lucide-react";

export type Step = 1 | 2 | 3 | 4;

const STEPS = [
  "Account",
  "Learning profile",
  "Guardian contact",
  "Consent",
] as const;

/** The four registration steps: done steps show a check, the current one its number in brand fill. */
export function Stepper({
  current,
  optional,
}: {
  current: Step;
  optional?: Step[];
}) {
  return (
    <ol className="signup-stepper" aria-label="Registration steps">
      {STEPS.map((label, index) => {
        const step = (index + 1) as Step;
        const state =
          step < current ? "done" : step === current ? "current" : "todo";
        return (
          <li
            key={label}
            className="signup-step"
            data-state={state}
            aria-current={state === "current" ? "step" : undefined}
          >
            <span className="signup-step__marker">
              {state === "done" ? <Check size={14} aria-hidden /> : step}
            </span>
            <span className="signup-step__label">
              {label}
              {optional?.includes(step) && (
                <span className="signup-step__optional"> (optional)</span>
              )}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
