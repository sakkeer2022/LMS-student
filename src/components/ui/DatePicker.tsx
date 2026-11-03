"use client";
import { CalendarDays } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import {
  formatDisplayDate,
  fromIsoDate,
  maskDisplayDate,
  parseDisplayDate,
  toIsoDate,
} from "@/lib/dates";

/**
 * A date field you can type in (`dd / mm / yyyy`) or pick from a calendar, with month and year dropdowns so
 * a date of birth is a few clicks away. The value is always a calendar date, `YYYY-MM-DD` or "" (no time and
 * no time zone), so it is safe to send to the backend. Shared by every screen that asks for a date.
 */
export function DatePicker({
  id,
  name,
  value,
  onChange,
  min,
  max,
  invalid,
  describedBy,
  placeholder = "dd / mm / yyyy",
  required,
}: {
  id: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  /** Earliest and latest date allowed, as `YYYY-MM-DD` (the field accepts only real dates in this range). */
  min?: string;
  max?: string;
  invalid?: boolean;
  describedBy?: string;
  placeholder?: string;
  required?: boolean;
}) {
  const [text, setText] = useState(formatDisplayDate(value));
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const panelId = useId();

  // The field follows the value when it is changed from outside (a picked day, a reset form)
  useEffect(() => {
    setText(
      formatDisplayDate(value) ||
        (value === "" && text.replace(/\D/g, "").length === 8 ? text : ""),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const away = (event: MouseEvent): void => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent): void => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("mousedown", away);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  const earliest = min ? fromIsoDate(min) : undefined;
  const latest = max ? fromIsoDate(max) : undefined;
  const selected = fromIsoDate(value);

  function accept(iso: string): void {
    const inRange = (!min || iso >= min) && (!max || iso <= max);
    onChange(iso && inRange ? iso : "");
  }

  return (
    <div className="ui-date" ref={root}>
      <input
        id={id}
        name={name}
        className="ui-date__input"
        inputMode="numeric"
        autoComplete="bday"
        placeholder={placeholder}
        value={text}
        required={required}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onChange={(event) => {
          const masked = maskDisplayDate(event.target.value);
          setText(masked);
          accept(parseDisplayDate(masked));
        }}
      />
      <button
        type="button"
        className="ui-date__toggle"
        aria-label={
          value ? `Change date, ${formatDisplayDate(value)}` : "Choose a date"
        }
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((current) => !current)}
      >
        <CalendarDays size={18} aria-hidden />
      </button>
      {open && (
        <div
          id={panelId}
          className="ui-date__panel"
          role="dialog"
          aria-label="Choose a date"
        >
          <DayPicker
            mode="single"
            captionLayout="dropdown"
            selected={selected}
            defaultMonth={selected ?? latest}
            startMonth={earliest ?? new Date(1900, 0)}
            endMonth={latest ?? new Date(new Date().getFullYear() + 20, 11)}
            disabled={[
              ...(earliest ? [{ before: earliest }] : []),
              ...(latest ? [{ after: latest }] : []),
            ]}
            onSelect={(day) => {
              if (!day) return;
              const iso = toIsoDate(day);
              setText(formatDisplayDate(iso));
              onChange(iso);
              setOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
