"use client";
import { useEffect, useState, type ComponentType } from "react";
import {
  Check,
  GraduationCap,
  Megaphone,
  MessageCircle,
  Newspaper,
  Search,
  Sparkles,
  Users,
  Instagram,
  Youtube,
} from "lucide-react";
import { AuthField } from "@/components/auth/auth-controls";
import { Skeleton } from "@/components/shadcn/skeleton";
import { cn } from "@/lib/utils";
import {
  EDUCATION_LEVELS,
  fetchReferralSources,
  type EducationDraft,
  type ReferralAnswer,
  type ReferralSource,
} from "../api";

const focus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

/** A chip the student can switch on and off again, so an optional question is easy to take back. */
function Chip({
  selected,
  onToggle,
  icon: Icon,
  children,
}: {
  selected: boolean;
  onToggle: () => void;
  icon?: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  children: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
      className={cn(
        "flex items-center gap-2 rounded-full py-2 pr-4 pl-3 text-sm font-medium transition-colors",
        selected
          ? "bg-primary text-primary-foreground"
          : "bg-sunken hover:bg-accent hover:text-accent-foreground",
        focus,
      )}
    >
      {selected ? (
        <Check aria-hidden className="size-4" />
      ) : (
        Icon && <Icon aria-hidden className="size-4" />
      )}
      {children}
    </button>
  );
}

// One icon per option code; a code added later falls back to the sparkle
const SOURCE_ICONS: Record<string, typeof Users> = {
  friend_family: Users,
  school_teacher: GraduationCap,
  instagram: Instagram,
  youtube: Youtube,
  whatsapp: MessageCircle,
  google_search: Search,
  poster_ad: Megaphone,
  news_blog: Newspaper,
  other: Sparkles,
};

/**
 * "How did you find Amentorz?" on the review step. Optional: the student can pick nothing, change their mind by
 * tapping the chip again, and a failure to load the options just hides the card. Options come from the API.
 */
export function ReferralCard({
  value,
  onChange,
}: {
  value: ReferralAnswer | null;
  onChange: (answer: ReferralAnswer | null) => void;
}) {
  const [sources, setSources] = useState<ReferralSource[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let current = true;
    fetchReferralSources()
      .then((list) => current && setSources(list))
      .catch(() => current && setFailed(true));
    return () => {
      current = false;
    };
  }, []);

  if (failed || (sources && sources.length === 0)) return null;

  return (
    <section
      aria-labelledby="referral-title"
      className="flex flex-col gap-4 rounded-2xl border border-border p-4"
    >
      <div>
        <h2 id="referral-title" className="text-base font-semibold">
          How did you find Amentorz?{" "}
          <span className="text-sm font-normal text-muted-foreground">
            · optional
          </span>
        </h2>
        <p className="text-sm text-text-secondary">
          Tell us what brought you here, so we can reach more students like you.
        </p>
      </div>
      {sources ? (
        <div
          role="group"
          aria-labelledby="referral-title"
          className="flex flex-wrap gap-2"
        >
          {sources.map((source) => (
            <Chip
              key={source.code}
              icon={SOURCE_ICONS[source.code] ?? Sparkles}
              selected={value?.sourceCode === source.code}
              onToggle={() =>
                onChange(
                  value?.sourceCode === source.code
                    ? null
                    : { sourceCode: source.code },
                )
              }
            >
              {source.name}
            </Chip>
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2" aria-busy="true">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="h-9 w-28 rounded-full" />
          ))}
        </div>
      )}
      {value?.sourceCode === "other" && (
        <AuthField
          name="referral-other"
          label="Tell us more"
          placeholder="For example, a poster at my tuition centre"
          maxLength={100}
          value={value.other ?? ""}
          onChange={(event) =>
            onChange({ sourceCode: "other", other: event.target.value })
          }
        />
      )}
    </section>
  );
}

/**
 * "A bit about your studies" on step 2. Every field is optional and independent; an empty card sends nothing.
 */
export function EducationCard({
  value,
  onChange,
}: {
  value: EducationDraft;
  onChange: (draft: EducationDraft) => void;
}) {
  return (
    <section
      aria-labelledby="education-title"
      className="flex flex-col gap-4 rounded-2xl border border-border p-4"
    >
      <div>
        <h2 id="education-title" className="text-base font-semibold">
          A bit about your studies{" "}
          <span className="text-sm font-normal text-muted-foreground">
            · optional
          </span>
        </h2>
        <p className="text-sm text-text-secondary">
          It helps us match you with the right tutor. Skip anything you prefer
          not to share.
        </p>
      </div>
      <div role="group" aria-label="Currently" className="flex flex-wrap gap-2">
        {EDUCATION_LEVELS.map((level) => (
          <Chip
            key={level.value}
            selected={value.level === level.value}
            onToggle={() =>
              onChange({
                ...value,
                level: value.level === level.value ? "" : level.value,
              })
            }
          >
            {level.label}
          </Chip>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <AuthField
          name="institution-name"
          label="School, college or organisation"
          maxLength={150}
          value={value.institutionName}
          onChange={(event) =>
            onChange({ ...value, institutionName: event.target.value })
          }
        />
        <AuthField
          name="education-detail"
          label="Class, course or role"
          placeholder="For example, Class 10 or B.Tech CSE"
          maxLength={100}
          value={value.detail}
          onChange={(event) =>
            onChange({ ...value, detail: event.target.value })
          }
        />
      </div>
    </section>
  );
}
