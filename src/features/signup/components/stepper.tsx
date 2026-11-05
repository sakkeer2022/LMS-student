import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

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
    <ol className="m-0 flex list-none flex-wrap items-center gap-x-4 gap-y-2 p-0 min-[1480px]:flex-nowrap" aria-label="Registration steps">
      {STEPS.map((label, index) => {
        const step = (index + 1) as Step;
        const state =
          step < current ? "done" : step === current ? "current" : "todo";
        return (
          <li
            key={label}
            className={cn(
              "group flex items-center gap-2 text-sm font-semibold whitespace-nowrap text-muted-foreground min-[1480px]:flex-1 min-[1480px]:last:flex-none",
              "min-[1480px]:after:h-px min-[1480px]:after:min-w-6 min-[1480px]:after:flex-1 min-[1480px]:after:bg-border min-[1480px]:last:after:hidden",
              state !== "todo" && "text-foreground",
            )}
            data-state={state}
            aria-current={state === "current" ? "step" : undefined}
          >
            <span
              className={cn(
                "flex size-6 flex-none items-center justify-center rounded-pill border border-border-strong bg-card text-xs tracking-[0.02em]",
                state !== "todo" && "border-primary bg-primary text-primary-foreground",
              )}
            >
              {state === "done" ? <Check size={14} aria-hidden /> : step}
            </span>
            <span>
              {label}
              {optional?.includes(step) && (
                <span className="font-normal text-muted-foreground"> (optional)</span>
              )}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
