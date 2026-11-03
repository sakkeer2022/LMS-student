"use client";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { cx } from "./utils";

/** A trigger that opens a panel on hover, focus or click and closes on Escape or an outside click. */
export function HoverMenu({
  label,
  className,
  triggerClassName,
  children,
}: {
  label: ReactNode;
  className?: string;
  triggerClassName?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const close = (event: Event) => {
      if (event instanceof KeyboardEvent && event.key !== "Escape") return;
      if (event instanceof MouseEvent && root.current?.contains(event.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener("keydown", close);
    document.addEventListener("mousedown", close);
    return () => {
      document.removeEventListener("keydown", close);
      document.removeEventListener("mousedown", close);
    };
  }, [open]);

  return (
    <div
      ref={root}
      className={cx("ui-hover-menu", className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <button
        type="button"
        className={triggerClassName}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        {label}
      </button>
      <div id={panelId} className="ui-hover-menu__panel" hidden={!open}>
        {children}
      </div>
    </div>
  );
}
