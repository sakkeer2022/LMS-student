"use client";
import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";

/**
 * A modal dialog (native <dialog>): focus is trapped by the browser, Escape and the close button call
 * `onClose`, and the page behind it is inert. `dismissible={false}` hides the close button and ignores
 * Escape and backdrop clicks, for steps that must be finished.
 */
export function Dialog({
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
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const close = useRef(onClose);
  close.current = onClose;

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || !open || dialog.open) return;
    const previous = document.activeElement as HTMLElement | null;
    dialog.showModal();
    // Focus goes to the element marked data-autofocus (for example the first code box), else the browser's choice
    dialog.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    return () => {
      dialog.close();
      previous?.focus();
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="ui-dialog"
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        if (dismissible) close.current();
      }}
      onClick={(event) => {
        if (dismissible && event.target === event.currentTarget)
          close.current();
      }}
    >
      <div className="ui-dialog__panel">
        <div className="ui-dialog__head">
          <div>
            <h2 id={titleId} className="ui-dialog__title">
              {title}
            </h2>
            {subtitle && <p className="ui-dialog__subtitle">{subtitle}</p>}
          </div>
          {dismissible && (
            <button
              type="button"
              className="ui-dialog__close"
              aria-label="Close"
              onClick={onClose}
            >
              <X size={20} aria-hidden />
            </button>
          )}
        </div>
        <div className="ui-dialog__body">{children}</div>
        {footer && <div className="ui-dialog__footer">{footer}</div>}
      </div>
    </dialog>
  );
}
