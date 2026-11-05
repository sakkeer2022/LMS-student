"use client";
import type { ComponentType, ReactNode } from "react";
import {
  BookOpen,
  Check,
  ChevronRight,
  Code2,
  GraduationCap,
  Landmark,
  Languages,
  Leaf,
  Music,
  Palette,
  Pencil,
  School,
  Sparkles,
  Stethoscope,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/shadcn/skeleton";

/**
 * Presentation pieces of the learning step. They know nothing about the catalogue: the step passes names and
 * ids in, so a new category, board, class or subject needs no change here.
 */

// Decorative only: a category without an entry gets the generic book icon
const ICONS: Record<string, ComponentType<{ className?: string }>> = {
  academic: GraduationCap,
  "non-academic": Sparkles,
  school: School,
  university: Landmark,
  "jee-neet": Stethoscope,
  music: Music,
  languages: Languages,
  wellness: Leaf,
  coding: Code2,
  "research-skill": Palette,
};
export const iconFor = (code: string) => ICONS[code] ?? BookOpen;

const focus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

/**
 * One question of the journey, as a row on a timeline: a numbered dot (a tick once answered), a line down to
 * the next row, and the question with its answers. Nothing is boxed, so the answers carry the weight.
 */
export function Stage({
  id,
  n,
  done,
  title,
  hint,
  aside,
  children,
}: {
  id: string;
  n: number;
  done?: boolean;
  title: string;
  hint?: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section
      aria-labelledby={`${id}-title`}
      className="flex gap-4 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-300"
    >
      <Rail n={n} done={done} />
      <div className="flex min-w-0 flex-1 flex-col gap-3 pb-7">
        <div className="flex items-end justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <h3 id={`${id}-title`} className="text-base font-semibold">
              {title}
            </h3>
            {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
          </div>
          {aside}
        </div>
        {children}
      </div>
    </section>
  );
}

/** The dot and line down the left of a timeline row; the last row of the timeline hides its line. */
function Rail({ n, done }: { n: number; done?: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <span
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors",
          done
            ? "bg-primary text-primary-foreground"
            : "border-2 border-primary text-primary",
        )}
      >
        {done ? <Check className="size-4" aria-hidden /> : n}
      </span>
      <span data-rail className="mt-1 w-px flex-1 bg-border" />
    </div>
  );
}

/** The categories chosen so far, as the first answered row. Each segment takes the student back to that point. */
export function PathBar({
  segments,
  onRewind,
}: {
  segments: { id: string; label: string }[];
  onRewind: (index: number) => void;
}) {
  if (segments.length === 0) return null;
  return (
    <section className="flex gap-4">
      <Rail n={1} done />
      <nav
        aria-label="Your choices so far"
        className="flex min-w-0 flex-1 flex-wrap items-center gap-x-1 gap-y-0.5 pb-7 pt-0.5 text-base"
      >
        {segments.map((segment, index) => (
          <span key={segment.id} className="flex items-center gap-1">
            {index > 0 && (
              <ChevronRight className="size-3.5 text-muted-foreground" />
            )}
            <button
              type="button"
              onClick={() => onRewind(index)}
              title="Change this choice"
              className={cn(
                "rounded-md px-1 py-0.5 font-semibold underline-offset-4 hover:text-primary hover:underline",
                focus,
              )}
            >
              {segment.label}
            </button>
          </span>
        ))}
      </nav>
    </section>
  );
}

/** A large tile for a category: icon, name, and a hint of whether more choices follow. */
export function CategoryTile({
  code,
  name,
  leaf,
  selected,
  onSelect,
  large,
}: {
  code: string;
  name: string;
  leaf: boolean;
  selected: boolean;
  onSelect: () => void;
  large?: boolean;
}) {
  const Icon = iconFor(code);
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        "group relative flex items-center gap-3 rounded-2xl text-left transition-all",
        "hover:-translate-y-0.5 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        large ? "flex-col items-start gap-4 p-5" : "p-3.5",
        selected
          ? "bg-accent ring-2 ring-primary"
          : "bg-sunken hover:bg-accent",
        focus,
      )}
    >
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-xl bg-card text-primary shadow-sm transition-colors group-hover:bg-primary group-hover:text-primary-foreground",
          selected && "bg-primary text-primary-foreground",
          large ? "size-12" : "size-10",
        )}
      >
        <Icon className={large ? "size-6" : "size-5"} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className={cn("font-semibold", large ? "text-lg" : "text-sm")}>
          {name}
        </span>
        {large && (
          <span className="text-xs text-muted-foreground">
            {leaf ? "Choose to continue" : "See what is inside"}
          </span>
        )}
      </span>
      {selected ? (
        <Check
          className={cn(
            "size-4 shrink-0 text-primary",
            large && "absolute right-4 top-4",
          )}
          aria-hidden
        />
      ) : (
        !leaf && (
          <ChevronRight
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5",
              large && "absolute right-4 top-4",
            )}
            aria-hidden
          />
        )
      )}
    </button>
  );
}

