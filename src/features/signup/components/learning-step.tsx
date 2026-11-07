"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import { AuthHead } from "@/components/auth/auth-controls";
import { Button } from "@/components/shadcn/button";
import {
  addGroup,
  groupPath,
  groupTitle,
  type LearningDraft,
  type LearningGroup,
} from "../catalogue";
import { EMPTY_EDUCATION, type EducationDraft } from "../api";
import { GroupBuilder } from "./group-builder";
import { GroupCard } from "./learning-parts";
import { EducationCard } from "./optional-questions";

/**
 * Onboarding step 2: the student builds a list of everything they want to learn. One group at a time is built
 * with the guided journey (category, board and class where asked, subjects) and added to the list, so school
 * subjects, exam preparation and a hobby can sit side by side, for example Class 9 Physics, JEE Physics and
 * Guitar. The list is what the next steps and the sign-up request carry.
 */
export function LearningStep({
  value,
  onBack,
  onSubmit,
}: {
  value: LearningDraft | null;
  onBack: () => void;
  onSubmit: (draft: LearningDraft) => void;
}) {
  const [groups, setGroups] = useState<LearningGroup[]>(value?.groups ?? []);
  const [education, setEducation] = useState<EducationDraft>(
    value?.education ?? EMPTY_EDUCATION,
  );
  // Open at first (nothing to show yet), then only when the student asks to add or edit
  const [building, setBuilding] = useState(groups.length === 0);
  const [editing, setEditing] = useState<LearningGroup | null>(null);
  const [status, setStatus] = useState({ started: false, adding: false });

  function add(group: LearningGroup): void {
    setGroups((all) => addGroup(all, group));
    setEditing(null);
    setBuilding(false);
  }

  function edit(group: LearningGroup): void {
    setGroups((all) => all.filter((g) => g !== group));
    setEditing(group);
    setBuilding(true);
  }

  // Cancelling an edit puts the group back where it was left
  function cancel(): void {
    if (editing) setGroups((all) => addGroup(all, editing));
    setEditing(null);
    setBuilding(false);
  }

  const count = groups.reduce((sum, g) => sum + g.subjects.length, 0);

  return (
    <div className="flex w-full flex-col gap-6">
      <AuthHead
        title="What would you like to learn?"
        lead="Add everything you are interested in: school subjects, exam preparation, music or anything else. You can mix them."
        size="form"
      />

      {groups.length > 0 && (
        <section aria-labelledby="list-title" className="flex flex-col gap-3">
          <h2 id="list-title" className="text-base font-semibold">
            Your list{" "}
            <span className="text-sm font-normal text-muted-foreground">
              · {count} {count === 1 ? "subject" : "subjects"}
            </span>
          </h2>
          <ul className="flex flex-col gap-2.5">
            {groups.map((group) => (
              <GroupCard
                key={`${group.trail.at(-1)?.id}-${group.board?.id}-${group.level?.id}`}
                path={groupPath(group)}
                title={groupTitle(group)}
                subjects={group.subjects.map((s) => s.name)}
                onEdit={() => edit(group)}
                onRemove={() =>
                  setGroups((all) => all.filter((g) => g !== group))
                }
              />
            ))}
          </ul>
        </section>
      )}

      {building ? (
        <GroupBuilder
          // A new journey each time, so nothing from the last one lingers
          key={editing ? "edit" : groups.length}
          initial={editing}
          onAdd={add}
          onCancel={groups.length > 0 || editing ? cancel : undefined}
          onStatus={setStatus}
        />
      ) : (
        <button
          type="button"
          onClick={() => setBuilding(true)}
          className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border px-4 py-5 text-sm font-semibold text-primary transition-colors hover:border-primary hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Plus aria-hidden className="size-4" />
          Add something else
        </button>
      )}

      <EducationCard value={education} onChange={setEducation} />

      <div className="sticky bottom-0 -mx-1 flex flex-col gap-2 border-t border-border bg-background/90 px-1 py-3 backdrop-blur">
        {building && status.started && !status.adding && groups.length > 0 && (
          <p className="text-xs text-text-secondary" aria-live="polite">
            Finish the choice above with “Add to my list”, or it will not be
            saved.
          </p>
        )}
        <div className="flex items-center justify-between gap-3">
          <Button type="button" variant="ghost" onClick={onBack}>
            Back
          </Button>
          <Button
            type="button"
            disabled={groups.length === 0 || editing !== null || status.adding}
            onClick={() => onSubmit({ groups, education })}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
