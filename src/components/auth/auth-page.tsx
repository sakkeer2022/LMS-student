import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** The split sign-in / sign-up page: a brand panel beside the form column. */
export function AuthPage({
  brand,
  children,
  alignTop = false,
}: {
  brand: ReactNode;
  children: ReactNode;
  /** Long forms start at the top of the column instead of centring */
  alignTop?: boolean;
}) {
  return (
    <div className="flex min-h-screen bg-card">
      {brand}
      <main
        id="main"
        className={cn(
          "flex min-w-0 flex-1 justify-center px-6 py-14 lg:px-20",
          alignTop ? "items-start" : "items-center",
        )}
      >
        {children}
      </main>
    </div>
  );
}
