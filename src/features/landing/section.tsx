import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/** The padded, centred band every landing section sits in (Figma 1:948). */
export function Section({ className, ...props }: ComponentProps<"section">) {
  return (
    <section
      className={cn("px-20 py-[110px] text-center max-[1100px]:px-5", className)}
      {...props}
    />
  );
}

export function SectionTitle({ className, ...props }: ComponentProps<"h2">) {
  return (
    <h2
      className={cn(
        "mx-auto max-w-[719px] text-[32px] leading-[1.148] font-bold tracking-[-1px] min-[641px]:text-[48px] min-[641px]:tracking-[-1.632px]",
        className,
      )}
      {...props}
    />
  );
}

export function SectionLead({ className, ...props }: ComponentProps<"p">) {
  return <p className={cn("mx-auto mt-[31px] max-w-[649px]", className)} {...props} />;
}