/** Round toggles for a short list (boards, teaching languages). */
export function PillGroup({
  label,
  items,
  selectedId,
  onSelect,
}: {
  label: string;
  items: { id: string; name: string }[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          aria-pressed={item.id === selectedId}
          onClick={() => onSelect(item.id)}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors",
            item.id === selectedId
              ? "bg-primary text-primary-foreground"
              : "bg-sunken hover:bg-accent hover:text-accent-foreground",
            focus,
          )}
        >
          {item.id === selectedId && <Check className="size-3.5" aria-hidden />}
          {item.name}
        </button>
      ))}
    </div>
  );
}

/** Classes as a compact grid: the whole range is visible at once, nothing to scroll. */
export function ClassGrid({
  items,
  selectedId,
  onSelect,
}: {
  items: { id: string; name: string }[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div role="group" aria-label="Class" className="grid grid-cols-4 gap-2">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          aria-pressed={item.id === selectedId}
          onClick={() => onSelect(item.id)}
          className={cn(
            "rounded-xl px-2 py-2.5 text-sm font-semibold transition-colors",
            item.id === selectedId
              ? "bg-primary text-primary-foreground"
              : "bg-sunken hover:bg-accent hover:text-accent-foreground",
            focus,
          )}
        >
          {item.name}
        </button>
      ))}
    </div>
  );
}

// Token pairs, so every accent follows the theme and stays readable
const ACCENTS = [
  "bg-accent text-accent-foreground",
  "bg-info-subtle text-info-foreground",
  "bg-success-subtle text-success-foreground",
  "bg-warning-subtle text-warning-foreground",
  "bg-error-subtle text-error-foreground",
];
/** The same subject always gets the same colour, without a colour being written per subject. */
const accentFor = (name: string) =>
  ACCENTS[
    [...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % ACCENTS.length
  ]!;

/** A subject as a chip: it sits in a flowing row with the others, so a long list stays light. */
export function SubjectTile({
  name,
  selected,
  onToggle,
}: {
  name: string;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
      className={cn(
        "flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-4 text-sm font-medium transition-colors",
        selected
          ? "bg-primary text-primary-foreground"
          : "bg-sunken hover:bg-accent",
        focus,
      )}
    >
      <span
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
          selected ? "bg-primary-foreground/20" : accentFor(name),
        )}
      >
        {selected ? <Check className="size-4" aria-hidden /> : name[0]}
      </span>
      {name}
    </button>
  );
}

/** Placeholder tiles while a list loads: the layout does not jump when the real tiles arrive. */
export function TileSkeleton({
  count = 4,
  large,
}: {
  count?: number;
  large?: boolean;
}) {
  return (
    <div
      aria-busy="true"
      className={cn(
        "grid gap-3",
        large ? "sm:grid-cols-2" : "grid-cols-2 sm:grid-cols-3",
      )}
    >
      {Array.from({ length: count }, (_, i) => (
        <Skeleton
          key={i}
          className={large ? "h-[132px] rounded-xl" : "h-[62px] rounded-xl"}
        />
      ))}
    </div>
  );
}

/** How far along the step is, as a thin bar under the heading. */
export function Progress({ done, total }: { done: number; total: number }) {
  return (
    <div
      role="progressbar"
      aria-label="Questions answered"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={done}
      className="h-1.5 w-full overflow-hidden rounded-full bg-sunken"
    >
      <div
        className="h-full rounded-full bg-primary transition-all duration-500 motion-reduce:transition-none"
        style={{ width: `${total ? (done / total) * 100 : 0}%` }}
      />
    </div>
  );
}

/** One group of the learning list: where it sits, what it is, its subjects, and a way to change or drop it. */
export function GroupCard({
  path,
  title,
  subjects,
  onEdit,
  onRemove,
}: {
  path: string;
  title: string;
  subjects: string[];
  onEdit: () => void;
  onRemove: () => void;
}) {
  return (
    <li className="flex items-start gap-3 rounded-xl border border-border bg-card p-3.5 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-1 motion-safe:duration-300">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-success-subtle text-success-foreground">
        <Check className="size-4" aria-hidden />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex flex-col">
          {path && (
            <span className="text-xs text-muted-foreground">{path}</span>
          )}
          <span className="text-sm font-semibold">{title}</span>
        </div>
        <ul className="flex flex-wrap gap-1.5">
          {subjects.map((name) => (
            <li
              key={name}
              className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground"
            >
              {name}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex shrink-0 items-center gap-0.5">
        <button
          type="button"
          onClick={onEdit}
          aria-label={`Edit ${title}`}
          className={cn(
            "rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground",
            focus,
          )}
        >
          <Pencil className="size-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${title}`}
          className={cn(
            "rounded-md p-1.5 text-muted-foreground hover:bg-error-subtle hover:text-error-foreground",
            focus,
          )}
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>
    </li>
  );
}
