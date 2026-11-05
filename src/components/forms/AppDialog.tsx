"use client";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/shadcn/dialog";
import { cn } from "@/lib/utils";

/**
 * A modal dialog (Radix): focus is trapped, Escape and the close button call `onClose`, and the page behind
 * it is inert. `dismissible={false}` hides the close button and ignores Escape and outside clicks, for steps
 * that must be finished. It does not scale in (only fades): a signature canvas inside is sized from its box
 * when the dialog opens, so the box must be at its final size then.
 */
export function AppDialog({
  open,
  onClose,
  title,
  subtitle,
  footer,
  dismissible = true,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  footer?: ReactNode;
  dismissible?: boolean;
  children: ReactNode;
}) {
  const keep = (event: Event): void => {
    if (!dismissible) event.preventDefault();
  };
  return (
    <Dialog open={open} onOpenChange={(next) => !next && dismissible && onClose()}>
      <DialogContent
        showCloseButton={false}
        onEscapeKeyDown={keep}
        onPointerDownOutside={keep}
        onInteractOutside={keep}
        // Focus goes to the element marked data-autofocus (for example the first code box), else the first control
        onOpenAutoFocus={(event) => {
          const target = (event.currentTarget as HTMLElement).querySelector<HTMLElement>("[data-autofocus]");
          if (target) {
            event.preventDefault();
            target.focus();
          }
        }}
        className={cn(
          "max-h-[calc(100vh-2rem)] w-[min(560px,calc(100vw-2rem))] max-w-none sm:max-w-none gap-0 overflow-hidden rounded-panel border-0 p-0 shadow-lg",
          "flex flex-col data-[state=closed]:zoom-out-100 data-[state=open]:zoom-in-100",
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border-subtle px-6 py-5">
          <div>
            <DialogTitle className="text-xl leading-7 font-semibold tracking-[-0.005em]">{title}</DialogTitle>
            {subtitle ? (
              <DialogDescription className="mt-1 text-xs text-muted-foreground">{subtitle}</DialogDescription>
            ) : (
              <DialogDescription className="sr-only">{title}</DialogDescription>
            )}
          </div>
          {dismissible && (
            <DialogClose
              aria-label="Close"
              className="flex size-8 flex-none items-center justify-center rounded-md text-foreground outline-none hover:bg-background focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <X size={20} aria-hidden />
            </DialogClose>
          )}
        </div>
        <div className="flex min-h-0 flex-col gap-5 overflow-y-auto p-6">{children}</div>
        {footer && (
          <div className="flex justify-end gap-3 border-t border-border-subtle px-6 py-4">{footer}</div>
        )}
      </DialogContent>
    </Dialog>
  );
}
