import { useEffect, useRef } from "react";
import { Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PickerItem {
  id: string;
  label: string;
}

export interface PickerColumn {
  key: string;
  label: string;
  items: PickerItem[];
  selectedId: string | null;
  /** Shows a chevron on each row (the choice opens the next column); otherwise a check marks the pick */
  opensNext?: boolean;
  loading?: boolean;
  onSelect: (id: string) => void;
}

/**
 * Cascading single-choice lists side by side: each column narrows the next. Used where a choice is a path
 * through levels of a hierarchy (education category, board, class). Scrolls sideways when the columns do not fit.
 */
export function ColumnPicker({ columns }: { columns: PickerColumn[] }) {
  const scroller = useRef<HTMLDivElement>(null);
  // A new column opens on the right: bring it into view
  useEffect(() => {
    const el = scroller.current;
    if (el && typeof el.scrollTo === "function")
      el.scrollTo({ left: el.scrollWidth });
  }, [columns.length]);
  return (
    <div ref={scroller} className="flex overflow-x-auto">
      {columns.map((column) => (
        <ul
          key={column.key}
          aria-label={column.label}
          aria-busy={column.loading || undefined}
          className="m-0 flex min-h-48 min-w-48 flex-1 list-none flex-col gap-1 border-l border-border p-1 first:border-l-0"
        >
          {column.loading && (
            <li className="p-3 text-sm text-muted-foreground">Loading…</li>
          )}
          {column.items.map((item) => {
            const selected = item.id === column.selectedId;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => column.onSelect(item.id)}
                  className={cn(
                    "flex min-h-14 w-full items-center gap-2 rounded-md px-4 text-left text-base font-semibold outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                    selected
                      ? "bg-accent text-foreground"
                      : "text-text-secondary hover:bg-sunken",
                  )}
                >
                  <span className="flex-1">{item.label}</span>
                  {column.opensNext ? (
                    <ChevronRight aria-hidden className="size-4 flex-none" />
                  ) : (
                    selected && (
                      <Check aria-hidden className="size-4 flex-none" />
                    )
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      ))}
    </div>
  );
}
